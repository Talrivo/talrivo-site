import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const category = readFileSync('gaming-headsets/index.html', 'utf8');
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
