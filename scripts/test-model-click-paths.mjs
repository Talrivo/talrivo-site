import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const review = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const catalogue = context.window.talrivoCatalog;
const sitemap = readFileSync('sitemap.xml', 'utf8');
let tws = 0;
for (const model of review.models) {
  const html = readFileSync(`${model.page}index.html`, 'utf8');
  const resources = html.match(/<section class="seo-section model-resources">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(resources, `${model.folder}: missing related resources`);
  const sampleLink = resources.match(/class="model-sample-link" href="([^"]+)"/);
  assert.ok(sampleLink, `${model.folder}: preserve model context at the bottom of the page`);
  const destination = new URL(sampleLink[1].replaceAll('&amp;', '&'), `https://talrivo.com/${model.page}`);
  assert.equal(destination.pathname, '/contact/');
  assert.equal(destination.searchParams.get('product'), model.inquiryKey);
  assert.equal(destination.searchParams.get('inquiry'), 'sample');
  assert.equal(destination.hash, '#inquiry-form');
  assert.match(resources, /href="\.\.\/\.\.\/sample-request\/">Sample Review Guide/);
  assert.doesNotMatch(resources, /sample-request\/">Sample Request/);
  if (model.category === 'tws') {
    tws += 1;
    assert.doesNotMatch(resources, /gaming-headset-models/);
    assert.match(resources, /href="\.\.\/\.\.\/tws-earbuds\/"/);
  }
  const version = html.match(/<p class="model-version-link">([\s\S]*?)<\/p>/);
  if (version) {
    const path = version[1].match(/href="\.\.\/\.\.\/([^"]+)"/)[1];
    const sibling = catalogue.find(item => item.page === path);
    assert.ok(sibling, `${model.folder}: unknown connection version`);
    assert.notEqual(sibling.public, false, 'Do not promote hidden model versions');
    assert.notEqual(sibling.pageStatus, 'specification-pending', 'Do not promote unconfirmed model versions');
    assert.ok(html.indexOf(version[0]) < html.indexOf('id="product-images"'));
  }
  assert.doesNotMatch(html, /<section class="seo-section"><p class="model-status">Looking for the other connection version/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const modified = [review.pageRevisionDate || review.date, model.dateModified || review.date].sort().at(-1);
  assert.equal(schemas.find(item => item['@type'] === 'WebPage').dateModified, modified);
  if (model.indexable) {
    const record = sitemap.match(new RegExp(`<url>\\s*<loc>https://talrivo\\.com/${model.page}</loc>[\\s\\S]*?</url>`))?.[0];
    assert.ok(record?.includes(`<lastmod>${modified}</lastmod>`));
  }
}
assert.equal(tws, 25);
const pendingSibling = readFileSync('gaming-headsets/g920-wireless/index.html', 'utf8');
assert.doesNotMatch(pendingSibling, /class="model-version-link"/, 'Do not send G920 wireless buyers to the pending wired version');
for (const [folder, title, heading] of [
  ['g942-wireless', '2.4GHz Wireless Gaming Headset for OEM Samples | G942', '2.4GHz Wireless Gaming Headset for Your Brand'],
  ['g935-wired', 'Wired Gaming Headset for Your Brand | G935 | TALRIVO', 'Wired Gaming Headset for Your Brand'],
]) {
  const model = review.models.find(item => item.folder === folder);
  const html = readFileSync(`${model.page}index.html`, 'utf8');
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<h1>${heading}</h1>`));
}
const css = readFileSync('gaming-headsets/model-pages.css', 'utf8');
assert.match(css, /\.model-page \.seo-section\s*\{[^}]*padding-top: 3rem;[^}]*padding-bottom: 3rem;/);
console.log('Model click-path checks passed: 43 model-specific sample links, 25 TWS resource paths, eligible version links and two product-led search entries.');
