"""Stress the embedded-scene handshake and the cheer audio route."""
import functools
import http.server
import os
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def enter(page):
    page.wait_for_function("window.__boot")
    boot = page.locator("#little-boot")
    if boot.count() and boot.is_visible():
        button = page.locator("#boot-push")
        pushes = page.evaluate("window.__boot().pushes")
        for _ in range(max(0, 3 - pushes)):
            button.click()
    page.wait_for_function("!document.querySelector('#little-boot')", timeout=15000)


def visit_every_scene(page):
    frames = page.locator("iframe.sketch-demo")
    assert frames.count() == 10
    for index in range(frames.count()):
        frame = frames.nth(index)
        frame.scroll_into_view_if_needed(timeout=10000)
        frame.evaluate("el => el.scrollIntoView({block:'center'})")
        page.wait_for_function(
            "el => el.dataset.sceneReady === 'true' && el.hasAttribute('src') && !el.hasAttribute('aria-busy')",
            arg=frame.element_handle(),
            timeout=15000,
        )
    assert page.locator(".scene-loading").count() == 0


server = None
url = os.environ.get("SITE_URL")
if not url:
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT / "dist"))
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_port}/index.html"

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", args=["--autoplay-policy=no-user-gesture-required"])
        for viewport in ({"width": 1280, "height": 900}, {"width": 390, "height": 844}):
            context = browser.new_context(viewport=viewport, reduced_motion="reduce")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))

            def delay_bundle(route):
                time.sleep(0.12)
                route.continue_()

            page.route("**/demo.bundle.js*", delay_bundle)
            page.goto(url, wait_until="domcontentloaded")
            enter(page)

            if viewport["width"] > 1000:
                page.wait_for_function("window.__hill && window.__hill().audio.recorded && window.__threadLife?.().guideVisible")
                before = page.evaluate("window.__hill().audio.events.length")
                page.locator("#encourage").click()
                page.wait_for_timeout(180)
                events = page.evaluate("start => window.__hill().audio.events.slice(start)", before)
                diagnosis = page.evaluate("({audio:window.__hill().audio,guide:window.__threadLife?.().actor})")
                assert any(event["scene"] == "guide" and event["kind"] == "meow" for event in events), {"events":events,"diagnosis":diagnosis}
                assert not any(event["scene"] == "hill" and event["kind"] == "meow" and event["id"] == "hero" for event in events)

            visit_every_scene(page)
            page.unroute("**/demo.bundle.js*", delay_bundle)

            # Cached child documents used to post ready before the parent listener existed.
            page.reload(wait_until="domcontentloaded")
            enter(page)
            visit_every_scene(page)

            assert not errors, errors
            context.close()
        browser.close()
        print("PASS: every scene loads on cold and cached desktop/mobile visits; cheer audio belongs only to the guide")
finally:
    if server:
        server.shutdown()
