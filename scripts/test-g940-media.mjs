import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('gaming-headsets/g940-low-latency/index.html', 'utf8');
assert.ok(html.includes('<title>G940 2.4G Gaming Headset: Sample Review | TALRIVO</title>'));
assert.ok(html.includes('<link rel="canonical" href="https://talrivo.com/gaming-headsets/g940-low-latency/">'));
assert.match(html, /max-image-preview:large/);
assert.match(html, /class="seo-page g940-page buyer-product-page"/);
assert.match(html, /href="media.css\?v=20261026a"/);
for (const id of ['product-images', 'device-connections', 'receiver-accessories', 'documented-specifications']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  assert.ok(html.includes(`href="#${id}"`));
}
for (const name of ['product-presentation', 'gaming-desk-illustration', 'wearing-fit-illustration', 'packaging-concept', 'feature-board', 'device-connections-illustration']) {
  const original = `assets/catalog/g940-wireless/creative/g940-${name}.png`;
  assert.ok(html.includes(original));
  assert.ok(existsSync(original));
  for (const width of [480, 960]) assert.ok(existsSync(`assets/responsive/g940-${name}-${width}.webp`));
}
assert.equal((html.match(/<img[^>]+loading="lazy"/g) || []).length, 6);
assert.match(html, /AI-generated scenes/);
assert.match(html, /not real customer photos or performance-test records/);
assert.match(html, /display stand and other scene props are not included/i);
assert.match(html, /USB receiver, USB-C charging cable and user manual are confirmed standard accessories for this G940 configuration/);
assert.match(html, /2\.4GHz USB receiver/);
assert.match(html, /not Bluetooth pairing or wired USB audio through the headset charging port/);
assert.match(html, /not a compatibility-test record/);
assert.match(html, /Internal driver and chip artwork are illustrative, not teardown photos/);
assert.match(html, /View full-size device connection diagram/);
assert.match(html, /product=g940&amp;inquiry=quick-question#inquiry-form/);

const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const page = schemas.find(schema => schema['@type'] === 'WebPage');
assert.equal(page.dateModified, '2026-10-26');
assert.equal(page.image[0], 'https://talrivo.com/assets/catalog/g940-wireless/image-01.jpg');
assert.match(page.description, /confirmed 500mAh battery/);
const faqSection = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const visible = [...faqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(visible.length, 10);
assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => ({ question: question.name, answer: question.acceptedAnswer.text })), visible);

for (const file of ['gaming-headsets/g940-low-latency/index.html', 'gaming-headsets/index.html', 'wireless-gaming-headsets/index.html']) {
  const source = readFileSync(file, 'utf8');
  assert.match(source, /500\s?mAh/);
  assert.doesNotMatch(source, /400\s?mAh/);
}
const catalogue = readFileSync('catalog.js', 'utf8').match(/"model": "G940"([\s\S]*?)"model": "G942"/)[1];
assert.match(catalogue, /500 mAh battery/);
assert.doesNotMatch(catalogue, /400\s?mAh/);
const modal = readFileSync('script.js', 'utf8').match(/"G940-wireless": ([\s\S]*?)"G926-wireless":/)[1];
assert.match(modal, /\["Battery", "500 mAh"\]/);
assert.match(modal, /Confirm on selected 500 mAh sample/);
assert.doesNotMatch(modal, /400\s?mAh/);
const home = readFileSync('index.html', 'utf8');
assert.match(home, /catalog\.js\?v=20261026g940/);
assert.match(home, /script\.js\?v=20261026g940/);
assert.ok(readFileSync('sitemap.xml', 'utf8').includes('<loc>https://talrivo.com/gaming-headsets/g940-low-latency/</loc>\n    <lastmod>2026-10-26</lastmod>'));
assert.match(readFileSync('llms.txt', 'utf8'), /G940 Wireless Gaming Headset[^\n]*500mAh battery/);
assert.ok(readFileSync('.github/workflows/deploy-pages.yml', 'utf8').includes('node scripts/test-g940-media.mjs'));
console.log('G940 media checks passed: six illustrations, matching FAQ, confirmed 500mAh and accessories, consistent collection/modal data, stable title and canonical.');
