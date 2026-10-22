import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const category = readFileSync('gaming-headsets/index.html', 'utf8');
const g938 = readFileSync('gaming-headsets/g938-wireless/index.html', 'utf8');
assert.ok(g938.includes('<title>G938 Tri-Mode Gaming Headset | 2.4G/Bluetooth/Wired Sourcing</title>'),
  'Keep the G938 title stable during the description observation period');
const g938Description = 'G938 tri-mode wireless gaming headset: 2.4GHz, Bluetooth and wired. Review 53mm drivers, receiver photos and hands-on setup before private-label sampling.';
for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
  assert.ok(g938.includes(`<meta ${attribute} content="${g938Description}">`));
}
const g938Page = [...g938.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'WebPage');
assert.equal(g938Page.description, g938Description);
for (const evidence of ['53mm drivers', 'id="receiver-accessories"', 'id="hands-on-demo"']) {
  assert.ok(g938.includes(evidence), `G938 snippet must have visible support: ${evidence}`);
}
for (const [file, title] of [
  ['gaming-headsets/index.html', 'Gaming Headset Manufacturer | OEM &amp; Private Label | TALRIVO'],
  ['wireless-gaming-headsets/index.html', 'Private Label Wireless Gaming Headsets | TALRIVO'],
]) {
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes(`<title>${title}</title>`), `${file}: preserve the procurement title`);
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, description]) => description);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1, `${file}: synchronize search and social descriptions`);
  const collection = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'CollectionPage');
  assert.equal(collection.description, descriptions[0]);
  assert.match(descriptions[0], /our own manufacturing business in China/);
  assert.match(html, /TALRIVO represents our own audio manufacturing business in China/);
  assert.ok(html.includes('href="../oem-odm/#customization-scope"'));
  assert.ok(html.includes('href="../gaming-headset-quality-review/#production-video"'));
}
assert.ok(category.indexOf('id="headset-models"') < category.indexOf('aria-labelledby="dock-title"'),
  'Show model choices before the dock preview');
assert.ok(category.indexOf('id="headset-models"') < category.indexOf('Worked selection example'),
  'Show model choices before the illustrative selection process');
const modelSection = category.match(/<section[^>]*id="headset-models"[\s\S]*?<\/section>/)[0];
const cards = [...modelSection.matchAll(/<article>[\s\S]*?<\/article>/g)].map(([card]) => card);
assert.equal(cards.length, 8, 'Retain the original seven choices and add G946');
assert.equal(cards.filter(card => card.includes('href="g946-rgb/"')).length, 1);
const schemas = [...category.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const items = schemas.find(schema => schema['@type'] === 'CollectionPage').mainEntity.itemListElement;
assert.deepEqual(items.map(item => item.url), cards.map(card => {
  const href = card.match(/<h3><a[^>]*href="([^"]+)"/)[1];
  return new URL(href, 'https://talrivo.com/gaming-headsets/').href;
}), 'Structured list must match the visible model order');

const product = readFileSync('gaming-headsets/g946-rgb/index.html', 'utf8');
for (const id of ['style-video', 'documented-specifications', 'sample-configuration']) {
  assert.ok(product.includes(`id="${id}"`), `Missing G946 destination: ${id}`);
  assert.ok(product.includes(`href="#${id}"`), `Missing G946 navigation: ${id}`);
}
assert.match(product, /https:\/\/www.youtube.com\/shorts\/PGj_ESVdFgA/);
assert.match(product, /not real customer footage/);
assert.match(product, /not establish compatibility or included accessories/);
assert.match(product, /reference=g946-style/);
assert.doesNotMatch(product, /<iframe/, 'The style link must not load third-party video before a user action');
assert.doesNotMatch(product, /"@type":"VideoObject"/, 'Do not invent video upload metadata');
console.log('Buyer entry checks passed: model prominence, eight matching structured choices, G946 anchors and style-video boundaries.');
