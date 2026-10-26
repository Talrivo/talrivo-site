import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const category = readFileSync('gaming-headsets/index.html', 'utf8');
const privateLabel = readFileSync('private-label-audio-products/index.html', 'utf8');
assert.ok(privateLabel.includes('<title>Private Label Gaming Headsets &amp; Audio Products | TALRIVO</title>'),
  'Keep the existing private-label search title and canonical stable');
assert.ok(privateLabel.includes('<link rel="canonical" href="https://talrivo.com/private-label-audio-products/">'));
assert.match(privateLabel, /href="#headset-start">Compare Headset Options/);
assert.match(privateLabel, /id="headset-start" aria-labelledby="headset-start-title"/);
assert.match(privateLabel, /class="seo-page private-label-page"/);
assert.match(privateLabel, /href="entry.css\?v=20261026a"/);
assert.match(privateLabel, /TALRIVO represents our own audio manufacturing business in China/);
assert.match(privateLabel, /Changes to audio behavior, firmware, structure or electronics need a separate feasibility review/);
assert.match(privateLabel, /There is no single MOQ or lead time for every project/);
assert.doesNotMatch(privateLabel, /guaranteed to increase clicks|guaranteed compatibility|MOQ[: ]+\d|lead time[: ]+\d/i);
const privateDescriptions = [...privateLabel.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(privateDescriptions.length, 3);
assert.equal(new Set(privateDescriptions).size, 1, 'Private-label descriptions must agree across search and social');
const privateSchemas = [...privateLabel.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
assert.equal(privateSchemas.find(schema => schema['@type'] === 'CollectionPage').description, privateDescriptions[0]);
const privateFaqSection = privateLabel.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const privateVisibleFaq = [...privateFaqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({question, answer}));
assert.equal(privateVisibleFaq.length, 6);
assert.deepEqual(privateSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => ({question: question.name, answer: question.acceptedAnswer.text})), privateVisibleFaq,
  'Private-label structured FAQ must match every visible question and answer');
for (const [file, product, inquiry, reference] of [
  ['private-label-audio-products/index.html', 'audio-products', 'oem-odm', 'private-label-range'],
  ['rfq-guide/index.html', 'gaming-headsets', 'rfq', 'rfq-template'],
  ['insights/compare-wired-wireless-gaming-headsets/index.html', 'gaming-headsets', 'compare'],
  ['insights/g941-color-options-wireless-gaming-headset/index.html', 'g941', 'oem-odm'],
  ['gaming-headsets/g938-wireless/index.html', 'g938', 'quick-question'],
]) {
  const content = readFileSync(file, 'utf8');
  const routes = [...content.matchAll(/href="([^"]*contact\/\?[^\"]+)"/g)]
    .map(([, href]) => new URL(href.replaceAll('&amp;', '&'), `https://talrivo.com/${file}`));
  assert.ok(routes.some(url => url.searchParams.get('product') === product
    && url.searchParams.get('inquiry') === inquiry && url.hash === '#inquiry-form'
    && (!reference || url.searchParams.get('reference') === reference)), `${file}: preserve buyer intent in the contact route`);
}
const g938 = readFileSync('gaming-headsets/g938-wireless/index.html', 'utf8');
assert.ok(g938.includes('<title>G938 Tri-Mode Gaming Headset | 2.4G/Bluetooth/Wired Sourcing</title>'),
  'Keep the G938 title stable during the description observation period');
const g938Description = 'G938 tri-mode wireless gaming headset: 2.4GHz, Bluetooth and wired. Review 53mm drivers, receiver photos and hands-on setup before private-label sampling.';
for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
  assert.ok(g938.includes(`<meta ${attribute} content="${g938Description}">`));
}
const g938Page = [...g938.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'WebPage');
assert.equal(g938Page.description, g938Description);
for (const evidence of ['53mm drivers', 'id="receiver-accessories"', 'id="hands-on-demo"']) {
  assert.ok(g938.includes(evidence), `G938 snippet must have visible support: ${evidence}`);
}
for (const [file, title] of [
  ['gaming-headsets/index.html', 'Gaming Headset Manufacturer | OEM &amp; Private Label | TALRIVO'],
  ['wireless-gaming-headsets/index.html', 'Private Label Wireless Gaming Headsets | TALRIVO'],
]) {
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes(`<title>${title}</title>`), `${file}: preserve the procurement title`);
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, description]) => description);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1, `${file}: synchronize search and social descriptions`);
  const collection = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'CollectionPage');
  assert.equal(collection.description, descriptions[0]);
  assert.match(descriptions[0], /our own manufacturing business in China/);
  assert.match(html, /TALRIVO represents our own audio manufacturing business in China/);
  assert.ok(html.includes('href="../oem-odm/#customization-scope"'));
  assert.ok(html.includes('href="../videos/gaming-headset-assembly/"'));
}
assert.ok(category.indexOf('id="headset-models"') < category.indexOf('aria-labelledby="dock-title"'),
  'Show model choices before the dock preview');
