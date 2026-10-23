import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'insights/';
const pages = [
  ['gaming-headset-usb-audio-or-lighting', 'Gaming Headset USB: Audio or Lighting Only? | TALRIVO'],
  ['2-4g-vs-bluetooth-gaming-headsets-importers', '2.4G vs Bluetooth Gaming Headsets for Importers'],
  ['evaluate-gaming-headset-sample-before-bulk-order', 'Gaming Headset Sample Checklist Before Bulk Order | TALRIVO'],
  ['choose-gaming-headset-manufacturer-china', 'How to Choose a Gaming Headset Manufacturer in China | TALRIVO'],
];
const html = pages.map(([slug, title]) => {
  const content = readFileSync(`${base}${slug}/index.html`, 'utf8');
  assert.ok(content.includes(`<title>${title}</title>`), `${slug}: keep search title stable`);
  assert.ok(content.includes(`<link rel="canonical" href="https://talrivo.com/insights/${slug}/">`));
  const schemas = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  assert.equal(schemas.find(schema => schema['@type'] === 'Article').dateModified, '2026-10-22');
  const claims = content.replaceAll('Do not promise zero latency.', '');
  assert.doesNotMatch(claims, /guaranteed compatibility|guaranteed to increase clicks|zero latency/i);
  return content;
});
const [usb, connection, sample] = html;
const manufacturer = html[3];
assert.match(manufacturer, /TALRIVO represents our own audio manufacturing business in China/);
assert.match(manufacturer, /id="supplier-questions" aria-labelledby="supplier-questions-title"/);
assert.match(manufacturer, /href="#supplier-questions">Start with Four Questions/);
const questions = manufacturer.match(/<section[^>]*id="supplier-questions"[\s\S]*?<\/section>/)?.[0];
assert.ok(questions);
assert.equal((questions.match(/<strong>[1-4]\./g) || []).length, 4);
for (const target of [
  '../../gaming-headset-quality-review/#production-video',
  '../evaluate-gaming-headset-sample-before-bulk-order/#review-worksheet',
  '../../oem-odm/#customization-scope',
  '../../gaming-headset-quality-review/#published-certificates',
]) {
  assert.ok(questions.includes(`href="${target}"`), `Manufacturer question needs a reviewable source: ${target}`);
}
assert.match(questions, /G936 is not listed in those two documents/);
assert.match(questions, /not a G935 performance test/);
assert.match(questions, /inquiry=quick-question/);
assert.ok(usb.indexOf('href="#no-sound"') < usb.indexOf('<figure'), 'Offer troubleshooting before the large product image');
assert.match(usb, /<section id="no-sound">/);
assert.match(usb, /not a connection test/);
assert.match(usb, /splitter is not included in the standard package or headset unit price/);
assert.match(usb, /inquiry=quick-question&amp;reference=usb-connection-guide/);
assert.match(connection, /href="#device-compatibility">Check Your Device Setup/);
assert.match(connection, /three modes do not automatically mean simultaneous audio/);
assert.match(connection, /not a TALRIVO test result/);
assert.match(connection, /Do not promise zero latency\./);
assert.match(sample, /href="#review-worksheet">Get the Sample Checklist/);
assert.match(sample, /does not prove that every bulk unit will match/);
assert.match(sample, /not a completed test report/);
assert.match(sample, /download>Download English Worksheet/);
const index = readFileSync('insights/index.html', 'utf8');
assert.ok(index.includes('href="gaming-headset-usb-audio-or-lighting/#no-sound"'));
console.log('Buyer guide checks passed: stable titles, direct answer paths and preserved evidence boundaries.');
