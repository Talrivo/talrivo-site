import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const catalogue = context.window.talrivoCatalog;
const review = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const sizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'));
const products = catalogue.filter(p => (['wireless', 'wired'].includes(p.category) && /^G\d+/.test(p.model))
  || ['bluetooth', 'tws'].includes(p.category));
assert.equal(products.length, 56);
assert.equal(new Set(products.map(p => p.page)).size, 56);
assert.equal(review.models.length, 43);
const sitemap = readFileSync('sitemap.xml', 'utf8');
const llms = readFileSync('llms.txt', 'utf8');
const code = readFileSync('contact-form.js', 'utf8');
const routes = vm.runInNewContext(`(${code.match(/const productSelections = (\{[\s\S]*?\n  \});/)[1]})`);
const contact = readFileSync('contact/index.html', 'utf8');
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
for (const product of products) {
  assert.ok(product.page, `${product.folder}: independent page required`);
  const html = readFileSync(`${product.page}index.html`, 'utf8');
  assert.ok(html.includes(`href="https://talrivo.com/${product.page}"`));
}
const titles = new Set();
let pending = 0;
for (const model of review.models) {
  const html = readFileSync(`${model.page}index.html`, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  assert.ok(!titles.has(title), `${model.folder}: duplicate title`);
  titles.add(title);
  assert.ok(html.includes(`data-model="${model.folder}"`));
  assert.equal(routes[model.inquiryKey], model.inquiryLabel);
  assert.ok(contact.includes(`<option>${esc(model.inquiryLabel)}</option>`));
  assert.ok(html.includes(`product=${model.inquiryKey}&amp;inquiry=quick-question`));
  assert.match(html, /Pictured parts are not automatically included/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  assert.equal(schemas.find(s => s['@type'] === 'WebPage').url, `https://talrivo.com/${model.page}`);
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  for (const question of faq.mainEntity) {
    assert.ok(html.includes(`<h3>${esc(question.name)}</h3><p>${esc(question.acceptedAnswer.text)}</p>`));
  }
  for (const [key, value] of model.specifications) {
    assert.ok(html.includes(`<strong>${esc(key)}</strong><span>${esc(value)}</span>`));
  }
  for (const asset of model.assets) assert.ok(existsSync(asset));
  assert.equal(sizes[model.folder].assets.length, model.assets.length);
  assert.equal(sizes[model.folder].variants.length, 2);
  for (const variant of sizes[model.folder].variants) {
    assert.ok(variant.width <= sizes[model.folder].assets[0].width, 'Do not enlarge low-resolution images');
    assert.ok(html.includes(`../../${variant.path} ${variant.width}w`));
    assert.ok(statSync(variant.path).size < 160000);
  }
  const noindex = /content="noindex, follow/.test(html);
  assert.equal(noindex, !model.indexable);
  assert.equal(sitemap.includes(`<loc>https://talrivo.com/${model.page}</loc>`), model.indexable);
  if (model.indexable) assert.ok(llms.includes(`https://talrivo.com/${model.page}`));
  else {
    pending += 1;
    assert.equal(catalogue.find(p => p.folder === model.folder).pageStatus, 'specification-pending');
    assert.match(html, /Specification confirmation is still needed/);
  }
  if (model.category === 'tws') {
    assert.match(html, /single charge or charging-case-assisted use/);
    if (/\bANC\b/.test(model.name)) assert.match(html, /whether ANC is on or off/);
  }
  if (model.conflicts.length) assert.doesNotMatch(html, /<strong>Driver<\/strong>/);
}
assert.equal(pending, 6);

const reviewedTws = [
  ['TWS042S', '6mm ANC Earbuds for Custom Branding | TWS042S', 'tws042s-selection',
    { 'Driver diameter': '6mm', 'Earbud battery': '30mAh', 'Charging case battery': '600mAh' }],
  ['TWS057', '13mm ANC Earbuds with 300mAh Case | TWS057', 'tws057-case-review',
    { 'Driver diameter': '13mm', 'Earbud battery': '35mAh', 'Charging case battery': '300mAh' }],
  ['TWS029', '12mm True Wireless Earbuds for Private Label | TWS029', 'tws029-fit-review',
    { 'Driver diameter': '12mm', 'Earbud battery': '50mAh', 'Charging case battery': '300mAh' }],
];
const twsHtmlByModel = new Map();
const reviewedFaqs = new Set();
for (const [name, title, anchor, facts] of reviewedTws) {
  const model = review.models.find(item => item.model === name);
  const html = readFileSync(`${model.page}index.html`, 'utf8');
  twsHtmlByModel.set(name, html);
  assert.equal(model.title, title);
  assert.ok(html.includes(`<title>${esc(title)}</title>`));
  assert.ok(html.includes(`<h1>${esc(model.heading)}</h1>`));
  for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
    assert.ok(html.includes(`<meta ${attribute} content="${esc(title)}">`));
  }
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => text);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1);
  assert.equal(descriptions[0], esc(model.description));
  assert.doesNotMatch(`${title} ${model.description}`, /\d+\s*(?:hours?|[hH]\b)|free samples?|guaranteed/i);
  assert.equal(model.dateModified, '2026-11-02');
  const webPage = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'WebPage');
  assert.equal(webPage.description, model.description);
  assert.equal(webPage.dateModified, model.dateModified);
  assert.ok(sitemap.includes(`<loc>https://talrivo.com/${model.page}</loc>\n    <lastmod>2026-11-02</lastmod>`));
  assert.ok(html.includes(`href="#${anchor}"`));
  assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  const specs = Object.fromEntries(model.specifications);
  for (const [key, value] of Object.entries(facts)) assert.equal(specs[key], value);
  assert.equal(model.faqs.length, 4, `${name}: maintain a reviewed FAQ rather than the generic fallback`);
  assert.ok(model.faqs.every(item => item.question !== `Which ${name} version does this page cover?`));
  const faqContent = JSON.stringify(model.faqs).replaceAll(name, 'MODEL');
  assert.ok(!reviewedFaqs.has(faqContent));
  reviewedFaqs.add(faqContent);
  assert.equal(model.assetDescriptions.length, model.assets.length);
  for (const detail of model.assetDescriptions) assert.ok(html.includes(esc(detail.caption)));
  assert.equal(model.relatedLinks.length, 2);
  for (const link of model.relatedLinks) {
    assert.ok(html.includes(`href="${esc(link.href)}">${esc(link.label)}</a>`));
    assert.equal(new URL(link.href, `https://talrivo.com/${model.page}`).origin, 'https://talrivo.com');
  }
}
assert.match(twsHtmlByModel.get('TWS042S'), /placeholder brand artwork/);
assert.match(twsHtmlByModel.get('TWS057'), /does not establish a user-replaceable battery/);
assert.match(twsHtmlByModel.get('TWS057'), /Do not open or service a case based on this illustration/);
assert.match(twsHtmlByModel.get('TWS029'), /this reviewed record does not identify TWS029 as an ANC model/);
assert.match(twsHtmlByModel.get('TWS029'), /do not establish wearing retention/);
const twsCategory = readFileSync('tws-earbuds/index.html', 'utf8');
assert.ok(twsCategory.includes('<title>TWS Earbuds: In-Ear and Open-Ear Models | TALRIVO</title>'));
const listedOptions = twsCategory.match(/<div class="seo-grid" id="listed-configurations">([\s\S]*?)<\/div>/)[1];
const optionLinks = [...listedOptions.matchAll(/<h3><a class="text-action" href="([^"]+)">([^<]+)<\/a><\/h3>/g)]
  .map(([, path, name]) => ({ name, url: `https://talrivo.com/tws-earbuds/${path}` }));
