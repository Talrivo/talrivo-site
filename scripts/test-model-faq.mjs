import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const worksheet = '../../assets/downloads/wireless-gaming-headset-sample-review.txt';
for (const file of [
  'gaming-headsets/g936-lightweight/index.html',
  'gaming-headsets/g938-wireless/index.html',
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
  assert.ok(html.includes(`href="${worksheet}" download`), `${file}: expose the editable review sheet`);
  assert.ok(existsSync(resolve(dirname(file), worksheet)), `${file}: worksheet target must exist`);
  assert.match(html, /blank worksheet, not a completed test report/);
}
console.log('Model FAQ checks passed: G936/G938 visible and structured answers match; blank review sheets remain accessible.');
