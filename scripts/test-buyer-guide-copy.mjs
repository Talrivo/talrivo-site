import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'insights/';
const pages = [
  ['gaming-headset-usb-audio-or-lighting', 'Gaming Headset USB: Audio or Lighting Only? | TALRIVO'],
  ['2-4g-vs-bluetooth-gaming-headsets-importers', '2.4G vs Bluetooth Gaming Headsets for Importers'],
  ['evaluate-gaming-headset-sample-before-bulk-order', 'Gaming Headset Sample Checklist: Free Download | TALRIVO'],
  ['choose-gaming-headset-manufacturer-china', 'How to Choose a Gaming Headset Manufacturer in China | TALRIVO'],
];
const html = pages.map(([slug, title]) => {
  const content = readFileSync(`${base}${slug}/index.html`, 'utf8');
  assert.ok(content.includes(`<title>${title}</title>`), `${slug}: keep search title stable`);
  assert.ok(content.includes(`<link rel="canonical" href="https://talrivo.com/insights/${slug}/">`));
  const schemas = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  assert.equal(schemas.find(schema => schema['@type'] === 'Article').dateModified,
    slug === 'choose-gaming-headset-manufacturer-china' ? '2026-10-25'
      : slug === '2-4g-vs-bluetooth-gaming-headsets-importers' ? '2026-11-04'
      : slug === 'evaluate-gaming-headset-sample-before-bulk-order' ? '2026-11-05' : '2026-10-22');
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
const connectionSchemas = [...connection.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const connectionDescription = connection.match(/<meta name="description" content="([^"]+)"/)[1];
assert.equal(connectionSchemas.find(schema => schema['@type'] === 'Article').description, connectionDescription);
for (const type of ['property="og:description"', 'name="twitter:description"']) {
  assert.ok(connection.includes(`<meta ${type} content="${connectionDescription}">`));
}
const connectionFaq = connection.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
assert.deepEqual(connectionSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(question => [question.name, question.acceptedAnswer.text]),
[...connectionFaq.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => [question, answer]));
for (const fact of ['Bluetooth also uses the 2.4GHz band',
  'https://www.bluetooth.com/learn-about-bluetooth/tech-overview/',
  'https://support.microsoft.com/en-us/windows/hardware/bluetooth/configuring-bluetooth-le-audio-quality-settings-on-windows-11',
  'https://blog.playstation.com/2020/11/09/ps5-the-ultimate-faq/',
  'Completed Bluetooth pairing is not clearly visible',
  'href="../../videos/g938-phone-setup-controls/"',
  'href="../../assets/downloads/wireless-gaming-headset-sample-review.txt" download',
  'not a completed test report', 'href="#sample-notes"']) {
  assert.ok(connection.includes(fact), `Connection guide needs ${fact}`);
}
const connectionTable = connection.match(/<section class="seo-section" id="connection-comparison">([\s\S]*?)<\/section>/)[1];
assert.equal((connectionTable.match(/<tr>/g) || []).length, 7);
for (const question of ['Which has less delay?', 'What happens during voice chat?', 'What about PS5?', 'What about a phone?']) {
  assert.ok(connectionTable.includes(question));
}
assert.equal((connection.match(/<section\b/g) || []).length, 8, 'Keep the guide focused, without repeated definition and supplier sections');
assert.ok(readFileSync('sitemap.xml', 'utf8').includes('<loc>https://talrivo.com/insights/2-4g-vs-bluetooth-gaming-headsets-importers/</loc>\n    <lastmod>2026-11-04</lastmod>'));
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
assert.equal(receiverArticle.dateModified, '2026-11-05');
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
assert.ok(readFileSync('sitemap.xml', 'utf8').includes(`<loc>${receiverUrl}</loc>\n    <lastmod>2026-11-05</lastmod>`));
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

const hubUrl = 'https://talrivo.com/insights/';
const hubTitle = 'Gaming Headset Sourcing Guides for Importers | TALRIVO';
assert.ok(index.includes(`<title>${hubTitle}</title>`));
assert.ok(index.includes(`<link rel="canonical" href="${hubUrl}">`));
for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
  assert.ok(index.includes(`<meta ${attribute} content="${hubTitle}">`));
}
const hubDescriptions = [...index.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(hubDescriptions.length, 3);
assert.equal(new Set(hubDescriptions).size, 1);
const hubSchemas = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const hubCollection = hubSchemas.find(schema => schema['@type'] === 'CollectionPage');
assert.equal(hubCollection.dateModified, '2026-11-03');
assert.equal(hubCollection.description, hubDescriptions[0]);
const topicIds = ['connection-guides', 'sound-comfort-guides', 'quote-guides', 'sample-guides', 'model-comparisons', 'earbud-guides'];
const topicSections = [...index.matchAll(/<section class="seo-section guide-topic" id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
assert.deepEqual(topicSections.map(([, id]) => id), topicIds);
const topicNav = index.match(/<nav class="guide-topic-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
assert.ok(index.indexOf('class="guide-topic-nav"') < index.indexOf('id="buyer-worksheets"'));
assert.deepEqual([...topicNav.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id), topicIds);
const topicCards = topicSections.flatMap(([, , section]) => [...section.matchAll(/<article><h3><a class="text-action" href="([^"]+)">([^<]+)<\/a><\/h3>/g)]
  .map(([, href, name]) => ({ name, url: new URL(href, hubUrl).href })));
assert.equal(topicCards.length, 22);
assert.equal(new Set(topicCards.map(card => new URL(card.url).pathname)).size, 22, 'List each guide once in the topic groups');
const hubItems = hubCollection.mainEntity.itemListElement;
assert.equal(hubItems.length, 30);
assert.deepEqual(hubItems.map(item => item.position), Array.from({ length: 30 }, (_, i) => i + 1));
assert.deepEqual(hubItems.slice(0, 22).map(({ name, url }) => ({ name, url })), topicCards);
assert.equal(new Set(hubItems.map(item => item.url)).size, hubItems.length);
for (const target of [
  'wireless-gaming-headset-microphone-noise-test-checklist/#anc-enc',
  'choose-2-4g-wireless-gaming-headset/#receiver-checks',
  'gaming-headset-ear-cushion-material-sample-checklist/#material-comparison',
  'private-label-gaming-headset-rfq-checklist/#quote-comparison',
]) assert.ok(index.includes(`href="${target}"`));
assert.ok(index.includes('class="button primary" href="#connection-guides"'));
assert.ok(index.includes('href="../contact/?product=audio-products&amp;inquiry=rfq#inquiry-form"'));
assert.ok(demandSitemap.includes(`<loc>${hubUrl}</loc>\n    <lastmod>2026-11-03</lastmod>`));
assert.ok(demandLlms.includes(`[Insights](${hubUrl}):`));
assert.doesNotMatch(index, /For GEO|guaranteed to increase clicks|zero latency/i);
const videoSection = index.match(/<section[^>]*id="product-videos"[\s\S]*?<\/section>/)[0];
assert.ok(index.includes('href="#product-videos">Watch Headset Demonstrations</a>'));
assert.equal((videoSection.match(/<article>/g) || []).length, 8);
assert.ok(videoSection.includes('href="../videos/g938-phone-setup-controls/"'));
assert.ok(videoSection.includes('completed pairing is not clearly visible'));
assert.equal(hubItems[24].url, 'https://talrivo.com/videos/g938-phone-setup-controls/');
console.log('Insights hub checks passed: six topic routes, 22 distinct guides, eight video resources, aligned collection data and a direct hands-on demo entry.');

const channelCases = [
  ['audio-products-for-distributors', 'Wholesale Gaming Headsets for Distributors | TALRIVO', 'assortment-checks'],
  ['audio-products-for-ecommerce-sellers', 'Gaming Headset Listing Images & Specs | TALRIVO', 'listing-checks'],
];
const channelHtml = new Map();
for (const [slug, title, anchor] of channelCases) {
  const html = readFileSync(`${slug}/index.html`, 'utf8');
  channelHtml.set(slug, html);
  const url = `https://talrivo.com/${slug}/`;
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
  const page = schemas.find(schema => schema['@type'] === 'WebPage');
  assert.equal(page.name, title);
  assert.equal(page.url, url);
  assert.equal(page.description, descriptions[0]);
  assert.equal(page.dateModified, '2026-11-02');
  const faqSection = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visible = [...faqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.equal(visible.length, 4);
  assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
    .map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), visible);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes('<meta name="robots" content="index, follow">'));
  assert.ok(html.includes(`class="button primary" href="#${anchor}"`));
  assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  assert.ok(html.indexOf(`href="#${anchor}"`) < html.indexOf('<img src='));
  assert.ok(html.includes('href="../contact/?product=custom-audio&amp;inquiry=rfq#inquiry-form"'));
  assert.ok(html.includes('href="../audio-products-for-importers/"'));
  assert.ok(demandSitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-11-02</lastmod>`));
  assert.ok(demandLlms.includes(`](${url}):`));
}
const distributor = channelHtml.get('audio-products-for-distributors');
assert.ok(distributor.includes('id="reorder-checks"'));
assert.match(distributor, /does not promise stock, fixed MOQ, repeat-order pricing or a production lead time/);
assert.ok(distributor.includes('href="../gaming-headsets/g935-wireless/"'));
assert.ok(distributor.includes('href="../gaming-headsets/g938-wireless/"'));
const ecommerce = channelHtml.get('audio-products-for-ecommerce-sellers');
assert.match(ecommerce, /not marketplace approval or a platform-policy assessment/);
assert.match(ecommerce, /Keep creative artwork separate from evidence of performance/);
assert.ok(ecommerce.includes('href="../tws-earbuds/tws057/#tws057-case-review"'));
assert.ok(ecommerce.includes('href="../insights/gaming-headset-packaging-accessories-checklist/#packing-checklist"'));
assert.ok(readFileSync('audio-products-for-importers/index.html', 'utf8')
  .includes('<title>Gaming Headsets for Importers &amp; Audio Buyers | TALRIVO</title>'));
console.log('Channel entry checks passed: distinct distributor/listing tasks, aligned metadata/FAQs, direct answer anchors and preserved quotation/importer routes.');

const regionCases = [
  ['audio-products-for-europe-buyers', 'Gaming Headsets for Europe: Documents & Packaging | TALRIVO', 'europe-order-checks'],
  ['audio-products-for-latin-america-buyers', 'Wholesale Headsets for Latin America | TALRIVO', 'country-packaging-checks'],
  ['audio-products-for-southeast-asia-buyers', 'Gaming & Mobile Audio for Southeast Asia | TALRIVO', 'device-sample-checks'],
];
const regionPages = new Map();
const regionQuestions = [];
for (const [slug, title, anchor] of regionCases) {
  const html = readFileSync(`${slug}/index.html`, 'utf8');
  regionPages.set(slug, html);
  const url = `https://talrivo.com/${slug}/`;
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
  assert.deepEqual(schemas.map(schema => schema['@type']), ['WebPage', 'FAQPage', 'BreadcrumbList']);
  const page = schemas.find(schema => schema['@type'] === 'WebPage');
  assert.equal(page.name, title);
  assert.equal(page.description, descriptions[0]);
  assert.equal(page.url, url);
  assert.equal(page.dateModified, '2026-11-02');
  assert.equal(schemas.find(schema => schema['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, url);
  const faqSection = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visible = [...faqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.equal(visible.length, 4);
  regionQuestions.push(...visible.map(item => item.question));
  assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
    .map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), visible);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes('<meta name="robots" content="index, follow">'));
  assert.ok(html.includes(`class="button primary" href="#${anchor}"`));
  assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  assert.ok(html.indexOf(`href="#${anchor}"`) < html.indexOf('<img src='));
  const checks = html.match(new RegExp(`<section[^>]*id="${anchor}"[\\s\\S]*?<\\/section>`))[0];
  assert.equal((checks.match(/<strong>/g) || []).length, 4);
  assert.ok(html.includes('<main class="seo-page region-buyer-page">'));
  assert.doesNotMatch(html, /class="text-action"/, 'Use readable resource links rather than the product-card action style');
  assert.ok(html.includes('href="../contact/?product=custom-audio&amp;inquiry=rfq#inquiry-form"'));
  assert.ok(html.includes('href="../audio-products-for-importers/"'));
  assert.ok(demandSitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-11-02</lastmod>`));
  assert.ok(demandLlms.includes(`](${url}):`));
  assert.doesNotMatch(html, /Best fit for|What TALRIVO can support|guaranteed to increase clicks|free samples?|Europe certified/i);
}
assert.equal(new Set(regionQuestions).size, 12, 'Region FAQs must answer distinct buyer tasks, not just swap place names');
const europe = regionPages.get('audio-products-for-europe-buyers');
assert.match(europe, /G936 is not listed in those two documents/);
assert.match(europe, /EU guidance is not a substitute for checking a non-EU destination/);
assert.ok(europe.includes('href="../insights/gaming-headset-import-documents-checklist/#certificate-match"'));
assert.ok(europe.includes('href="https://europa.eu/youreurope/business/product-rules-compliance/general-product-compliance/ce-marking/index_en.htm"'));
const latinAmerica = regionPages.get('audio-products-for-latin-america-buyers');
assert.match(latinAmerica, /Spanish or Portuguese artwork/);
assert.match(latinAmerica, /Brazil, Mexico, Argentina and Uruguay are separate destinations/);
assert.match(latinAmerica, /does not confirm a TALRIVO approval/);
assert.doesNotMatch(latinAmerica, /auricular(?:es)? TWS Bluetooth|target product role, target product role/);
assert.ok(latinAmerica.includes('href="../insights/private-label-gaming-headset-rfq-checklist/#quote-comparison"'));
assert.ok(latinAmerica.includes('href="https://www.gov.br/pt-br/servicos/homologar-produtos-de-telecomunicacoes-anatel"'));
const southeastAsia = regionPages.get('audio-products-for-southeast-asia-buyers');
assert.match(southeastAsia, /game audio and voice chat work together/);
assert.match(southeastAsia, /does not establish regional approval, local stock or country-wide compatibility/);
assert.doesNotMatch(southeastAsia, /Japan|Korea/);
assert.ok(southeastAsia.includes('href="../insights/2-4g-vs-bluetooth-gaming-headsets-importers/#device-compatibility"'));
assert.ok(southeastAsia.includes('href="../insights/choose-2-4g-wireless-gaming-headset/#receiver-checks"'));
console.log('Region entry checks passed: three distinct buyer tasks, 12 matching FAQs, direct answer anchors, stable URLs and country-specific evidence limits.');

const processSlug = 'gaming-headset-sample-process-checklist';
const processGuide = readFileSync(`${base}${processSlug}/index.html`, 'utf8');
const processTitle = 'Gaming Headset Sample Process: From Inquiry to Approval';
const processUrl = `https://talrivo.com/insights/${processSlug}/`;
assert.ok(processGuide.includes(`<title>${processTitle}</title>`));
for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
  assert.ok(processGuide.includes(`<meta ${attribute} content="${processTitle}">`));
}
const processDescriptions = [...processGuide.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(processDescriptions.length, 3);
assert.equal(new Set(processDescriptions).size, 1);
const processSchemas = [...processGuide.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const processArticle = processSchemas.find(schema => schema['@type'] === 'Article');
assert.equal(processArticle.headline, processTitle);
assert.equal(processArticle.description, processDescriptions[0]);
assert.equal(processArticle.mainEntityOfPage, processUrl);
assert.equal(processArticle.url, processUrl);
assert.equal(processArticle.datePublished, '2026-08-13');
assert.equal(processArticle.dateModified, '2026-11-03');
assert.ok(processGuide.includes(`<link rel="canonical" href="${processUrl}">`));
assert.ok(processGuide.includes('<meta name="robots" content="index, follow">'));
assert.ok(processGuide.includes('<main class="seo-page sample-process-page">'));
assert.ok(processGuide.includes('Updated November 3, 2026'));
assert.ok(processGuide.indexOf('href="#sample-stages"') < processGuide.indexOf('<img src='));
assert.equal((processGuide.match(/id="sample-stages"/g) || []).length, 1);
const processStages = processGuide.match(/<section[^>]*id="sample-stages"[\s\S]*?<\/section>/)[0];
assert.equal((processStages.match(/<tr><th scope="row">/g) || []).length, 6);
for (const target of [
  '../evaluate-gaming-headset-sample-before-bulk-order/#review-worksheet',
  '../gaming-headset-packaging-accessories-checklist/#packing-checklist',
]) assert.ok(processStages.includes(`href="${target}"`));
const processFaqSection = processGuide.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const processVisibleFaq = [...processFaqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(processVisibleFaq.length, 6);
assert.deepEqual(processSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), processVisibleFaq);
for (const boundary of [
  'This page does not offer free samples or promise an order credit',
  'There is no fixed sample or shipping lead time published here',
  'Approval of one sample does not demonstrate that every bulk unit has been tested or matches it',
  'The supplied photos are visible process references, not a model-specific test record',
]) assert.ok(processGuide.includes(boundary));
assert.ok(processGuide.includes('href="../../contact/?product=gaming-headsets&amp;inquiry=sample#inquiry-form"'));
assert.ok(demandSitemap.includes(`<loc>${processUrl}</loc>\n    <lastmod>2026-11-03</lastmod>`));
assert.ok(demandLlms.includes(`](${processUrl}): Six suggested review steps`));
assert.ok(readFileSync('sample-request/index.html', 'utf8')
  .includes(`href="../insights/${processSlug}/#sample-stages"`));
console.log('Sample process checks passed: six distinct approval steps, matching metadata and FAQs, stable URL, cost/timing limits and a direct sample-page discovery link.');

const supplierSlug = 'oem-gaming-headset-supplier-checklist';
const supplierGuide = readFileSync(`${base}${supplierSlug}/index.html`, 'utf8');
const supplierTitle = 'OEM Gaming Headset Supplier Checklist | TALRIVO';
const supplierUrl = `https://talrivo.com/insights/${supplierSlug}/`;
assert.ok(supplierGuide.includes(`<title>${supplierTitle}</title>`), 'Keep the existing supplier search title');
assert.ok(supplierGuide.includes(`<link rel="canonical" href="${supplierUrl}">`));
for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
  assert.ok(supplierGuide.includes(`<meta ${attribute} content="${supplierTitle}">`));
}
const supplierDescriptions = [...supplierGuide.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(supplierDescriptions.length, 3);
assert.equal(new Set(supplierDescriptions).size, 1);
const supplierSchemas = [...supplierGuide.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
assert.deepEqual(supplierSchemas.map(schema => schema['@type']), ['Article', 'FAQPage', 'BreadcrumbList']);
const supplierArticle = supplierSchemas.find(schema => schema['@type'] === 'Article');
assert.equal(supplierArticle.headline, 'OEM Gaming Headset Supplier Checklist');
assert.equal(supplierArticle.description, supplierDescriptions[0]);
assert.equal(supplierArticle.mainEntityOfPage, supplierUrl);
assert.equal(supplierArticle.datePublished, '2026-07-31');
assert.equal(supplierArticle.dateModified, '2026-11-03');
assert.ok(supplierGuide.includes('Updated November 3, 2026'));
assert.ok(supplierGuide.indexOf('href="#supplier-evidence"') < supplierGuide.indexOf('<img src='));
assert.equal((supplierGuide.match(/id="supplier-evidence"/g) || []).length, 1);
const supplierEvidence = supplierGuide.match(/<section[^>]*id="supplier-evidence"[\s\S]*?<\/section>/)[0];
assert.equal((supplierEvidence.match(/<tr role="row"><th scope="row"/g) || []).length, 8);
assert.equal((supplierEvidence.match(/class="supplier-cell-label"/g) || []).length, 16);
for (const status of ['Not confirmed', 'Needs revision', 'Confirmed for this version']) {
  assert.ok(supplierEvidence.includes(status));
}
const supplierFaqSection = supplierGuide.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const supplierVisibleFaq = [...supplierFaqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(supplierVisibleFaq.length, 5);
assert.deepEqual(supplierSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), supplierVisibleFaq);
for (const target of [
  '../../videos/gaming-headset-assembly/',
  '../../videos/g938-phone-setup-controls/',
  '../gaming-headset-import-documents-checklist/#certificate-match',
  '../evaluate-gaming-headset-sample-before-bulk-order/#review-worksheet',
  '../private-label-gaming-headset-rfq-checklist/#quote-comparison',
  '../gaming-headset-sample-process-checklist/#sample-stages',
]) assert.ok(supplierGuide.includes(`href="${target}"`));
for (const boundary of [
  'not a completed TALRIVO assessment',
  'not a TALRIVO price or standard packing list',
  'G936 is not listed in those two documents',
  'Completed Bluetooth pairing is not clearly visible',
  'not a G935 performance test',
]) assert.ok(supplierGuide.includes(boundary));
for (const type of ['quick-question', 'rfq']) {
  assert.ok(supplierGuide.includes(`href="../../contact/?product=gaming-headsets&amp;inquiry=${type}&amp;reference=oem-supplier-checklist#inquiry-form"`));
}
assert.ok(demandSitemap.includes(`<loc>${supplierUrl}</loc>\n    <lastmod>2026-11-03</lastmod>`));
assert.ok(demandLlms.includes(`](${supplierUrl}): Eight supplier evidence checks`));
assert.doesNotMatch(supplierGuide, /machine summaries|summaries grounded|lighter wireless|guaranteed to increase clicks|free samples?|MOQ[: ]+\d/i);
console.log('Supplier checklist checks passed: eight evidence decisions, stable title and URL, five matching FAQs, reference-aware inquiry links and explicit evidence limits.');

const practicalCases = [
  ['gaming-headset-microphone-performance', 'Gaming Headset Mic Test Checklist for Importers | TALRIVO', 6, 5, 'quick-mic-test'],
  ['gaming-headset-packaging-accessories-checklist', 'Gaming Headset Packaging: Receiver and Mic | TALRIVO', 6, 6, 'packing-checklist'],
  ['gaming-headset-product-evidence-checklist', 'Gaming Headset Product Evidence Checklist | TALRIVO', 5, 8, 'evidence-checks'],
];
for (const [slug, title, questionCount, imageCount, anchor] of practicalCases) {
  const page = readFileSync(`${base}${slug}/index.html`, 'utf8');
  const url = `https://talrivo.com/insights/${slug}/`;
  assert.ok(page.includes(`<title>${title}</title>`), `${slug}: preserve the search title`);
  assert.ok(page.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(page.includes('<meta name="robots" content="index, follow">'));
  assert.ok(page.includes('<main class="seo-page practical-guide">'));
  assert.ok(page.includes('href="../practical-guide.css?v=20261105a"'));
  assert.ok(page.includes('Updated November 5, 2026'));
  const data = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const article = data.find(item => item['@type'] === 'Article');
  assert.equal(article.dateModified, '2026-11-05');
  assert.equal(article.mainEntityOfPage, url);
  const descriptions = [...page.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => text);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set([...descriptions, article.description]).size, 1);
  const faqSection = page.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visible = [...faqSection.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => [question, answer]);
  assert.equal(visible.length, questionCount);
  assert.deepEqual(data.find(item => item['@type'] === 'FAQPage').mainEntity
    .map(item => [item.name, item.acceptedAnswer.text]), visible);
  const main = page.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal((main.match(/<img\b/g) || []).length, imageCount, `${slug}: keep all supplied images`);
  assert.equal((page.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  assert.ok(page.includes(`href="#${anchor}"`));
  assert.ok(demandSitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-11-05</lastmod>`));
  assert.doesNotMatch(main, /aligned with real buyer intent|product page update, LinkedIn post|Content reuse|5-minute|mobile-adjacent/);
  assert.doesNotMatch(page, /guaranteed compatibility|zero latency|guaranteed to increase clicks/i);
}
console.log('Practical article checks passed: three stable search entries, 17 matching FAQ answers, all supplied images, direct answer anchors and synchronized revision dates.');
