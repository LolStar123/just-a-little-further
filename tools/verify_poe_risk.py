import functools
import http.server
import json
import os
import statistics
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright


HERE = Path(__file__).resolve().parent
ROOT = HERE if (HERE / "dist").is_dir() else HERE.parent
checks = []


def check(name, value):
    print(f"{name}: {bool(value)}", flush=True)
    checks.append({"name": name, "pass": bool(value)})
    assert value, name


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = None
base_url = os.environ.get("POE_RISK_URL")
if not base_url:
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT / "dist"))
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base_url = f"http://127.0.0.1:{server.server_port}"

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 940})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{base_url}/demo.html?scene=poe", wait_until="networkidle")
        page.wait_for_function(
            "window.__siteDiagnostics?.().mini.priceDistribution?.n === 240"
        )
        data = page.evaluate(
            """async () => {
                const {families, priceSamples, priceSummary} = await import('./poe-statistics.js');
                return families.map((family, index) => {
                    const records = priceSamples(index);
                    const values = records.map(record => record.value);
                    const domain = [-family.cost * 2, Math.max(...values) * 1.2];
                    return {records, cost: family.cost, summary: priceSummary(records, 240, domain, family.cost)};
                });
            }"""
        )
        for index, result in enumerate(data):
            values = [record["value"] for record in result["records"]]
            summary = result["summary"]
            gains = sum(max(0, value) for value in values)
            losses = sum(max(0, -value) for value in values)
            mean = statistics.mean(values)
            standard_deviation = statistics.pstdev(values)
            check(
                f"{index} EV and risk ratio match raw prices",
                abs(summary["netEV"] - mean) < 1e-10
                and abs(summary["ev"] - mean - result["cost"]) < 1e-10
                and abs(summary["sharpe"] - mean / standard_deviation) < 1e-10,
            )
            check(
                f"{index} profit factor uses actual gains and losses",
                abs(summary["profitFactor"] - gains / losses) < 1e-10,
            )
            check(
                f"{index} top five percent contribution is correct",
                abs(
                    summary["tailShare"]
                    - sum(max(0, value) for value in sorted(values, reverse=True)[:12])
                    / gains
                )
                < 1e-10,
            )
            check(
                f"{index} raw frequency chart counts all outcomes",
                sum(summary["bins"]) == 240 and len(summary["density"]) == 121,
            )

        first = page.evaluate("window.__siteDiagnostics().mini.priceDistribution")
        page.wait_for_timeout(850)
        last = page.evaluate("window.__siteDiagnostics().mini.priceDistribution")
        check(
            "incoming prices change calculations and trace",
            first["values"] != last["values"]
            and first["netEV"] != last["netEV"]
            and first["points"] != last["points"],
        )
        y_values = [point[1] for point in last["points"]]
        turns = sum(
            1
            for i in range(1, len(y_values) - 1)
            if (y_values[i] - y_values[i - 1])
            * (y_values[i + 1] - y_values[i])
            < 0
        )
        check(
            "rolling trace is visibly jagged",
            max(y_values) - min(y_values) > 35 and turns >= 8,
        )
        sheet = page.evaluate("window.__siteDiagnostics().mini.sheet")
        check(
            "table is calmer than the calculation stream",
            len(sheet["rows"]) <= 3
            and sheet["rate"] == 2.8
            and sheet["calculationRate"] == 18,
        )
        old_choice = page.evaluate("window.__siteDiagnostics().mini.choice")
        page.wait_for_timeout(6200)
        check(
            "item families reshuffle automatically",
            page.evaluate("window.__siteDiagnostics().mini.choice") != old_choice,
        )
        page.screenshot(path=str(ROOT / "output" / "poe-risk-demo.png"))
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_function("window.__boot")
        if page.locator("#little-boot").is_visible():
            for _ in range(3):
                page.locator("#boot-push").click()
        page.wait_for_function("!document.querySelector('#little-boot')")
        for width, height in ((1440, 940), (390, 844), (320, 568)):
            page.set_viewport_size({"width": width, "height": height})
            frame = page.locator('.sketch-demo[data-scene="poe"]')
            frame.scroll_into_view_if_needed()
            page.wait_for_timeout(900)
            check(
                f"{width} price sketch has no internal scrolling",
                frame.evaluate(
                    "frame => frame.contentDocument.documentElement.scrollHeight <= frame.clientHeight + 1 && frame.contentDocument.documentElement.scrollWidth <= frame.clientWidth"
                ),
            )
            before = page.evaluate(
                """() => ({
                    points: document.querySelector('.sketch-demo[data-scene="poe"]')
                        .contentDocument.querySelector('.toy').dataset.threadPoints,
                    path: [...document.querySelectorAll('.pen-thread .thread-segment')]
                        .map(path => path.getAttribute('d')).join('|')
                })"""
            )
            page.wait_for_timeout(350)
            after = page.evaluate(
                """() => ({
                    points: document.querySelector('.sketch-demo[data-scene="poe"]')
                        .contentDocument.querySelector('.toy').dataset.threadPoints,
                    path: [...document.querySelectorAll('.pen-thread .thread-segment')]
                        .map(path => path.getAttribute('d')).join('|')
                })"""
            )
            check(f"{width} rolling trace has 32 outcomes", len(json.loads(after["points"])) == 32)
            check(f"{width} rolling trace advances", before["points"] != after["points"])
            check(f"{width} rolling trace drives the page stroke", before["path"] != after["path"])
            page.screenshot(path=str(ROOT / "output" / f"poe-risk-{width}.png"))
        check("no browser exceptions", not errors)
        browser.close()
finally:
    if server:
        server.shutdown()

Path(ROOT / "output" / "poe-risk-qa.json").write_text(
    json.dumps(checks, indent=2), encoding="utf-8"
)
print("ALL PASSED", len(checks))
