// v5 deliberately derives from the frozen v3 snapshot, not the current v4 source.
import { cp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const source = new URL('public/versions/v3/', root);
const target = new URL('public/versions/v5/', root);
await cp(source, target, { recursive: true });
const bundle = (await readdir(new URL('assets/', source))).find(name => /^index-.*\.js$/.test(name));
let js = await readFile(new URL(`assets/${bundle}`, source), 'utf8');
function replaceOnce(before, after) {
  assert.equal(js.split(before).length, 2, `v3 snapshot changed: ${before}`);
  js = js.replace(before, after);
}
replaceOnce('g.jsx("h3",{children:F.title}),', 'g.jsx("h3",{children:F.title}),g.jsx("p",{className:"case-summary",children:F.summary}),');
replaceOnce('summary:E.length>92?`${E.slice(0,92)}...`:E||', 'summary:E||');
replaceOnce('Ja="jm_blog_feed_cache_v1"', 'Ja="jm_blog_feed_cache_v5"');
replaceOnce('&w=960&h=720&fit=contain&output=webp&q=80', '&w=960&fit=inside&output=webp&q=80');
// The RSS source itself requests a square crop (type=s3); CSS cannot undo it.
function originalThumbnail(value) {
  if (!value || !/^https?:\/\//i.test(value)) return value;
  try {
    let url = new URL(value);
    if (url.hostname === 'wsrv.nl' && url.searchParams.has('url')) {
      const original = url.searchParams.get('url');
      url = new URL(/^https?:\/\//i.test(original) ? original : `https://${original.replace(/^\/\//, '')}`);
    }
    if (url.hostname === 'blogthumb.pstatic.net') {
      url.hostname = 'blogfiles.pstatic.net';
      url.searchParams.delete('type');
    }
    return url.href;
  } catch { return value; }
}
replaceOnce('function Za(m,v=Ol){const c=Fi(m,v);', `function Za(m,v=Ol){const c=Fi((${originalThumbnail.toString()})(m),v);`);
js = js.replaceAll('/versions/v3/', '/versions/v5/');
const filename = `index-${createHash('sha256').update(js).digest('hex').slice(0,8)}.js`;
for (const file of await readdir(new URL('assets/', target))) {
  if (/^index-.*\.js$/.test(file)) await rm(new URL(`assets/${file}`, target));
}
await writeFile(new URL(`assets/${filename}`, target), js);
let html = await readFile(new URL('index.html', target), 'utf8');
html = html.replaceAll('/versions/v3/', '/versions/v5/').replace(bundle, filename).replace('</head>', '<link rel="stylesheet" href="./overrides.css">\n  </head>');
await writeFile(new URL('index.html', target), html);
await cp(new URL('versions/v5/overrides.css', root), new URL('overrides.css', target));
const manifestPath = new URL('public/versions/manifest.json', root);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.v5 = { description: 'v3 layout with a v1-style full-width hero, shorter edge-to-edge thumbnails from original images and original RSS summaries.' };
manifest.files.v5 = {};
async function hashes(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) await hashes(file, relative + '/');
    else manifest.files.v5[relative] = createHash('sha256').update(await readFile(file)).digest('hex');
  }
}
await hashes(target);
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Built v5 from v3; v1–v4 preserved.');