assert.ok(category.indexOf('id="headset-models"') < category.indexOf('Worked selection example'),
  'Show model choices before the illustrative selection process');
const g926 = readFileSync('gaming-headsets/g926-wireless/index.html', 'utf8');
const g926Title = 'RGB Wireless Gaming Headset for Your Brand | G926';
const g926Description = 'Source the G926 RGB wireless gaming headset for your brand. See 50mm drivers, a detachable mic, receiver photos and logo or packaging options.';
for (const markup of [
  `<title>${g926Title}</title>`,
  `<meta property="og:title" content="${g926Title}">`,
  `<meta name="twitter:title" content="${g926Title}">`,
  '<h1>G926 RGB wireless gaming headset for your brand</h1>',
  'class="seo-page g926-page buyer-product-page"',
  'href="../buyer-product.css?v=20261019a"',
]) assert.ok(g926.includes(markup), `G926 buyer entry is missing ${markup}`);
for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
  assert.ok(g926.includes(`<meta ${attribute} content="${g926Description}">`));
}
const g926Page = [...g926.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'WebPage');
assert.equal(g926Page.name, g926Title);
assert.equal(g926Page.description, g926Description);
const g926Overview = 'https://talrivo.com/assets/catalog/g926-wireless/evidence/display/g926-product-overview-receiver.jpg';
assert.equal(g926Page.image[0], g926Overview);
for (const attribute of ['property="og:image"', 'name="twitter:image"']) {
  assert.ok(g926.includes(`<meta ${attribute} content="${g926Overview}">`));
}
for (const id of ['receiver-accessories', 'documented-specifications']) {
  assert.equal([...g926.matchAll(new RegExp(`id="${id}"`, 'g'))].length, 1);
  assert.ok(g926.includes(`href="#${id}"`));
}
const g926Hero = g926.match(/<section class="seo-hero product-detail">([\s\S]*?)<\/section>/)[1];
assert.match(g926Hero, /g926-product-overview-receiver\.jpg/);
assert.doesNotMatch(g926Hero, /g926-use-scenes\.jpg/);
assert.match(g926Hero, /width="1254" height="850" fetchpriority="high"/);
for (const fact of ['JL7018M', '1000mAh', '50mm', '20ms', 'approximately 50 hours with lighting off']) {
  assert.ok(g926.includes(fact), `Keep the G926 listed specification: ${fact}`);
}
assert.match(g926Hero, /Confirm runtime, receiver setup and both audio and microphone operation on your target devices/);
assert.ok(g926.includes('href="../../contact/?product=g926&amp;inquiry=sample#inquiry-form"'));
const wireless = readFileSync('wireless-gaming-headsets/index.html', 'utf8');
assert.ok(wireless.includes('<h3><a href="../gaming-headsets/g926-wireless/">RGB wireless headset with 50mm drivers</a></h3>'));
assert.ok(readFileSync('sitemap.xml', 'utf8').includes('<loc>https://talrivo.com/gaming-headsets/g926-wireless/</loc>\n    <lastmod>2026-10-24</lastmod>'));
assert.ok(readFileSync('llms.txt', 'utf8').includes('[RGB Wireless Gaming Headset / G926]'));
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

