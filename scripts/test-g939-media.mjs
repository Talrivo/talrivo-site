import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('gaming-headsets/g939-wireless/index.html', 'utf8');
const registry = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const model = registry.models.find(item => item.folder === 'g939-wireless');
const sizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'))[model.folder];
const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const product = context.window.talrivoCatalog.find(item => item.folder === model.folder);
assert.equal(model.assets.length, 6);
assert.equal(product.images.length, 6);
assert.deepEqual(model.specifications.find(([key]) => key === 'Driver'), ['Driver', '50 mm']);
assert.deepEqual(model.conflicts, []);
assert.match(html, /<title>White Wireless Gaming Headset, 50mm \| G939 \| TALRIVO<\/title>/);
assert.match(html, /<h1>White 2\.4GHz Wireless Gaming Headset<\/h1>/);
assert.match(html, /<link rel="canonical" href="https:\/\/talrivo\.com\/gaming-headsets\/g939-wireless\/">/);
assert.match(html, /up to 50 hours with lights off/);
assert.match(html, /not Bluetooth pairing/);
assert.match(html, /not customer photos or test reports/);
assert.match(html, /not a teardown/);
assert.match(html, /Pictured parts are not automatically included/);
assert.match(html, /not a completed compatibility test/);
assert.match(html, /not as proof of USB wired audio/);
assert.match(html, /href="\.\.\/\.\.\/gaming-headsets\/g939-wired\/"/);
assert.match(html, /product=g939-wireless&amp;inquiry=sample#inquiry-form/);
for (const section of model.sections) {
  assert.equal((html.match(new RegExp(`id="${section.id}"`, 'g')) || []).length, 1);
  assert.ok(html.includes(`href="#${section.id}"`));
}
const gallery = html.match(/<div class="model-gallery">([\s\S]*?)<\/div>/)[1];
assert.equal((gallery.match(/<figure>/g) || []).length, 6);
assert.equal((gallery.match(/loading="lazy"/g) || []).length, 6);
for (let index = 0; index < model.assets.length; index += 1) {
  const asset = model.assets[index];
  assert.ok(existsSync(asset));
  assert.ok(html.includes(`href="../../${asset}"`), 'Keep original graphics accessible');
  assert.ok(html.includes(model.assetDescriptions[index].alt));
  assert.ok(!gallery.includes(`src="../../${asset}"`), 'Use compressed previews, not full PNGs');
  const catalogueImage = `assets/catalog/g939-wireless/${product.images[index]}`;
  assert.ok(existsSync(catalogueImage));
  assert.ok(statSync(catalogueImage).size < 160000);
  assert.equal(sizes.assets[index].variants.length, 2);
  for (const variant of sizes.assets[index].variants) {
    const bytes = readFileSync(variant.path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(variant.width <= sizes.assets[index].width);
    assert.ok(bytes.length < 160000);
    assert.ok(gallery.includes(`../../${variant.path} ${variant.width}w`));
  }
}
const script = readFileSync('script.js', 'utf8');
const modal = script.match(/"G939-wireless": \{([\s\S]*?)\n  \},/)[1];
assert.match(modal, /\["Driver", "50 mm"\]/);
assert.doesNotMatch(modal, /40 mm|RGB dynamic running light/);
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const page = schemas.find(item => item['@type'] === 'WebPage');
assert.equal(page.dateModified, '2026-10-27');
assert.equal(page.image, `https://talrivo.com/${model.assets[0]}`);
assert.equal(schemas.find(item => item['@type'] === 'FAQPage').mainEntity.length, 5);
assert.ok(readFileSync('llms.txt', 'utf8').includes('White G939 Wireless Gaming Headset'));
console.log('G939 media checks passed: six responsive images, 50mm driver consistency, qualified runtime, receiver/device and pictured-packing boundaries.');
