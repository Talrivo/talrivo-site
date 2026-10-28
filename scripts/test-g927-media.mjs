import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('gaming-headsets/g927-wireless/index.html', 'utf8');
const model = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8')).models
  .find(item => item.folder === 'g927-wireless');
const sizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'))[model.folder];
const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const product = context.window.talrivoCatalog.find(item => item.folder === model.folder);
assert.equal(product.public, true, 'Restore the G927 homepage entry after adding new material');
assert.equal(model.assets.length, 6);
assert.equal(product.images.length, 6);
assert.match(html, /<title>RGB Wireless Gaming Headset, 50mm \| G927 \| TALRIVO<\/title>/);
assert.match(html, /href="https:\/\/talrivo\.com\/gaming-headsets\/g927-wireless\/"/);
assert.match(html, /product=g927-wireless&amp;inquiry=sample#inquiry-form/);
assert.match(html, /Lifestyle scenes are illustrations/);
assert.match(html, /Packaging concept, not an approved packing list/);
assert.match(html, /Pictured parts are not automatically included/);
assert.match(html, /Bluetooth and 3\.5mm wired operation are not confirmed/);
assert.match(html, /USB audio support, playback and microphone input/);
const gallery = html.match(/<div class="model-gallery">([\s\S]*?)<\/div>/)[1];
assert.equal((gallery.match(/<figure>/g) || []).length, 6);
assert.equal((gallery.match(/loading="lazy"/g) || []).length, 6);
for (const [index, asset] of model.assets.entries()) {
  assert.ok(existsSync(asset));
  assert.ok(gallery.includes(`href="../../${asset}"`));
  assert.ok(!gallery.includes(`src="../../${asset}"`), 'Do not load full PNGs in the gallery');
  assert.ok(existsSync(`assets/catalog/g927-wireless/${product.images[index]}`));
  assert.ok(statSync(`assets/catalog/g927-wireless/${product.images[index]}`).size < 160000);
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
assert.match(readFileSync('sitemap.xml', 'utf8'), /<loc>https:\/\/talrivo\.com\/gaming-headsets\/g927-wireless\/<\/loc>\s*<lastmod>2026-10-28<\/lastmod>/);
console.log('G927 media checks passed: six responsive graphics, restored catalogue entry, receiver/packing boundaries and model-specific inquiry.');
