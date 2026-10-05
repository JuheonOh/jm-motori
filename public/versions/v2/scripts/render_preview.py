"""Render fresh, distraction-free offline previews (no source photos are substituted)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'preview'
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for name, width, height in [('desktop',1440,1000),('mobile',390,844)]:
        page = browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
        page.route('https://**/*',lambda route:route.abort())
        page.set_content((ROOT/'index.html').read_text(encoding='utf-8'),wait_until='load')
        # Force lazy-image load attempts so previews consistently show the genuine failure state.
        page.evaluate("document.querySelectorAll('img').forEach(img=>img.loading='eager')")
        page.wait_for_timeout(300)
        page.evaluate('document.activeElement.blur();window.scrollTo({top:0,left:0,behavior:"instant"})')
        page.wait_for_timeout(100)
        assert page.evaluate('window.scrollY') == 0
        page.screenshot(path=str(OUT/f'{name}-top.png'))
        page.screenshot(path=str(OUT/f'{name}-full.png'),full_page=True)
        print(name, page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth,height:document.body.scrollHeight})'))
        page.close()
    browser.close()
