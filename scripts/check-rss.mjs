// Isolated updater checks: no network requests and no writes to the real feed cache.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const source = fileURLToPath(new URL("./build-rss-cache.mjs", import.meta.url));
const root = await mkdtemp(path.join(tmpdir(), "jm-rss-check-"));
const output = path.join(root, "github-output");
const cache = path.join(root, "public/data/blog-feed.json");
const title = "광주 MINI · 엔진경고등 & DPF 점검｜원문 제목 그대로";
const image = "https://blogthumb.pstatic.net/work.jpg?type=s3&quality=90";
const xml = `<rss><channel><item><title><![CDATA[${title}]]></title>
<link>https://blog.naver.com/ablymotors/123</link>
<pubDate>Thu, 01 Oct 2026 10:00:00 +0900</pubDate>
<description><![CDATA[정비 기록 <img src="${image}" />]]></description>
</item></channel></rss>`;

async function run({ published = null, fail = false, feed = xml, proxyOnly = false, outputPath = output } = {}) {
  await writeFile(output, "");
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `
    globalThis.fetch = async (url) => {
      if (url === "https://published.test/feed.json") {
        return new Response(JSON.stringify(${JSON.stringify(published)}), { headers: { "content-type": "application/json" } });
      }
      if (${proxyOnly} && !String(url).includes("/get?")) throw new Error("direct and raw unavailable");
      if (${proxyOnly}) return new Response(JSON.stringify({ contents: ${JSON.stringify(feed)} }), { headers: { "content-type": "application/json" } });
      if (${fail}) throw new Error("mock upstream unavailable");
      return new Response(${JSON.stringify(feed)}, { headers: { "content-type": "application/xml" } });
    };
    await import(${JSON.stringify(pathToFileURL(path.join(root, "scripts/build-rss-cache.mjs")).href)});
  `], {
    env: { ...process.env, GITHUB_OUTPUT: outputPath, RSS_CACHE_COMPARE_URL: "https://published.test/feed.json" },
    encoding: "utf8",
  });
  assert.ifError(result.error);
  return { ...result, output: await readFile(output, "utf8") };
}

try {
  await mkdir(path.join(root, "scripts"));
  await copyFile(source, path.join(root, "scripts/build-rss-cache.mjs"));
  const initial = await run();
  assert.equal(initial.status, 0, initial.stderr);
  assert.equal(initial.output, "rss_changed=true\n");
  const payload = JSON.parse(await readFile(cache, "utf8"));
  assert.equal(payload.items[0].title, title);
  assert.equal(payload.items[0].link, "https://blog.naver.com/ablymotors/123");
  const thumb = new URL(payload.items[0].thumbnail);
  assert.equal(thumb.searchParams.get("url"), image.replace("https://", ""));
  assert.equal(thumb.searchParams.get("fit"), "contain");
  assert.equal(thumb.searchParams.get("h"), "720");

  const unchanged = await run({ published: { ...payload, generatedAt: "2000-01-01T00:00:00Z" } });
  assert.equal(unchanged.status, 0, unchanged.stderr);
  assert.equal(unchanged.output, "rss_changed=false\n");
  const edited = await run({ published: payload, feed: xml.replace(title, `${title} 수정`) });
  assert.equal(edited.status, 0, edited.stderr);
  assert.equal(edited.output, "rss_changed=true\n");
  assert.equal(JSON.parse(await readFile(cache, "utf8")).items[0].title, `${title} 수정`);

  for (const [encoded, expected] of [
    ["<![CDATA[MINI &amp; BMW &#39;]]>", "MINI &amp; BMW &#39;"],
    ["MINI &amp; BMW &amp;quot; &apos; &#39; &#x1F697;", "MINI & BMW &quot; ' ' 🚗"],
    ["MINI &amp; <![CDATA[&amp;]]> BMW", "MINI & &amp; BMW"],
  ]) {
    const result = await run({ feed: xml.replace(`<![CDATA[${title}]]>`, encoded) });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(await readFile(cache, "utf8")).items[0].title, expected);
  }
  const proxy = await run({ proxyOnly: true });
  assert.equal(proxy.status, 0, proxy.stderr);
  const encodedImage = await run({ feed: xml.replace(image, image.replace("&", "&amp;")) });
  assert.equal(encodedImage.status, 0, encodedImage.stderr);
  assert.equal(new URL(JSON.parse(await readFile(cache, "utf8")).items[0].thumbnail).searchParams.get("url"), image.replace("https://", ""));
  const descriptionXml = xml.replace(`<![CDATA[정비 기록 <img src="${image}" />]]>`,
    `정비 기록 &lt;img src=&quot;${image.replace("&", "&amp;amp;")}&quot; /&gt;`);
  const xmlDescription = await run({ feed: descriptionXml });
  assert.equal(xmlDescription.status, 0, xmlDescription.stderr);
  assert.equal(new URL(JSON.parse(await readFile(cache, "utf8")).items[0].thumbnail).searchParams.get("url"), image.replace("https://", ""));
  const outputFailure = await run({ outputPath: root });
  assert.equal(outputFailure.status, 1, "GITHUB_OUTPUT errors must fail the updater");
  assert.doesNotMatch(outputFailure.stderr, /keeping existing cache/);

  const beforeFailure = await readFile(cache, "utf8");
  const failed = await run({ fail: true });
  assert.equal(failed.status, 0, failed.stderr);
  assert.equal(failed.output, "rss_changed=false\n");
  assert.equal(await readFile(cache, "utf8"), beforeFailure);
  const fallbackOutputFailure = await run({ fail: true, outputPath: root });
  assert.equal(fallbackOutputFailure.status, 1);
  assert.equal(fallbackOutputFailure.output, "");
  assert.match(fallbackOutputFailure.stderr, /EISDIR/);
  const malformed = await run({ feed: "<html>upstream error</html>" });
  assert.equal(malformed.status, 0, malformed.stderr);
  assert.equal(await readFile(cache, "utf8"), beforeFailure);

  for (const invalidCache of ["broken JSON", JSON.stringify({ items: [] }), JSON.stringify({ items: [{ title: "", link: "javascript:bad" }] })]) {
    await writeFile(cache, invalidCache);
    const invalid = await run({ fail: true });
    assert.equal(invalid.status, 1, "unusable caches must not hide upstream failure");
    assert.equal(invalid.output, "");
  }
  await rm(cache);
  await mkdir(cache);
  const writeFailure = await run();
  assert.equal(writeFailure.status, 1);
  assert.doesNotMatch(writeFailure.stderr, /fetch failed/);
  await rm(cache, { recursive: true });
  const noCache = await run({ fail: true });
  assert.equal(noCache.status, 1);
  assert.equal(noCache.output, "");
  console.log("PASS RSS literal CDATA/mixed XML/numeric entities, image query decoding, proxy fallback, change detection, valid-cache preservation, invalid-cache rejection and publishing-error propagation");
} finally {
  await rm(root, { recursive: true, force: true });
}
