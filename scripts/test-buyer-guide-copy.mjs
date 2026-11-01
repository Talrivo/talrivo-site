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

const buyerDemandCases = [
  ['private-label-gaming-headset-rfq-checklist',
    'Private Label Gaming Headset Quotes: MOQ & Sample Checklist', 'quote-comparison', 6],
  ['gaming-headset-ear-cushion-material-sample-checklist',
    'Fabric vs PU Gaming Headset Ear Cushions | Fit & Comfort', 'material-comparison', 5],
];
const demandSitemap = readFileSync('sitemap.xml', 'utf8');
const demandLlms = readFileSync('llms.txt', 'utf8');
const demandPages = new Map();
const decodeAmpersand = text => text.replaceAll('&amp;', '&');
for (const [slug, title, anchor, faqCount] of buyerDemandCases) {
  const html = readFileSync(`${base}${slug}/index.html`, 'utf8');
  demandPages.set(slug, html);
  const url = `https://talrivo.com/insights/${slug}/`;
  assert.equal(decodeAmpersand(html.match(/<title>([^<]+)<\/title>/)[1]), title);
  for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
    assert.equal(decodeAmpersand(html.match(new RegExp(`<meta ${attribute} content="([^"]+)"`))[1]), title);
  }
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => text);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const article = schemas.find(schema => schema['@type'] === 'Article');
  assert.equal(article.headline, title);
  assert.equal(article.description, descriptions[0]);
  assert.equal(article.dateModified, '2026-11-01');
  assert.equal(article.mainEntityOfPage, url);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes('<meta name="robots" content="index, follow">'));
  assert.ok(html.includes(`href="#${anchor}"`));
  assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  const visibleSection = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visibleFaq = [...visibleSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.equal(visibleFaq.length, faqCount);
  assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
    .map(question => ({ question: question.name, answer: question.acceptedAnswer.text })), visibleFaq);
  assert.ok(demandSitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-11-01</lastmod>`));
  assert.ok(demandLlms.includes(`](${url}):`));
  assert.doesNotMatch(html, /guaranteed to increase clicks|guaranteed compatibility|free samples?|MOQ[: ]+\d|lead time[: ]+\d/i);
}
const quoteGuide = demandPages.get('private-label-gaming-headset-rfq-checklist');
assert.match(quoteGuide, /there is no single MOQ for the whole range/);
assert.match(quoteGuide, /included, optional and separately charged items/);
assert.match(quoteGuide, /href="\.\.\/\.\.\/rfq-guide\/"/);
assert.match(quoteGuide, /inquiry=rfq#inquiry-form/);
const cushionGuide = demandPages.get('gaming-headset-ear-cushion-material-sample-checklist');
for (const fact of ['memory foam describes the filling', 'does not establish the G936 foam specification',
  'not a completed comfort or cooling test', 'Not tested',
  'href="../../assets/downloads/wireless-gaming-headset-sample-review.txt" download']) {
  assert.ok(cushionGuide.includes(fact), `Cushion guide needs the boundary: ${fact}`);
}
for (const file of ['oem-odm/index.html', 'rfq-guide/index.html']) {
  assert.ok(readFileSync(file, 'utf8').includes('href="../insights/private-label-gaming-headset-rfq-checklist/#quote-comparison"'));
}
assert.ok(readFileSync('gaming-headsets/g936-lightweight/index.html', 'utf8')
  .includes('href="../../insights/gaming-headset-ear-cushion-material-sample-checklist/#material-comparison"'));
console.log('Buyer-demand guide checks passed: two distinct intents, matching FAQs, factual limits and three discovery links.');