const comparisonFiles = [
  ['product-comparison/index.html', [
    ['g938-wireless', ['2.4GHz / Bluetooth / wired', '53mm', '1000mAh', 'Approximately 50 hours', 'Detachable microphone, aluminum fork arm and each connection mode.']],
    ['g941-tri-mode-anc', ['2.4GHz / Bluetooth / wired', '50mm', '1000mAh', 'Approximately 50 hours', 'Receiver, detachable microphone and selected-version features in each mode.']],
    ['g936-lightweight', ['2.4GHz wireless; confirm supplied cable and receiver functions', '40mm', '800mAh', 'Approximately 40 hours', 'Fabric cushions, detachable microphone and target-device connection.']],
    ['g935-wireless', ['2.4GHz wireless', '40mm', '500mAh', 'Approximately 25 hours', 'Detachable microphone and supplied accessories. Distinguish from the wired G935 version.']],
  ]],
  ['wireless-gaming-headsets/index.html', [
    ['g936-lightweight', ['2.4GHz receiver', '40mm', '800mAh', 'About 40h', '3h', 'Detachable']],
    ['g938-wireless', ['2.4GHz / Bluetooth / wired', '53mm', '1000mAh', 'About 50h', '3-4h', 'Detachable']],
    ['g941-tri-mode-anc', ['2.4GHz / Bluetooth / wired', '50mm', '1000mAh', 'About 50h', '3-4h', 'Detachable']],
    ['g935-wireless', ['2.4GHz receiver', '40mm', '500mAh', 'About 25h', '2h', 'Detachable']],
  ]],
];
for (const [file, expectedRows] of comparisonFiles) {
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes('href="../comparison.css?v=20261024"'));
  const tables = [...html.matchAll(/<table class="sample-check-table buyer-comparison-table" role="table"[\s\S]*?<\/table>/g)];
  assert.equal(tables.length, 1, `${file}: use one static source of comparison facts`);
  const table = tables[0][0];
  const headers = [...table.matchAll(/<th scope="col" role="columnheader">([^<]+)<\/th>/g)].map(([, name]) => name);
  const body = table.match(/<tbody role="rowgroup">([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/<tr role="row">([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, expectedRows.length);
  rows.forEach(([, row], index) => {
    assert.match(row, /<th scope="row" role="rowheader">/);
    assert.ok(row.includes(`href="../gaming-headsets/${expectedRows[index][0]}/"`));
    const cells = [...row.matchAll(/<td role="cell"><span class="comparison-label" aria-hidden="true">([^<]+)<\/span>([^<]+)<\/td>/g)];
    assert.deepEqual(cells.map(([, label]) => label), headers.slice(1), `${file}: mobile labels must match the column headers`);
    assert.deepEqual(cells.map(([, , value]) => value), expectedRows[index][1], `${file}: preserve listed product facts`);
  });
}
const comparison = readFileSync('product-comparison/index.html', 'utf8');
assert.ok(comparison.includes('<title>Wireless Gaming Headset Comparison for OEM Buyers | TALRIVO</title>'));
assert.doesNotMatch(comparison, /Best first (?:review|stop)/);
assert.match(comparison, /Fabric ear cushions \/ G936/);
const comparisonFaq = [...comparison.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'FAQPage');
const faqContent = comparison.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const visibleFaq = [...faqContent.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({question, answer}));
assert.deepEqual(comparisonFaq.mainEntity.map(q => ({question: q.name, answer: q.acceptedAnswer.text})), visibleFaq);
const comparisonCss = readFileSync('comparison.css', 'utf8');
assert.match(comparisonCss, /@media \(max-width: 820px\)/);
assert.match(comparisonCss, /\.buyer-comparison-table\s*\{[^}]*min-width: 0;/);
assert.match(comparisonCss, /\.buyer-comparison-table thead\s*\{[^}]*clip-path: inset\(50%\);/);
assert.match(comparisonCss, /min-height: 48px;/);
console.log('Comparison checks passed: identical listed facts, matching mobile labels, table semantics, larger model links, stable title and synchronized FAQ.');
