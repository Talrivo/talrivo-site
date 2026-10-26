import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('gaming-headsets/g947-foldable/index.html', 'utf8');
assert.ok(html.includes('<title>G947 Tri-Mode Gaming Headset | OEM/ODM | TALRIVO</title>'));
assert.ok(html.includes('<link rel="canonical" href="https://talrivo.com/gaming-headsets/g947-foldable/">'));
assert.match(html, /max-image-preview:large/);
assert.match(html, /class="seo-page g947-page buyer-product-page"/);
assert.match(html, /href="media.css\?v=20261026a"/);
for (const id of ['product-images', 'device-connections', 'documented-specifications', 'sample-configuration']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  assert.ok(html.includes(`href="#${id}"`));
}
const gallery = html.match(/<div class="g947-image-grid">([\s\S]*?)<\/div>/)[1];
assert.equal((gallery.match(/<article\b/g) || []).length, 4);
for (const name of ['product-presentation', 'gaming-desk-illustration', 'wearing-fit-illustration', 'packaging-concept', 'platform-connections-illustration']) {
  assert.ok(html.includes(`assets/catalog/g947-new/creative/g947-${name}.png`));
  assert.ok(existsSync(`assets/catalog/g947-new/creative/g947-${name}.png`));
  for (const width of [480, 960]) assert.ok(existsSync(`assets/responsive/g947-${name}-${width}.webp`));
}
assert.equal((html.match(/<img[^>]+loading="lazy"/g) || []).length, 5);
assert.match(html, /AI-generated lifestyle scenes/);
assert.match(html, /not real customer photos, connection demonstrations or comfort-test results/);
assert.match(html, /Platform names do not mean that every connection mode or microphone feature works on every device/);
assert.match(html, /not a record of tests on every pictured platform or operating-system version/);
assert.doesNotMatch(html, /Wireless Dongle Slot|G947%20Foldable|guaranteed compatibility|all platforms supported/i);
for (const withheld of ['controls-material-board', 'multi-scene-concept-a', 'multi-scene-concept-b']) {
  assert.ok(!existsSync(`assets/catalog/g947-new/creative/g947-${withheld}.png`), `${withheld} is not selected for publication`);
}
assert.match(html, /USB receiver, detachable boom microphone, USB-C charging cable and 3.5mm audio cable are confirmed standard accessories for this G947 version/);
assert.match(html, /product=g947&amp;inquiry=quick-question#inquiry-form/);
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
assert.equal(schemas.find(schema => schema['@type'] === 'WebPage').dateModified, '2026-10-26');
assert.equal(schemas.find(schema => schema['@type'] === 'WebPage').image, 'https://talrivo.com/assets/catalog/g947-new/image-01.jpg');
const faqHtml = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const visible = [...faqHtml.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(visible.length, 5);
assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => ({question: question.name, answer: question.acceptedAnswer.text})), visible);
assert.ok(readFileSync('sitemap.xml', 'utf8').includes('<loc>https://talrivo.com/gaming-headsets/g947-foldable/</loc>\n    <lastmod>2026-10-26</lastmod>'));
assert.ok(readFileSync('.github/workflows/deploy-pages.yml', 'utf8').includes('node scripts/test-g947-media.mjs'));
console.log('G947 media checks passed: five responsive illustrations, confirmed accessory scope, stable title/canonical, matching FAQ and inquiry routes.');
