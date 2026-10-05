// Independent enhancement of the frozen v5 snapshot; existing versions stay untouched.
import { cp, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const target = new URL('public/versions/v7/', root);
await cp(new URL('public/versions/v5/', root), target, { recursive: true });
for (const name of await readdir(new URL('assets/', target))) {
  if (!/^index-.*\.js$/.test(name)) continue;
  const file = new URL(`assets/${name}`, target);
  await writeFile(file, (await readFile(file, 'utf8')).replaceAll('/versions/v5/', '/versions/v7/').replaceAll('jm_blog_feed_cache_v5', 'jm_blog_feed_cache_v7'));
}
for (const name of ['experience.css', 'experience.js']) {
  await cp(new URL(`versions/v7/${name}`, root), new URL(name, target));
}

const htmlPath = new URL('index.html', target);
let html = (await readFile(htmlPath, 'utf8')).replaceAll('/versions/v5/', '/versions/v7/');
html = html.replace('</head>', '<link rel="stylesheet" href="./experience.css">\n</head>').replace('</body>', '<script type="module" src="./experience.js"></script>\n</body>');
await writeFile(htmlPath, html);
const manifestPath = new URL('public/versions/manifest.json', root);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.v7 = { description: 'Editorial workshop: charcoal split hero, real photography, warm paper services and original RSS work log.' };
manifest.files.v7 = {};
async function walk(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) await walk(file, prefix + entry.name + '/');
    else manifest.files.v7[prefix + entry.name] = createHash('sha256').update(await readFile(file)).digest('hex');
  }
}
await walk(target);
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Built v7; v1–v6 preserved.');
