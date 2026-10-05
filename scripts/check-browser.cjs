// Requires an existing puppeteer-core install and Chrome; see README.md.
const assert = require('node:assert/strict');
const puppeteer = require(process.env.PUPPETEER_PATH || 'puppeteer-core');
const url = process.env.TEST_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.case-link');
    await page.setViewport({ width: 1920, height: 1080 });
    const desktop = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return { width: box('.hero-layout').width, left: box('.hero-layout').left,
        bottom: box('.hero').bottom, photoWidth: box('.hero-photo').width,
        actionBottom: box('.hero-actions').bottom,
        titleSize: parseFloat(getComputedStyle(document.querySelector('.hero-title')).fontSize) };
    });
    assert.equal(desktop.width, 1560, 'PC content width');
    assert.equal(desktop.left, 180, 'PC side margin');
    assert.ok(Math.abs(desktop.bottom - 1080) < 2, 'hero and service strip fill primary viewport');
    assert.ok(desktop.photoWidth > 800, 'storefront occupies the large PC image column');
    assert.ok(desktop.actionBottom < 980, 'phone action remains above the fold');
    assert.equal(desktop.titleSize, 104, 'primary PC title size');
    await page.setViewport({ width: 1440, height: 1000 });
    const feed = await page.evaluate(async () => {
      const response = await fetch(new URL('data/blog-feed.json', location.href));
      return (await response.json()).items;
    });
    assert.deepEqual(await page.$$eval('.case-body h3', nodes => nodes.map(n => n.textContent)), feed.slice(0, 6).map(post => post.title.trim()), 'latest titles must match JSON verbatim');
    assert.ok(await page.$('a[href="tel:010-4195-7485"]'));
    assert.equal(await page.$eval('.case-photo img', el => getComputedStyle(el).objectFit), 'contain');
    assert.equal(await page.$eval('.case-photo img', el => new URL(el.src).searchParams.get('fit')), 'contain');
    assert.equal(await page.$eval('.case-photo img', el => new URL(el.src).searchParams.get('h')), '720');
    assert.ok(await page.$eval('.case-footer', el => parseFloat(getComputedStyle(el).fontSize) >= 14));
    assert.equal(await page.$$eval('.repair-case', nodes => nodes.length), 6);
    const before = await page.$$eval('.case-link', nodes => nodes.length);
    const more = await page.$('button::-p-text(정비 사례 더보기)');
    assert.ok(more); await more.click();
    await page.waitForFunction(n => document.querySelectorAll('.case-link').length > n, {}, before);
    assert.ok(await page.$$eval('.case-link', links => links.every(a => /^https:\/\/blog\.naver\.com\/ablymotors\/\d+(?:\?|$)/.test(a.href) && a.rel.includes('noopener'))));
    for (const width of [320, 390, 760, 768, 980, 981, 1024, 1440, 1920]) {
      await page.setViewport({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
      assert.equal(await page.$eval('.case-grid', el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width <= 760 ? 1 : width <= 980 ? 2 : 3, `card columns at ${width}`);
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.click('button[aria-controls="mobile-nav-menu"]');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('button[aria-controls="mobile-nav-menu"]', el => el.getAttribute('aria-expanded')), 'false');
    assert.ok(await page.$eval('button[aria-controls="mobile-nav-menu"]', el => el === document.activeElement));
    await page.click('button[aria-controls="mobile-nav-menu"]');
    await page.click('#mobile-nav-menu a[href="#contact"]');
    assert.equal(await page.$eval('button[aria-controls="mobile-nav-menu"]', el => el.getAttribute('aria-expanded')), 'false');
    assert.equal(await page.$eval('#contact a[href^="https://map.naver.com"]', el => el.target), '_blank');
    assert.equal(await page.$$eval('#contact img', nodes => nodes.length), 0);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.equal(await page.$eval('.case-body h3', el => getComputedStyle(el).webkitLineClamp), '3');
    assert.deepEqual(errors, []);

    assert.equal(await page.$eval('#contact h2', el => el.textContent), '오시는 길');
    assert.equal(await page.$$eval('#contact a[href^="https://map.naver.com"]', nodes => nodes.length), 1);
    assert.equal(await page.$$eval('#contact a[href^="tel:"]', nodes => nodes.length), 1);
    assert.equal(await page.$eval('.case-photo', el => getComputedStyle(el).aspectRatio), '4 / 3');
    const mobile = await browser.newPage();
    await mobile.setViewport({ width: 390, height: 844 });
    await mobile.goto(url, { waitUntil: 'domcontentloaded' });
    await mobile.waitForSelector('.case-link');
    assert.equal(await mobile.$$eval('.case-link', nodes => nodes.length), 3, 'mobile starts with three cases');
    await mobile.click('button::-p-text(정비 사례 더보기)');
    await mobile.waitForFunction(() => document.querySelectorAll('.case-link').length === 6);
    await mobile.setViewport({ width: 1024, height: 768 });
    await mobile.setViewport({ width: 390, height: 844 });
    assert.equal(await mobile.$$eval('.case-link', nodes => nodes.length), 6, 'rotation must not collapse expanded cases');
    await mobile.click('button::-p-text(정비 사례 더보기)');
    await mobile.waitForFunction(() => document.querySelectorAll('.case-link').length === 9);
    await mobile.click('button::-p-text(정비 사례 더보기)');
    await mobile.waitForFunction(() => document.querySelectorAll('.case-link').length === 12);
    assert.equal(await mobile.$('button::-p-text(정비 사례 더보기)'), null);
    assert.equal(await mobile.$('p::-p-text(모든 최신 사례를 확인했습니다.)'), null);
    await mobile.close();
    const context = await browser.createBrowserContext();
    const failure = await context.newPage();
    let feedAvailable = false;
    let failedImageRequests = 0;
    let proxyAvailable = false;
    await failure.setRequestInterception(true);
    failure.on('request', request => {
      const address = request.url();
      if (address.includes('/data/blog-feed.json')) return request.respond(feedAvailable
        ? { status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{ id: 'new', title: '기존 글의 RSS 제목이 변경되었습니다 · 원문 그대로', link: 'https://blog.naver.com/ablymotors/224428115892', pubDate: '2026-10-01', thumbnail: 'https://images.example/repair.jpg' }] }) }
        : { status: 503, body: 'unavailable' });
      if (address.includes('api.allorigins.win')) return request.respond(proxyAvailable && address.includes('/get?')
        ? { status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify({ contents: '<rss><channel><item><title><![CDATA[MINI &amp; BMW 원문]]></title><link>https://blog.naver.com/ablymotors/123</link><description><![CDATA[<img src="https://images.example/proxy.jpg" />]]></description></item></channel></rss>' }) }
        : { status: 503, body: 'unavailable' });
      if (address.includes('wsrv.nl')) {
        failedImageRequests += 1;
        return request.respond({ status: 404, body: '' });
      }
      return request.continue();
    });
    await failure.goto(url, { waitUntil: 'domcontentloaded' });
    await failure.waitForSelector('button::-p-text(다시 시도)');
    assert.equal(await failure.$$eval('.repair-case', nodes => nodes.length), 0);
    assert.ok(await failure.$('a.blog-link'), 'original blog stays accessible during feed failure');
    feedAvailable = true;
    await failure.click('button::-p-text(다시 시도)');
    await failure.waitForSelector('.case-link');
    assert.equal(await failure.$eval('.case-body h3', el => el.textContent), '기존 글의 RSS 제목이 변경되었습니다 · 원문 그대로');
    assert.equal(await failure.$eval('.case-photo img', el => new URL(el.src).searchParams.get('fit')), 'contain');
    await failure.$eval('.case-photo img', image => image.loading = 'eager');
    await failure.waitForFunction(() => document.querySelector('.case-photo img')?.hidden);
    assert.equal(await failure.$eval('.photo-fallback', el => getComputedStyle(el).display), 'flex');
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.equal(failedImageRequests, 1, 'failed thumbnail is not requested in a loop');
    feedAvailable = false;
    await failure.reload({ waitUntil: 'domcontentloaded' });
    await failure.waitForSelector('.case-link');
    assert.equal(await failure.$eval('.case-body h3', el => el.textContent), '기존 글의 RSS 제목이 변경되었습니다 · 원문 그대로', 'cached data survives network failure');
    await failure.evaluate(() => {
      const cache = JSON.parse(localStorage.getItem('jm_blog_feed_cache_v1'));
      const thumbnail = new URL(cache.items[0].thumbnail);
      thumbnail.searchParams.set('fit', 'cover');
      cache.items[0].thumbnail = thumbnail.href;
      localStorage.setItem('jm_blog_feed_cache_v1', JSON.stringify(cache));
    });
    await failure.reload({ waitUntil: 'domcontentloaded' });
    await failure.waitForSelector('.case-link');
    assert.equal(await failure.$eval('.case-photo img', el => new URL(el.src).searchParams.get('fit')), 'contain', 'old cached proxy URLs must use contain');
    await failure.evaluate(() => localStorage.clear());
    proxyAvailable = true;
    await failure.reload({ waitUntil: 'domcontentloaded' });
    await failure.waitForSelector('.case-link');
    assert.equal(await failure.$eval('.case-body h3', el => el.textContent), 'MINI &amp; BMW 원문');
    assert.equal(await failure.$eval('.case-photo img', el => new URL(el.src).searchParams.get('fit')), 'contain', 'alternate RSS proxy thumbnails must use contain');
    await context.close();
    console.log('PASS: phone, source links, desktop/mobile pagination and rotation, 9 widths and card columns, menu/Escape, contact gallery removed, reduced motion, feed failure/retry/cache, updated RSS title and bounded image fallback');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
