import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync('gaming-headsets/g926-wireless/index.html', 'utf8');
assert.ok(html.includes('<title>RGB Wireless Gaming Headset for Your Brand | G926</title>'));
assert.ok(html.includes('<link rel="canonical" href="https://talrivo.com/gaming-headsets/g926-wireless/">'));
assert.match(html, /max-image-preview:large/);
assert.match(html, /href="media.css\?v=20261027a"/);
for (const id of ['product-images', 'device-connections', 'documented-specifications', 'receiver-accessories']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  assert.ok(html.includes(`href="#${id}"`));
}
const gallery = html.match(/<div class="g926-creative-grid">([\s\S]*?)<\/div>/)[1];
assert.equal((gallery.match(/<article\b/g) || []).length, 6);
assert.equal((gallery.match(/loading="lazy"/g) || []).length, 6);
for (const name of ['feature-overview', 'product-presentation', 'gaming-scene-illustration', 'wearing-fit-illustration', 'controls-material-illustration', 'device-connections-illustration']) {
  const original = `assets/catalog/g926-wireless/creative/g926-${name}.png`;
  assert.ok(gallery.includes(original));
  assert.ok(existsSync(original));
  for (const width of [480, 960]) assert.ok(existsSync(`assets/responsive/g926-${name}-${width}.webp`));
}
assert.match(html, /AI-generated scenes, not customer photos or test reports/);
assert.match(html, /not a zero-delay demonstration/);
assert.match(html, /receiver-based 2\.4GHz use, not Bluetooth pairing/);
assert.match(html, /not a completed compatibility test or an agreed packing list/);
assert.match(html, /confirm the exact included set with your sample/);
assert.match(html, /internal-driver artwork is illustrative, not a teardown/);
assert.match(html, /<details class="g926-reference-details">/);
assert.doesNotMatch(html, /<details class="g926-reference-details" open/);
assert.match(html, /g926-packaging-accessory-set\.jpg/);
assert.match(html, /product=g926&amp;inquiry=quick-question#inquiry-form/);
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const page = schemas.find(schema => schema['@type'] === 'WebPage');
assert.equal(page.dateModified, '2026-10-27');
assert.equal(page.image[0], 'https://talrivo.com/assets/catalog/g926-wireless/evidence/display/g926-product-overview-receiver.jpg');
const section = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const decode = text => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const visible = [...section.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question: decode(question), answer: decode(answer) }));
assert.equal(visible.length, 6);
assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => ({ question: question.name, answer: question.acceptedAnswer.text })), visible);
console.log('G926 media checks passed: six responsive creative images, preserved packing references, matching FAQ and stable specifications/title/canonical.');
