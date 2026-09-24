import asyncio,json,os
from pathlib import Path
Path("output/browser-check").mkdir(parents=True,exist_ok=True)
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  for name in ['chromium','firefox']:
   b=await (p.chromium.launch(channel='chrome') if name=='chromium' else p.firefox.launch());page=await b.new_page(viewport={'width':1366,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(os.environ.get('AUDIT_URL','http://127.0.0.1:8765/'))
   for _ in range(3):await page.locator('#boot-push').click()
   await page.wait_for_timeout(3000)
   for selector in ['#help','#ruin','#encourage','#reset']:
    await page.locator(selector).click();await page.wait_for_timeout(300)
   rock=page.locator('#rock-hit');box=await rock.bounding_box();assert box
   x=box['x']+box['width']/2;y=box['y']+box['height']/2
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+140,y-100,steps=15);await page.mouse.up();await page.wait_for_timeout(700)
   for el in await page.locator('.sketch-demo').all():
    await el.scroll_into_view_if_needed();await page.wait_for_timeout(650);f=await (await el.element_handle()).content_frame();a=await f.evaluate('window.__siteDiagnostics?.()');assert a,a
    await page.wait_for_timeout(150);z=await f.evaluate('window.__siteDiagnostics()');assert z['time']>a['time'],z
   await page.evaluate("""()=>{const paths=[...document.querySelectorAll('.thread-segment')].filter(p=>p.getAttribute('d'));for(let i=1;i<paths.length;i++){const a=paths[i-1].getPointAtLength(paths[i-1].getTotalLength()),b=paths[i].getPointAtLength(0);if(Math.hypot(a.x-b.x,a.y-b.y)>.05)throw Error('broken line join')}}""")
   await page.set_viewport_size({'width':390,'height':844});await page.locator('#world').scroll_into_view_if_needed();await page.wait_for_timeout(1000)
   await page.mouse.wheel(0,1400);await page.wait_for_timeout(600);assert await page.evaluate('scrollY')>500
   await page.screenshot(path=f'output/browser-check/mobile-{name}.png')
   print(json.dumps({'browser':name,'controls':True,'rockDrag':True,'allScenesAdvance':True,'mobileScroll':True,'errors':errors}),flush=True);assert not errors
   await b.close()
asyncio.run(main())
