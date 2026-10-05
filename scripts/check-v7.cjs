const assert = require('node:assert/strict');
const fs = require('node:fs');
const puppeteer = require(process.env.PUPPETEER_PATH || 'puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const width of [1920, 1440, 1024, 768, 390, 320]) {
      await page.setViewport({ width, height: width >= 1440 ? 1080 : 844 });
      await page.goto(process.env.TEST_URL || 'http://localhost:5173/versions/v7/index.html', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.v7-photo');
      await page.waitForSelector('.case-link');
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
      assert.ok(await page.$eval('.v7-photo img', img => img.complete && img.naturalWidth > 0));
      assert.ok(await page.$('a[href="tel:010-4195-7485"]'));
      const count = await page.$$eval('.case-link', links => links.length);
      assert.equal(count, width <= 760 ? 3 : 6);
      const titles = await page.$$eval('.case-body h3', items => items.map(item => item.textContent));
      const expected = await page.evaluate(async () => (await (await fetch('./data/blog-feed.json')).json()).items.map(item => item.title.trim()));
      assert.deepEqual(titles, expected.slice(0, count));
      assert.equal(await page.$$eval('.case-summary', items => items.length), count);
      if (process.env.AUDIT_OUTPUT && [1920, 390].includes(width)) {
        fs.mkdirSync(process.env.AUDIT_OUTPUT, { recursive: true });
        await page.screenshot({ path: `${process.env.AUDIT_OUTPUT}/v7-${width}.png` });
      }
      await page.click('button::-p-text(정비 사례 더보기)');
      await page.waitForFunction(count => document.querySelectorAll('.case-link').length > count, {}, count);
      if (width <= 760) {
        await page.click('button[aria-controls="mobile-nav-menu"]');
        await page.keyboard.press('Escape');
        assert.equal(await page.$eval('button[aria-controls="mobile-nav-menu"]', el => el.getAttribute('aria-expanded')), 'false');
      }
      await page.$eval('.case-photo img', img => img.dispatchEvent(new Event('error')));
      assert.equal(await page.$eval('.photo-fallback', el => getComputedStyle(el).display), 'flex');
      console.log(`PASS ${width}: layout, photo, original RSS, summaries, more, fallback, menu`);
    }
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.deepEqual(errors, []);
    console.log('PASS reduced motion and no runtime errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
