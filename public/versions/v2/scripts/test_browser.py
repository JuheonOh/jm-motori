"""Responsive and interaction smoke tests for the standalone landing page."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'preview';OUT.mkdir(exist_ok=True)
results={'viewports':[],'checks':{},'errors':[],'network':'External requests blocked to test the explicit offline/fallback state.'}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1,reduced_motion='reduce')
 page.on('pageerror',lambda error:results['errors'].append(str(error)))
 page.route('https://**/*',lambda route:route.abort())
 page.set_content((ROOT/'index.html').read_text(encoding='utf-8'),wait_until='load')
 page.wait_for_timeout(250)
 page.screenshot(path=str(OUT/'desktop-top.png'),full_page=False)
 # Scroll to materialize all lazy images and capture the actual failure state.
 page.evaluate('window.scrollTo(0,document.body.scrollHeight)');page.wait_for_timeout(200)
 page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(200)
 page.screenshot(path=str(OUT/'desktop-full.png'),full_page=True)
 for width in [320,360,390,430,680,768,1024,1280,1440,1920]:
  page.set_viewport_size({'width':width,'height':900})
  page.wait_for_timeout(30)
  size=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
  results['viewports'].append({'width':width,'overflow':max(size['scroll'],size['body'])>width,'documentWidth':size['scroll']})
 page.set_viewport_size({'width':1440,'height':1000})
 results['checks']['featured_count_3']=page.locator('#featured-grid .journal-card').count()==3
 results['checks']['featured_mini_only']=page.locator('#featured-grid [data-car-brand="MINI"]').count()==3
 results['checks']['archive_initially_closed']=not page.locator('#archive-panel').evaluate('(el)=>el.open')
 results['checks']['main_headline']=page.locator('h1').inner_text()
 page.locator('#featured-grid .card-open').first.click()
 results['checks']['record_modal_opens']=page.locator('#record-dialog').evaluate('(el)=>el.open')
 results['checks']['modal_has_original_excerpt']=bool(page.locator('.dialog-excerpt').inner_text().strip())
 results['checks']['modal_has_call_link']=page.locator('.dialog-actions a[href="tel:01041957485"]').count()==1
 page.screenshot(path=str(OUT/'desktop-dialog.png'))
 page.keyboard.press('Escape')
 results['checks']['escape_closes_modal']=not page.locator('#record-dialog').evaluate('(el)=>el.open')
 results['checks']['focus_restored']=page.evaluate('document.activeElement.matches("#featured-grid .card-open")')
 page.locator('#services-grid [data-symptom="leak"]').click()
 page.wait_for_timeout(350)
 results['checks']['service_opens_archive']=page.locator('#archive-panel').evaluate('(el)=>el.open')
 results['checks']['service_keeps_mini_filter']=page.locator('[data-brand="MINI"]').get_attribute('aria-pressed')=='true'
 results['checks']['service_selects_symptom']=page.locator('#symptom-select').input_value()=='leak'
 results['checks']['service_result_count']=page.locator('#result-count').inner_text()
 page.locator('#symptom-select').select_option('all')
 page.locator('#search').fill('없는차종zzzz')
 results['checks']['empty_state']=page.locator('#empty-state').is_visible()
 page.locator('#reset-filters').click()
 results['checks']['reset_to_33_mini']=page.locator('#result-count').inner_text()=='33개의 기록'
 page.locator('[data-brand="BMW"]').click()
 results['checks']['bmw_7']=page.locator('#result-count').inner_text()=='7개의 기록'
 results['checks']['bmw_only_cards']=page.locator('#journal-grid .journal-card').count()==page.locator('#journal-grid [data-car-brand="BMW"]').count()
 page.locator('[data-brand="all"]').click()
 results['checks']['all_50']=page.locator('#result-count').inner_text()=='50개의 기록'
 page.locator('#search').fill('F56')
 results['checks']['search_nonempty']=page.locator('#journal-grid .journal-card').count()>0
 page.locator('#search').fill('')
 page.locator('#list-view').click()
 results['checks']['list_view']=page.locator('#journal-grid').evaluate('(el)=>el.classList.contains("is-list")')
 page.locator('#grid-view').click()
 page.locator('#load-more').click()
 results['checks']['load_more_12']=page.locator('#journal-grid .journal-card').count()==12
 page.locator('#source-button').click()
 results['checks']['source_modal']=page.locator('#source-dialog').evaluate('(el)=>el.open')
 page.locator('#source-close').click()
 page.locator('#copy-address').click()
 results['checks']['address_feedback']=page.locator('#toast').is_visible()
 page.locator('#archive-panel > summary').click()
 page.set_viewport_size({'width':390,'height':844})
 page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(400)
 page.locator('#toast').evaluate('(el)=>el.classList.remove("is-visible")')
 page.evaluate('document.activeElement.blur(); window.scrollTo({top:0,behavior:"instant"})')
 page.wait_for_timeout(100)
 page.screenshot(path=str(OUT/'mobile-top.png'))
 page.screenshot(path=str(OUT/'mobile-full.png'),full_page=True)
 results['checks']['mobile_bar_visible']=page.locator('.mobile-contact').is_visible()
 page.locator('#menu-toggle').click()
 results['checks']['mobile_menu_opens']=page.locator('#navigation').is_visible()
 page.locator('#navigation a').first.click()
 results['checks']['mobile_menu_closes']=page.locator('#menu-toggle').get_attribute('aria-expanded')=='false'
 # Test image success branch with an in-memory neutral test swatch; never included in design previews.
 page.locator('.hero-photo > img').evaluate('(img)=>{img.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}')
 page.wait_for_timeout(100)
 results['checks']['image_success_state']=page.locator('.hero-photo').evaluate('(el)=>el.classList.contains("is-loaded")')
 # Safe rendering of special characters; no HTML from RSS is executed.
 page.locator('#archive-panel').evaluate('(el)=>el.open=true')
 page.locator('#search').fill('<img src=x onerror=alert(1)>')
 results['checks']['special_char_search_safe']=page.locator('#empty-state').is_visible()
 browser.close()
OUT.joinpath('test-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
assert not results['errors'],results['errors']
assert not any(x['overflow'] for x in results['viewports'])
assert all(v for v in results['checks'].values())
