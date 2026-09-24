# Browser performance repair, 24 September 2026

The public site is https://lolstar123.github.io/just-a-little-further/.
The old ChatGPT-hosted site remains private. Publish changes through the GitHub Pages workflow only.

## Reproduction and causes

Tested the previous source against the repaired source on localhost in fresh headless Chrome, Playwright Firefox and the actual Zen 1.22.3b executable. Chrome was also tested at 4x CPU throttling. Zen was extracted from its official Windows installer into an isolated test directory; its SHA-256 matched the official winget manifest. Tests did not use the user's browser profiles.

- The page-long SVG path was regenerated when the embedded statistics changed. Firefox/Zen spent disproportionate time repainting that large shape, particularly around the Deadlock/Baxter section.
- Hill and guide work ran at the display refresh rate (about 165 Hz on this machine). Embedded scenes already drew at 30 fps but still advanced their simulation and refreshed all audio buses on every display tick.
- Audio refresh repeatedly measured every bus's position and scheduled identical gain automation.
- Guide captions read layout dimensions after writing layout styles every frame.
- A subtree MutationObserver rescanned all iframe loaders whenever typed captions changed.

## Changes

- Render the line in overlapping-endpoint segments of 256 edges. Only changed segment paths are written. The geometry, draggable stroke, physics points and guide route remain continuous. Entrance animation draws the segments in sequence.
- Limit expensive hill/guide updates to approximately 60 fps and scene work to approximately 30 fps. Movement and physics still use elapsed time; physics retains its internal substeps.
- Refresh audio immediately on activation changes and at most once per 100 ms during stationary animation. Scroll/resize proximity changes remain immediate. Do not schedule unchanged gain values. Preserve background music and focus attenuation.
- Cache caption dimensions with ResizeObserver; move captions using transforms. Skip identical line geometry updates.
- Only inspect newly inserted elements for iframe loaders. Do not trigger page-wide scans for text mutations.
- Use parent visibility notifications and the existing 500 ms fallback check instead of measuring iframe visibility every animation frame.

## Measurements

Numbers are p95 requestAnimationFrame callback intervals over short 2.5-second samples, not a claim that drawings themselves render at 165 fps. Scenes intentionally draw at 30 fps. Random scene phases, machine load and headless rendering introduce variance.

| Browser / section | Before | After |
| --- | ---: | ---: |
| Chrome, 4x CPU, Baxter | 84.9 ms | 36.4 ms |
| Chrome, 4x CPU, landing | 42.4 ms | 24.3 ms |
| Firefox, Baxter | 42.4 ms | 6.1 ms |
| Zen 1.22.3b, Baxter | 24.2 ms | 6.1 ms |
| Zen 1.22.3b, landing | 12.1 ms | 6.1 ms |

These results demonstrate reduced stalls in these test conditions, not a guarantee for every GPU, extension, device or power-saving setting. Four-times-throttled Chrome still has slow frames in complex scenes.

## Regression checks

`npm run check` validates JavaScript syntax. `npm run build:demos` regenerates the embedded bundle.

`python tools/check-browser.py` checks Chrome and Firefox against a server at `http://127.0.0.1:8765/`; set `AUDIT_URL` to test another origin. It requires Python Playwright plus Chrome and the Playwright Firefox browser. The check boots the site, exercises all four hill controls, drags the rock, verifies every embedded scene advances, checks SVG segment endpoint continuity and scrolls a narrow viewport. Screenshots go into ignored `output/browser-check/`.

The investigation also compared source versions, verified offscreen scenes stop advancing and inspected rendered desktop/mobile layouts. Raw timing reports and Zen's isolated test installation are in ignored local `output/` directories.

References: [requestAnimationFrame timing](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [Zen releases](https://github.com/zen-browser/desktop/releases/tag/1.22.3b), [Selenium alternate Firefox binaries](https://www.selenium.dev/documentation/webdriver/browsers/firefox/).
