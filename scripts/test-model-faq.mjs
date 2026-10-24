import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const worksheet = '../../assets/downloads/wireless-gaming-headset-sample-review.txt';
for (const file of [
  'gaming-headsets/g936-lightweight/index.html',
  'gaming-headsets/g938-wireless/index.html',
  'insights/gaming-headset-packaging-accessories-checklist/index.html',
]) {
  const html = readFileSync(file, 'utf8');
  const section = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, `${file}: missing visible FAQ`);
  const visible = [...section.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.ok(visible.length >= 6, `${file}: retain the existing model FAQs`);
  const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map(item => ({ question: item.name, answer: item.acceptedAnswer.text })),
    visible, `${file}: structured FAQ must match all visible questions and answers`);
  if (file.startsWith('gaming-headsets/')) {
    assert.ok(html.includes(`href="${worksheet}" download`), `${file}: expose the editable review sheet`);
    assert.ok(existsSync(resolve(dirname(file), worksheet)), `${file}: worksheet target must exist`);
    assert.match(html, /blank worksheet, not a completed test report/);
  } else {
    assert.match(html, /id="packing-checklist" aria-labelledby="packing-checklist-title"/);
    assert.match(html, /href="#packing-checklist">Check What Is Included/);
    assert.match(html, /No pouch is shown in this photo/);
    assert.match(html, /not the agreed packing list for every G926 version/);
    assert.doesNotMatch(html, /no-pouch version clarifies standard contents/);
    const packingSheet = '../../assets/downloads/gaming-headset-packing-review-sheet.txt';
    assert.ok(html.includes(`href="${packingSheet}" download`));
    const sheet = readFileSync(resolve(dirname(file), packingSheet), 'utf8');
    assert.match(sheet, /Blank buyer worksheet\. Not an approved packing list or a quotation/);
    assert.match(sheet, /Included \/ Optional \/ Not included \/ Not confirmed/);
    assert.match(sheet, /No accessory is confirmed as included/);
    assert.match(sheet, /CTIA Y-splitter \| Not confirmed/);
    assert.match(html, /inquiry=packaging&amp;reference=packing-checklist#inquiry-form/);
  }
}
console.log('FAQ checks passed: G936, G938 and packaging visible/structured answers match; model worksheets and packaging boundaries retained.');
