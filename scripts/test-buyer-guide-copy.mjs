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
  assert.equal(schemas.find(schema => schema['@type'] === 'Article').dateModified,
    slug === 'choose-gaming-headset-manufacturer-china' ? '2026-10-25' : '2026-10-22');
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
  '../../videos/gaming-headset-assembly/',
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

const receiverGuide = readFileSync(`${base}choose-2-4g-wireless-gaming-headset/index.html`, 'utf8');
const receiverTitle = '2.4GHz Gaming Headset Receiver Guide: USB-A vs USB-C';
assert.ok(receiverGuide.includes(`<title>${receiverTitle}</title>`));
for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
  assert.ok(receiverGuide.includes(`<meta ${attribute} content="${receiverTitle}">`));
}
const receiverDescriptions = [...receiverGuide.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(receiverDescriptions.length, 3);
assert.equal(new Set(receiverDescriptions).size, 1);
const receiverSchemas = [...receiverGuide.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const receiverArticle = receiverSchemas.find(schema => schema['@type'] === 'Article');
assert.equal(receiverArticle.headline, receiverTitle);
assert.equal(receiverArticle.description, receiverDescriptions[0]);
assert.equal(receiverArticle.dateModified, '2026-10-31');
const receiverUrl = 'https://talrivo.com/insights/choose-2-4g-wireless-gaming-headset/';
assert.equal(receiverArticle.mainEntityOfPage, receiverUrl);
assert.ok(receiverGuide.includes(`<link rel="canonical" href="${receiverUrl}">`));
const receiverFaq = receiverGuide.match(/<section class="seo-section seo-faq"[^>]*>([\s\S]*?)<\/section>/)[1];
const receiverVisibleFaq = [...receiverFaq.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(receiverVisibleFaq.length, 4);
assert.deepEqual(receiverSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => ({ question: question.name, answer: question.acceptedAnswer.text })), receiverVisibleFaq);
assert.ok(receiverGuide.indexOf('href="#receiver-checks"') < receiverGuide.indexOf('<img src='));
for (const fact of ['completed Bluetooth pairing is not clearly visible', 'not a completed test report', 'Not tested',
  'href="../../assets/downloads/wireless-gaming-headset-sample-review.txt" download',
  'href="../../videos/g938-phone-setup-controls/"']) assert.ok(receiverGuide.includes(fact));
const wireless = readFileSync('wireless-gaming-headsets/index.html', 'utf8');
assert.ok(wireless.includes('href="../insights/choose-2-4g-wireless-gaming-headset/#receiver-checks"'));
assert.ok(readFileSync('sitemap.xml', 'utf8').includes(`<loc>${receiverUrl}</loc>\n    <lastmod>2026-10-31</lastmod>`));
console.log('Receiver guide checks passed: practical answer, matching FAQ, worksheet and demo paths, stable canonical.');
