"""Headless interaction and layout checks for the public sketchbook."""

import functools
import http.server
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output' / 'portfolio-review'
OUTPUT.mkdir(parents=True, exist_ok=True)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def enter(page):
    page.wait_for_function('window.__boot')
    button = page.locator('#boot-push')
    if button.is_visible():
        button.focus()
        for _ in range(3 - page.evaluate('window.__boot().pushes')):
            button.press('Enter')
    page.wait_for_function("!document.querySelector('#little-boot')")
    page.wait_for_function('window.__entrance.finished')
    assert page.evaluate('window.__boot().done')


def verify_captions(page):
    return page.evaluate("""() => {
        const words = document.querySelector('.line-guide p');
        if (!words || getComputedStyle(words).visibility === 'hidden' || words.closest('[hidden]')) return 0;
        const r = words.getBoundingClientRect(), controls = document.querySelector('.bottom-edge').getBoundingClientRect();
        const overlaps = r.right > controls.left && r.left < controls.right && r.bottom > controls.top && r.top < controls.bottom;
        if (overlaps) throw Error('guide caption covers the play controls');
        if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) throw Error('guide caption leaves the viewport');
        return 1;
    }""")


def inspect(page, name, width, reduced, url):
    errors, bad_responses = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: bad_responses.append({'status': response.status, 'url': response.url}) if response.status >= 400 else None)
    page.goto(url, wait_until='domcontentloaded')
    enter(page)
    assert page.evaluate("document.fonts.check('18px Reader') && document.fonts.check('18px Pen')")
    page.screenshot(path=str(OUTPUT / f'{name}-hero.png'))
    if name == 'desktop':
        # Publication thumbnail is captured separately from the keyboard-focus proof.
        page.mouse.click(20, 12)
        page.screenshot(path=str(OUTPUT / 'publication-preview.png'))
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    caption_samples = 0
    for _ in range(14):
        caption_samples += verify_captions(page)
        page.wait_for_timeout(100)

    # These clicks exercise the live physics handlers, rather than changing diagnostics.
    for selector in ('#help', '#ruin', '#encourage', '#reset'):
        page.locator(selector).click()
        page.wait_for_timeout(180)
        assert page.evaluate('window.__hill().physics && window.__hill().assets')
    assert page.evaluate('window.__hill().physics.chipCount') == 0
    rock = page.locator('#rock-hit').bounding_box()
    assert rock
    x, y = rock['x'] + rock['width'] / 2, rock['y'] + rock['height'] / 2
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x + 35, y - 55, steps=6)
    assert page.evaluate("window.__hill().pointerGrab === 'body'")
    page.mouse.up()
    assert page.evaluate('window.__hill().pointerGrab') is None

    for selector, value in (('#music-volume', '11'), ('#sfx-volume', '21')):
        page.locator(selector).fill(value)
    assert abs(page.evaluate('window.__musicDiagnostics().volume') - .11) < .001
    assert abs(page.evaluate('window.__hill().audio.sfxVolume') - .21) < .001

    page.locator('#project-london').evaluate("el => el.scrollIntoView({block:'start',behavior:'instant'})")
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUTPUT / f'{name}-london.png'))
    jump = page.locator('#small-jump')
    if width <= 760:
        assert jump.is_visible() and not jump.evaluate('el => el.open')
        jump.locator('summary').focus()
        jump.locator('summary').press('Enter')
        assert jump.evaluate('el => el.open')
        page.screenshot(path=str(OUTPUT / f'{name}-jump.png'))
        jump.locator('a[href="#project-halo"]').click()
        page.wait_for_function("location.hash === '#project-halo'")
        page.wait_for_timeout(600)
        assert not jump.evaluate('el => el.open')
        assert page.evaluate("document.activeElement.id === 'project-halo'")
        assert page.locator('#project-halo').bounding_box()['y'] >= 65
        assert jump.bounding_box()['y'] <= 10
        page.screenshot(path=str(OUTPUT / f'{name}-halo-jump.png'))
        jump.locator('summary').press('Enter')
        jump.locator('summary').press('Escape')
        assert not jump.evaluate('el => el.open')
    else:
        assert not jump.is_visible()

    scenes = []
    frames = page.locator('.sketch-demo')
    assert frames.count() == 10
    for index in range(frames.count()):
        frame = frames.nth(index)
        frame.evaluate("el => el.scrollIntoView({block:'center',behavior:'instant'})")
        page.wait_for_function("el => el.dataset.sceneReady === 'true'", arg=frame.element_handle())
        child = frame.element_handle().content_frame()
        before = child.evaluate('window.__siteDiagnostics()')
        page.wait_for_timeout(220)
        after = child.evaluate('window.__siteDiagnostics()')
        assert after['time'] > before['time'], after
        assert after['frames'] > before['frames'], after
        scenes.append({'scene': after['scene'], 'frames_advanced': after['frames'] - before['frames']})
        assert not child.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
        if name == 'phone' and after['scene'] == 'scraper':
            cycles = child.evaluate('window.__siteDiagnostics().mini.cycles')
            page.wait_for_timeout(2700)
            assert child.evaluate('window.__siteDiagnostics().mini.cycles') > cycles
        if name == 'phone' and after['scene'] == 'halo':
            child.locator('[data-mode="audio"]').click()
            assert child.evaluate("window.__siteDiagnostics().halo.mode === 'audio'")
            scenario = child.evaluate('window.__siteDiagnostics().halo.scenario')
            child.locator('.halo-next').click()
            assert child.evaluate('window.__siteDiagnostics().halo.scenario') != scenario
        if name == 'phone' and after['scene'] == 'botato':
            destinations = child.evaluate('window.__siteDiagnostics().game.destinations')
            child.locator('.toy').press('Enter')
            assert child.evaluate('window.__siteDiagnostics().game.destinations') > destinations
        if after['scene'] in ('poe', 'botato', 'interests'):
            page.screenshot(path=str(OUTPUT / f"{name}-{after['scene']}.png"))

    # Continuous endpoints survive phone stacking, jumping and child-frame resizing.
    joins = page.evaluate("""() => {
        const paths = [...document.querySelectorAll('.thread-segment')].filter(p => p.getAttribute('d'));
        for (let i = 1; i < paths.length; i++) {
            const a = paths[i-1].getPointAtLength(paths[i-1].getTotalLength()), b = paths[i].getPointAtLength(0);
            if (Math.hypot(a.x-b.x, a.y-b.y) > .05) throw Error('broken continuous-line join');
        }
        return paths.length - 1;
    }""")
    anchors = page.evaluate("""() => [...document.querySelectorAll('a[href^="#"]')].map(a => ({href:a.hash,exists:!!document.querySelector(a.hash)}))""")
    assert all(item['exists'] for item in anchors)
    assert page.locator('.project-knots,.pencil-note,#next-quote').count() == 0
    assert not page.locator('a[href*="discord.gg"]').count()

    # Blank hill canvas remains scrollable; dragging actual objects still captures.
    page.locator('#world').evaluate("el => el.scrollIntoView({behavior:'instant'})")
    page.mouse.move(width - 15, 300)
    page.mouse.wheel(0, 650)
    page.wait_for_timeout(400)
    assert page.evaluate('scrollY') > 200
    for _ in range(8):
        caption_samples += verify_captions(page)
        page.wait_for_timeout(100)
    if reduced:
        assert page.evaluate("window.__hill().reducedMotion")
        assert page.locator('.scribble-note').first.evaluate("el => getComputedStyle(el).animationName") == 'none'

    assert not errors, errors
    assert not bad_responses, bad_responses
    return {'viewport': name, 'width': width, 'reduced_motion': reduced, 'font_loads': True, 'overflow': False, 'keyboard_entry': True, 'boulder_drag': True, 'sound_sliders': True, 'phone_jump': width <= 760, 'scene_advancement': scenes, 'line_joins': joins, 'visible_caption_samples': caption_samples, 'page_errors': errors, 'bad_responses': bad_responses}


def main():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT / 'dist')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    report = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel='chrome')
            for name, width, height, reduced in (('desktop', 1440, 1000, False), ('phone', 390, 844, False), ('small-phone', 320, 740, False), ('reduced-phone', 390, 844, True)):
                context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce' if reduced else 'no-preference')
                page = context.new_page()
                result = inspect(page, name, width, reduced, f'http://127.0.0.1:{server.server_port}/')
                report.append(result)
                print(json.dumps(result), flush=True)
                context.close()
            browser.close()
        (OUTPUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
