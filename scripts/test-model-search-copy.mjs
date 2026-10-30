import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cases = [
  ['gaming-headsets/g940-low-latency/', 'g940',
    'Dual-Driver Wireless Gaming Headset | G940 | TALRIVO', 'Dual-driver wireless gaming headset'],
  ['gaming-headsets/g935-wireless/', 'g935',
    'Wireless Gaming Headset with Detachable Mic | G935', 'Wireless gaming headset with a detachable microphone'],
  ['gaming-headsets/g946-rgb/', 'g946',
    'Tri-Mode RGB Wireless Gaming Headset | G946 | TALRIVO', 'Tri-mode RGB gaming headset for your brand'],
  ['gaming-headsets/g947-foldable/', 'g947',
    'Tri-Mode Gaming Headset, Aluminum Frame | G947', 'Tri-mode gaming headset with an aluminum frame'],
  ['bluetooth-headphones/b7-bluetooth/', 'b7',
    'ANC Bluetooth Headphones with Rotating Earcups | B7', 'ANC Bluetooth headphones with rotating earcups'],
  ['bluetooth-headphones/b9-bluetooth/', 'b9',
    'Bluetooth 5.3 Over-Ear Headphones, 40mm | B9 | TALRIVO', 'Bluetooth 5.3 over-ear headphones for your brand'],
  ['bluetooth-headphones/b10-bluetooth/', 'b10',
    'ANC Bluetooth Over-Ear Headphones, USB-C | B10', 'ANC Bluetooth over-ear headphones with USB-C charging'],
  ['gaming-headsets/g923-wireless/', 'g923-wireless',
    'Wireless Gaming Headset, 40mm Driver | G923 | TALRIVO', 'Wireless gaming headset with a 40mm driver'],
  ['gaming-headsets/g942-wired/', 'g942-wired',
    'RGB Wired Gaming Headset for Custom Branding | G942', 'RGB wired gaming headset for your brand'],
  ['gaming-headsets/g936-wired/', 'g936-wired',
    'Wired Gaming Headset, Approx. 191g | G936 | TALRIVO', 'Wired gaming headset, approximately 191g'],
  ['gaming-headsets/g939-wired/', 'g939-wired',
    '50mm Wired Gaming Headset | G939 | TALRIVO', 'Wired gaming headset with a 50mm driver'],
  ['gaming-headsets/g923-wired/', 'g923-wired',
    '52mm RGB Wired Gaming Headset | G923 | TALRIVO', 'RGB wired gaming headset with a 52mm driver'],
  ['gaming-headsets/g921-wired/', 'g921-wired',
    '52mm Wired Gaming Headset for Your Brand | G921', '52mm wired gaming headset for your brand'],
  ['gaming-headsets/g919-wired/', 'g919-wired',
    '50mm Wired Gaming Headset for Custom Branding | G919', '50mm wired gaming headset for custom branding'],
];
const review = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const sitemap = readFileSync('sitemap.xml', 'utf8');
const llms = readFileSync('llms.txt', 'utf8');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'");
const htmlByKey = new Map();
const titles = new Set();
for (const [path, key, title, heading] of cases) {
  const html = readFileSync(`${path}index.html`, 'utf8');
  htmlByKey.set(key, html);
  assert.equal(decode(html.match(/<title>([^<]+)<\/title>/)[1]), title, `${key}: product-led title`);
  assert.ok(!titles.has(title), `${key}: distinct title`);
  titles.add(title);
  assert.doesNotMatch(title, /Sample & OEM Review|RFQ|^G\d|^B\d/);
  for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
    assert.equal(decode(html.match(new RegExp(`<meta ${attribute} content="([^"]+)"`))[1]), title);
  }
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => decode(text));
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1, `${key}: synchronized search and share descriptions`);
  assert.match(descriptions[0], /gaming headset|headphones/i);
  assert.match(descriptions[0], /samples?/i);
  assert.doesNotMatch(descriptions[0], /RFQ|feasibility|^Review TALRIVO|zero[- ]delay|guaranteed|free sample/i);
  assert.ok(html.includes(`<h1>${heading}</h1>`), `${key}: matching visible product angle`);
  const url = `https://talrivo.com/${path}`;
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const page = schemas.find(schema => schema['@type'] === 'WebPage');
  assert.equal(page.url, url);
  assert.equal(page.description, descriptions[0]);
  assert.equal(page.dateModified, '2026-10-30');
  if (!html.includes('Generated from content/model-page-reviews.json')) assert.equal(page.name, title);
  assert.ok(sitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-10-30</lastmod>`));
  assert.ok(llms.includes(`](${url}):`));
  const hero = html.match(/<section class="seo-hero product-detail">([\s\S]*?)<\/section>/)[1];
  assert.ok(hero.includes(`contact/?product=${key}&amp;inquiry=sample#inquiry-form`), `${key}: keep contextual sample inquiry`);
  if (path.endsWith('-wired/')) {
    assert.match(hero, /3\.5mm plus USB/);
    assert.match(hero, /audio (?:route|connector)|connector carries audio/);
    assert.match(html, /A listed USB connector alone does not prove USB audio/);
  }
  const record = review.models.find(model => model.page === path);
  if (record) {
    assert.equal(record.title, title);
    assert.equal(record.heading, heading);
    assert.equal(record.description, descriptions[0]);
    assert.equal(record.dateModified, '2026-10-30');
    assert.equal(record.indexable, true);
  }
}
for (const [key, facts] of [
  ['g940', ['35mm + 16mm', 'confirmed 500mAh battery', 'approximately 20 hours with lighting off']],
  ['g935', ['40mm', '500mAh', 'approximately 25 hours of playback with lighting off']],
  ['g946', ['2.4GHz wireless, Bluetooth and wired', 'whether the selected configuration includes a charging dock']],
  ['g947', ['aluminum frame', '50mm', 'detachable boom microphone']],
  ['b7', ['Bluetooth 5.2', '500mAh', 'Confirm noise-cancellation performance', 'Rotation is not a claim that the headband folds']],
  ['b9', ['Bluetooth 5.3 + EDR', '300mAh', 'approximately 16-22 hours', 'not an approved packing list']],
  ['b10', ['500mAh', 'approximately 20-30 hours', 'Confirm the ANC setting, volume and runtime conditions']],
]) {
  for (const fact of facts) assert.ok(htmlByKey.get(key).includes(fact), `${key}: retain ${fact}`);
}
const b9Hero = htmlByKey.get('b9').match(/<section class="seo-hero product-detail">([\s\S]*?)<\/section>/)[1];
assert.doesNotMatch(b9Hero, /ANC|noise.cancell/i, 'Do not transfer B7 or B10 ANC to B9');
for (const key of ['g940', 'g946', 'g947']) {
  const hero = htmlByKey.get(key).match(/<section class="seo-hero product-detail">([\s\S]*?)<\/section>/)[1];
  assert.doesNotMatch(hero, /foldable|simultaneous|all platforms supported|guaranteed/i);
}
console.log('Model search-copy checks passed: 14 differentiated pages, aligned metadata, preserved sample routes and factual limits.');
