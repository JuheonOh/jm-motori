// PUPPETEER_PATH: existing puppeteer-core; BROWSER_URL: running Chrome/Whale debug endpoint.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const puppeteer = require(process.env.PUPPETEER_PATH || 'puppeteer-core');
const url = process.env.TEST_URL || 'http://localhost:5173/versions/v6/index.html';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const browser = await puppeteer.connect({ browserURL: process.env.BROWSER_URL || 'http://127.0.0.1:9223' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(url);
    await page.evaluate(() => localStorage.removeItem('jm-v6-motion'));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    for (const width of [1920, 768, 390, 320]) {
      await page.setViewport({ width, height: width === 1920 ? 1080 : 844 });
      await page.evaluate(() => localStorage.removeItem('jm-v6-motion'));
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.v6-photo-frame');
      await page.waitForSelector('.case-link');
      await delay(1000);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
      assert.ok(await page.$('a[href="tel:010-4195-7485"]'));
      assert.equal(await page.$('canvas'), null, 'illustrated model removed');
      assert.ok(await page.$eval('.v6-photo-frame img', el => el.naturalWidth > 0));
      const before = await page.$eval('.v6-photo-frame', el => el.getBoundingClientRect().width);
      await page.evaluate(() => scrollTo({ top: 350, behavior: 'instant' }));
      await delay(150);
      assert.ok(await page.$eval('.v6-photo-frame', el => el.getBoundingClientRect().width) > before, 'photo expands on scroll');
      await page.click('.v6-motion-toggle');
      assert.equal(await page.$eval('.v6-motion-toggle', el => el.getAttribute('aria-pressed')), 'false');
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#portfolio').scrollIntoView(); });
      assert.equal(await page.$eval('.repair-case', el => getComputedStyle(el).opacity), '1');
      const count = await page.$$eval('.case-link', els => els.length);
      const titles = await page.$$eval('.case-body h3', els => els.map(el => el.textContent));
      const expected = await page.evaluate(async () => (await (await fetch('./data/blog-feed.json')).json()).items.map(item => item.title.trim()));
      assert.deepEqual(titles, expected.slice(0, count));
      await page.click('button::-p-text(정비 사례 더보기)');
      await page.waitForFunction(n => document.querySelectorAll('.case-link').length > n, {}, count);
      if (width < 761) {
        await page.click('button[aria-controls="mobile-nav-menu"]');
        await page.keyboard.press('Escape');
        assert.equal(await page.$eval('button[aria-controls="mobile-nav-menu"]', el => el.getAttribute('aria-expanded')), 'false');
      }
      console.log(`PASS ${width}: photo expansion, motion-off, RSS, more, menu, no overflow`);
    }
    await page.evaluate(() => localStorage.removeItem('jm-v6-motion'));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.v6-photo-frame');
    assert.equal(await page.$eval('.v6-motion-toggle', el => el.getAttribute('aria-pressed')), 'false');
    assert.equal(await page.$eval('.repair-case', el => getComputedStyle(el).opacity), '1');
    await page.evaluate(() => scrollTo({ top: 200, behavior: 'instant' }));
    await delay(100);
    await page.$eval('.v6-motion-toggle', el => el.click());
    await delay(100);
    assert.ok(await page.$eval('.hero', el => Number(el.style.getPropertyValue('--scene-progress')) > 0), 'enable immediately updates scene');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.v6-motion-toggle');
    assert.equal(await page.$eval('.v6-motion-toggle', el => el.getAttribute('aria-pressed')), 'true', 'explicit choice survives reload with OS reduced motion');
    assert.deepEqual(errors, []);
    console.log('PASS reduced-motion default and no JavaScript errors');
    if (process.env.AUDIT_OUTPUT) {
      fs.mkdirSync(process.env.AUDIT_OUTPUT, { recursive: true });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
      for (const width of [1920, 390]) {
        await page.setViewport({ width, height: width === 1920 ? 1080 : 844 });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.v6-photo-frame');
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await delay(1100);
        await page.screenshot({ path: `${process.env.AUDIT_OUTPUT}/photo-${width}.png` });
        await page.evaluate(() => scrollTo({ top: 350, behavior: 'instant' }));
        await delay(200);
        await page.screenshot({ path: `${process.env.AUDIT_OUTPUT}/expanded-${width}.png` });
      }
    }
  } finally {
    await page.evaluate(() => localStorage.removeItem('jm-v6-motion'));
    await page.close();
    browser.disconnect();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