assert.equal(optionLinks.length, 3);
const collection = [...twsCategory.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'CollectionPage');
assert.equal(collection.dateModified, '2026-11-02');
assert.deepEqual(collection.mainEntity.itemListElement.slice(2, 5).map(({ name, url }) => ({ name, url })), optionLinks);
console.log('Reviewed TWS checks passed: three distinct product briefs and FAQs, unchanged listed facts, illustration/runtime limits and category discovery links.');

for (const [folder, page] of [
  ['g936-wireless', 'gaming-headsets/g936-lightweight/'],
  ['g947-new', 'gaming-headsets/g947-foldable/'],
  ['tws-tws044f', 'tws-earbuds/tws044f/'],
  ['tws-earclip-09s', 'tws-earbuds/earclip09s/'],
]) assert.equal(catalogue.find(p => p.folder === folder).page, page, 'Preserve indexed canonical URLs');
const directory = readFileSync('gaming-headset-models/index.html', 'utf8');
const directorySchemas = [...directory.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const directoryCollection = directorySchemas.find(schema => schema['@type'] === 'CollectionPage');
assert.equal(directoryCollection.dateModified, '2026-11-03');
const directoryItems = directoryCollection.mainEntity.itemListElement;
const directoryRows = [];
for (const [id, count] of [['wireless-models', 13], ['wired-models', 7]]) {
  const section = directory.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?<\\/section>`))[0];
  const rows = [...section.matchAll(/<tr><td><a href="([^"]+)">([^<]+)<\/a>/g)]
    .map(([, href, name]) => ({ name, url: new URL(href, directoryCollection.url).href }));
  assert.equal(rows.length, count);
  assert.ok(directory.includes(`href="#${id}"`));
  assert.ok(directory.indexOf(`href="#${id}"`) < directory.indexOf('<img src='));
  directoryRows.push(...rows);
}
assert.deepEqual(directoryItems.map(({ name, url }) => ({ name, url })), directoryRows);
assert.deepEqual(directoryItems.map(item => item.position), Array.from({ length: 20 }, (_, i) => i + 1));
const pendingSection = directory.match(/<section[^>]*id="pending-models"[\s\S]*?<\/section>/)[0];
const pendingLinks = [...pendingSection.matchAll(/href="\.\.\/([^\"]+)"/g)].map(([, path]) => path);
assert.equal(pendingLinks.length, 6);
for (const model of review.models.filter(model => !model.indexable)) {
  assert.ok(pendingLinks.includes(model.page));
  assert.ok(!directoryItems.some(item => item.url === `https://talrivo.com/${model.page}`));
}
const samplePage = readFileSync('sample-request/index.html', 'utf8');
for (const [slug, html, title, type] of [
  ['gaming-headset-models', directory, 'Gaming Headset Model Codes for OEM Sample Review | TALRIVO', 'CollectionPage'],
  ['sample-request', samplePage, 'Audio Samples: Gaming Headsets, Bluetooth & TWS | TALRIVO', 'WebPage'],
]) {
  const decode = value => value.replaceAll('&amp;', '&');
  assert.equal(decode(html.match(/<title>([^<]+)<\/title>/)[1]), title, 'Preserve the existing search titles');
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => text);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const main = schemas.find(schema => schema['@type'] === type);
  assert.equal(main.name, title);
  assert.equal(main.description, descriptions[0]);
  const expectedRevision = slug === 'sample-request' ? '2026-11-06' : '2026-11-03';
  assert.equal(main.dateModified, expectedRevision);
  assert.ok(html.includes(`<link rel="canonical" href="https://talrivo.com/${slug}/">`));
  assert.ok(sitemap.includes(`<loc>https://talrivo.com/${slug}/</loc>\n    <lastmod>${expectedRevision}</lastmod>`));
  const faq = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visible = [...faq.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
    .map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), visible);
}
const shortlist = samplePage.match(/<section[^>]*id="headset-sample-shortlist"[\s\S]*?<\/section>/)[0];
assert.equal((shortlist.match(/<article>/g) || []).length, 7);
for (const configuration of ['g946-headset-only', 'g946-wireless-charging-dock']) {
  assert.ok(shortlist.includes(`href="../contact/?product=g946&amp;inquiry=sample&amp;reference=${configuration}#inquiry-form"`));
}
assert.ok(shortlist.includes('href="../gaming-headsets/g946-rgb/#sample-configuration"'));
assert.ok(shortlist.includes('Both configurations use the same G946 headset.'));
for (const code of ['g938', 'g940', 'g926', 'g936', 'g935', 'g941']) {
  assert.ok(shortlist.includes(`href="../contact/?product=${code}&amp;inquiry=sample#inquiry-form"`));
}
assert.doesNotMatch(samplePage, /Turn a general request into a model-specific inquiry|Compare the model role before requesting samples/);
assert.ok(samplePage.includes('35mm + 16mm drivers, 2.4GHz USB receiver and 500mAh battery'));
console.log('Model directory and sample entry checks passed: 13 wireless, 7 wired, 6 separated pending references, aligned schema, seven model choices and configuration-specific G946 sample routes.');
for (const p of products.filter(p => ['wired', 'wireless'].includes(p.category))) {
  assert.ok(directory.includes(`href="../${p.page}"`));
}
for (const [file, category] of [
  ['wireless-gaming-headsets/index.html', 'wireless'],
  ['wired-gaming-headsets/index.html', 'wired'],
  ['bluetooth-headphones/index.html', 'bluetooth'],
  ['tws-earbuds/index.html', 'tws'],
]) {
  const html = readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
    .map(([, href]) => new URL(href.replaceAll('&amp;', '&'), `https://talrivo.com/${file}`).href);
  for (const p of products.filter(p => p.category === category)) {
    assert.ok(hrefs.includes(`https://talrivo.com/${p.page}`), `${file}: missing ${p.folder}`);
  }
}
execFileSync(process.execPath, ['scripts/build-model-pages.mjs', 'all', '--check'], { stdio: 'inherit' });
console.log('Model page checks passed: 26 G-Series versions, 3 Bluetooth and 27 TWS/open-ear pages; distinct routes, matching inquiry options and six gated references.');
