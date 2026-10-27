import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const catalogue = context.window.talrivoCatalog;
const review = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const sizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'));
const products = catalogue.filter(p => (['wireless', 'wired'].includes(p.category) && /^G\d+/.test(p.model))
  || ['bluetooth', 'tws'].includes(p.category));
assert.equal(products.length, 56);
assert.equal(new Set(products.map(p => p.page)).size, 56);
assert.equal(review.models.length, 43);
const sitemap = readFileSync('sitemap.xml', 'utf8');
const llms = readFileSync('llms.txt', 'utf8');
const code = readFileSync('contact-form.js', 'utf8');
const routes = vm.runInNewContext(`(${code.match(/const productSelections = (\{[\s\S]*?\n  \});/)[1]})`);
const contact = readFileSync('contact/index.html', 'utf8');
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
for (const product of products) {
  assert.ok(product.page, `${product.folder}: independent page required`);
  const html = readFileSync(`${product.page}index.html`, 'utf8');
  assert.ok(html.includes(`href="https://talrivo.com/${product.page}"`));
}
const titles = new Set();
let pending = 0;
for (const model of review.models) {
  const html = readFileSync(`${model.page}index.html`, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  assert.ok(!titles.has(title), `${model.folder}: duplicate title`);
  titles.add(title);
  assert.ok(html.includes(`data-model="${model.folder}"`));
  assert.equal(routes[model.inquiryKey], model.inquiryLabel);
  assert.ok(contact.includes(`<option>${esc(model.inquiryLabel)}</option>`));
  assert.ok(html.includes(`product=${model.inquiryKey}&amp;inquiry=quick-question`));
  assert.match(html, /Pictured parts are not automatically included/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  assert.equal(schemas.find(s => s['@type'] === 'WebPage').url, `https://talrivo.com/${model.page}`);
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  for (const question of faq.mainEntity) {
    assert.ok(html.includes(`<h3>${esc(question.name)}</h3><p>${esc(question.acceptedAnswer.text)}</p>`));
  }
  for (const [key, value] of model.specifications) {
    assert.ok(html.includes(`<strong>${esc(key)}</strong><span>${esc(value)}</span>`));
  }
  for (const asset of model.assets) assert.ok(existsSync(asset));
  assert.equal(sizes[model.folder].assets.length, model.assets.length);
  assert.equal(sizes[model.folder].variants.length, 2);
  for (const variant of sizes[model.folder].variants) {
    assert.ok(variant.width <= sizes[model.folder].assets[0].width, 'Do not enlarge low-resolution images');
    assert.ok(html.includes(`../../${variant.path} ${variant.width}w`));
    assert.ok(statSync(variant.path).size < 160000);
  }
  const noindex = /content="noindex, follow/.test(html);
  assert.equal(noindex, !model.indexable);
  assert.equal(sitemap.includes(`<loc>https://talrivo.com/${model.page}</loc>`), model.indexable);
  if (model.indexable) assert.ok(llms.includes(`https://talrivo.com/${model.page}`));
  else {
    pending += 1;
    assert.equal(catalogue.find(p => p.folder === model.folder).pageStatus, 'specification-pending');
    assert.match(html, /Specification confirmation is still needed/);
  }
  if (model.category === 'tws') {
    assert.match(html, /single charge or charging-case-assisted use/);
    assert.match(html, /whether ANC is on or off/);
  }
  if (model.conflicts.length) assert.doesNotMatch(html, /<strong>Driver<\/strong>/);
}
assert.equal(pending, 6);
for (const [folder, page] of [
  ['g936-wireless', 'gaming-headsets/g936-lightweight/'],
  ['g947-new', 'gaming-headsets/g947-foldable/'],
  ['tws-tws044f', 'tws-earbuds/tws044f/'],
  ['tws-earclip-09s', 'tws-earbuds/earclip09s/'],
]) assert.equal(catalogue.find(p => p.folder === folder).page, page, 'Preserve indexed canonical URLs');
const directory = readFileSync('gaming-headset-models/index.html', 'utf8');
for (const p of products.filter(p => ['wired', 'wireless'].includes(p.category))) {
  assert.ok(directory.includes(`href="../${p.page}"`));
}
for (const [file, category] of [
  ['wireless-gaming-headsets/index.html', 'wireless'],
  ['wired-gaming-headsets/index.html', 'wired'],
  ['bluetooth-headphones/index.html', 'bluetooth'],
  ['tws-earbuds/index.html', 'tws'],
]) {
  const html = readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
    .map(([, href]) => new URL(href.replaceAll('&amp;', '&'), `https://talrivo.com/${file}`).href);
  for (const p of products.filter(p => p.category === category)) {
    assert.ok(hrefs.includes(`https://talrivo.com/${p.page}`), `${file}: missing ${p.folder}`);
  }
}
execFileSync(process.execPath, ['scripts/build-model-pages.mjs', 'all', '--check'], { stdio: 'inherit' });
console.log('Model page checks passed: 26 G-Series versions, 3 Bluetooth and 27 TWS/open-ear pages; distinct routes, matching inquiry options and six gated references.');
