import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('gaming-headsets/g920-wireless/index.html', 'utf8');
const model = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8')).models
  .find(item => item.folder === 'g920-wireless');
const sizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'))[model.folder];
const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const product = context.window.talrivoCatalog.find(item => item.folder === model.folder);
assert.equal(model.assets.length, 3);
assert.equal(product.images.length, 3);
assert.match(html, /<title>Black and Red Wireless Gaming Headset \| G920 \| TALRIVO<\/title>/);
assert.match(html, /href="https:\/\/talrivo\.com\/gaming-headsets\/g920-wireless\/"/);
assert.match(html, /product=g920-wireless&amp;inquiry=sample#inquiry-form/);
assert.match(html, /gaming-headsets\/g920-wired\//);
assert.match(html, /not universal compatibility/);
assert.match(html, /Pictured parts are not automatically included/);
assert.match(html, /Visual glow is not a headset lighting specification/);
assert.match(html, /Logo artwork is illustrative/);
assert.match(html, /not customer photos or a microphone test/);
const gallery = html.match(/<div class="model-gallery">([\s\S]*?)<\/div>/)[1];
assert.equal((gallery.match(/<figure>/g) || []).length, 3);
assert.equal((gallery.match(/loading="lazy"/g) || []).length, 3);
for (const [index, asset] of model.assets.entries()) {
  assert.ok(existsSync(asset));
  assert.ok(gallery.includes(`href="../../${asset}"`));
  assert.ok(!gallery.includes(`src="../../${asset}"`));
  assert.ok(existsSync(`assets/catalog/g920-wireless/${product.images[index]}`));
  assert.ok(statSync(`assets/catalog/g920-wireless/${product.images[index]}`).size < 160000);
  assert.equal(sizes.assets[index].variants.length, 2);
  for (const variant of sizes.assets[index].variants) {
    assert.ok(variant.width <= sizes.assets[index].width);
    assert.ok(statSync(variant.path).size < 160000);
    assert.ok(gallery.includes(`../../${variant.path} ${variant.width}w`));
  }
}
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
assert.equal(schemas.find(item => item['@type'] === 'WebPage').dateModified, '2026-10-28');
assert.equal(schemas.find(item => item['@type'] === 'FAQPage').mainEntity.length, 4);
const modal = readFileSync('script.js', 'utf8').match(/"G920-wireless": \{([\s\S]*?)\n  \},/)[1];
assert.doesNotMatch(modal, /RGB dynamic running light/);
assert.match(readFileSync('sitemap.xml', 'utf8'), /<loc>https:\/\/talrivo\.com\/gaming-headsets\/g920-wireless\/<\/loc>\s*<lastmod>2026-10-28<\/lastmod>/);
console.log('G920 media checks passed: three approved graphics, responsive previews, stable canonical, qualified connections/accessories and correct inquiry model.');
