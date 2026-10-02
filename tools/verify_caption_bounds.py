"""Stress the guide's first painted text frame, before ResizeObserver delivery."""
import argparse
import functools
import http.server
import json
from pathlib import Path
import threading
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--legacy-thread', type=Path, help='Negative control: serve the earlier guide module.')
    parser.add_argument('--prime-old-root', type=Path, help='Warm the same browser context from current/incoming legacy snapshots.')
    args = parser.parse_args()
    assert not (args.legacy_thread and args.prime_old_root)
    output = ROOT / 'output' / 'caption-bounds'
    output.mkdir(parents=True, exist_ok=True)
    cache = {'legacy':bool(args.prime_old_root), 'requests':[]}

    class CacheHandler(Quiet):
        def do_GET(self):
            resource = urlsplit(self.path)
            cache['requests'].append({'legacy':cache['legacy'], 'url':self.path})
            old_paths = {'/':'current/dist/index.html', '/pen-thread.js':'current/dist/pen-thread.js', '/thread-life.js':'incoming/dist/thread-life.js'}
            if cache['legacy'] and not resource.query and resource.path in old_paths:
                data = (args.prime_old_root / old_paths[resource.path]).read_bytes()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html' if resource.path == '/' else 'text/javascript')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                super().do_GET()

        def end_headers(self):
            self.send_header('Cache-Control', 'public, max-age=600' if urlsplit(self.path).path.endswith('.js') else 'no-store')
            super().end_headers()

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(CacheHandler, directory=str(ROOT / 'dist')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome')
            context = browser.new_context(viewport={'width':390, 'height':844})
            if args.prime_old_root:
                prime = context.new_page()
                prime.goto(f'http://127.0.0.1:{server.server_port}/')
                prime.wait_for_function('window.__boot')
                for _ in range(3):
                    prime.locator('#boot-push').click()
                prime.wait_for_function('window.__entrance.finished')
                prime.close()
                cache['legacy'] = False
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            if args.legacy_thread:
                legacy = args.legacy_thread.read_text(encoding='utf-8-sig')
                page.route('**/thread-life.js*', lambda route: route.fulfill(body=legacy, content_type='text/javascript'))
            page.goto(f'http://127.0.0.1:{server.server_port}/')
            page.wait_for_function('window.__boot')
            for _ in range(max(0, 3 - page.evaluate('window.__boot().pushes'))):
                page.locator('#boot-push').click()
            page.wait_for_function('window.__entrance.finished')
            page.evaluate("""async () => {
                const {GuideMotion} = await import('./guide-motion.js');
                const tick = GuideMotion.prototype.tick;
                window.__captionStress = {phrase:'this way.', checked:0, hidden:0, violations:[], cases:[]};
                GuideMotion.prototype.tick = function(...args) {
                    const result = tick.apply(this, args);
                    this.text = this.contextText = window.__captionStress.phrase;
                    // The enclosing production RAF finishes positioning before this
                    // microtask. ResizeObserver has not repaired stale height yet.
                    queueMicrotask(() => {
                        const state=window.__captionStress, words=document.querySelector('.line-guide p');
                        if(!words || words.closest('[hidden]') || getComputedStyle(words).visibility==='hidden'){state.hidden++;return;}
                        state.checked++;
                        const r=words.getBoundingClientRect(), controls=document.querySelector('.bottom-edge').getBoundingClientRect();
                        const overlap=r.right>controls.left&&r.left<controls.right&&r.bottom>controls.top&&r.top<controls.bottom;
                        const outside=r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight;
                        if((overlap||outside)&&state.violations.length<20)state.violations.push({width:innerWidth,overlap,outside,phrase:state.phrase,box:{x:r.x,y:r.y,width:r.width,height:r.height},controls:{x:controls.x,y:controls.y,width:controls.width,height:controls.height}});
                    });
                    return result;
                };
            }""")
            long_phrase = "scroll down! i have things to show you! you scroll. i'll handle the acrobatics. wait for my tiny legs!"
            cases = [(390,'this way.',250), (390,long_phrase,1800), (320,long_phrase+' nearly there. probably.',1800), (320,'one more little detour.',350), (390,'the trains are competing. i am walking.',600), (390,long_phrase,4000)]
            for width, phrase, delay in cases:
                page.set_viewport_size({'width':width, 'height':844})
                page.evaluate('phrase => {window.__captionStress.phrase=phrase;window.__captionStress.cases.push({width:innerWidth,characters:phrase.length});}', phrase)
                page.wait_for_timeout(delay)
            page.screenshot(path=str(output / ('legacy.png' if args.legacy_thread else 'current.png')))
            report = page.evaluate('window.__captionStress')
            report.update({'legacy_negative_control': bool(args.legacy_thread), 'page_errors':errors})
            if args.prime_old_root:
                prime_requests = [r['url'] for r in cache['requests'] if r['legacy'] and ('pen-thread.js' in r['url'] or 'thread-life.js' in r['url'])]
                fresh_requests = [r['url'] for r in cache['requests'] if not r['legacy'] and ('pen-thread.js' in r['url'] or 'thread-life.js' in r['url'])]
                assert '/pen-thread.js' in prime_requests and '/thread-life.js' in prime_requests
                assert any(url.startswith('/pen-thread.js?v=') for url in fresh_requests), fresh_requests
                assert any(url.startswith('/thread-life.js?v=') for url in fresh_requests), fresh_requests
                assert '/pen-thread.js' not in fresh_requests and '/thread-life.js' not in fresh_requests
                assert page.locator('.pen-thread').count() == 1 and page.locator('.line-guide').count() == 1
                report['primed_cache'] = {'max_age':600, 'old_requests':prime_requests, 'fresh_requests':fresh_requests, 'boot_reused_from_http_cache':not any(not r['legacy'] and r['url']=='/boot.js' for r in cache['requests']), 'single_pen_and_guide':True}
            name = 'legacy-report.json' if args.legacy_thread else 'cache-report.json' if args.prime_old_root else 'report.json'
            (output / name).write_text(json.dumps(report, indent=2), encoding='utf-8')
            print(json.dumps(report), flush=True)
            assert not errors, errors
            assert report['checked'] > 20, 'No meaningful visible caption samples.'
            if args.legacy_thread:
                assert report['violations'], 'Negative control did not reproduce the stale-size failure.'
            else:
                assert not report['violations'], report['violations']
            browser.close()
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()
