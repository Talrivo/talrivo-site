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


// Structured answers must describe the question and answer users can actually read.
// Audit every sitemap page, including linked text and graph-based homepage JSON-LD.
const normalizeFaqText = value => String(value).replace(/<[^>]+>/g, '')
  .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name) => {
    if (name[0] === '#') return String.fromCodePoint(name[1].toLowerCase() === 'x'
      ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10));
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name.toLowerCase()];
  }).replace(/\s+/g, ' ').trim();
function faqNodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (node['@type'] === 'FAQPage') return [node];
  return Object.values(node).flatMap(faqNodes);
}
let faqPages = 0;
let faqQuestions = 0;
for (const [, url] of readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const file = `${new URL(url).pathname.replace(/^\//, '')}index.html`;
  const html = readFileSync(file, 'utf8');
  const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap(([, json]) => faqNodes(JSON.parse(json)));
  if (!structured.length) continue;
  assert.equal(structured.length, 1, `${file}: one FAQPage per page`);
  const sections = [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)]
    .filter(([section]) => /<section\b[^>]*(?:class="[^"]*\bfaq\b|id="faq")/.test(section));
  const visible = sections.flatMap(([section]) => [...section.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)]
    .flatMap(([article]) => {
      const pair = article.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/);
      return pair ? [{ question: normalizeFaqText(pair[1]), answer: normalizeFaqText(pair[2]) }] : [];
    }));
  assert.ok(visible.length, `${file}: FAQPage needs visible questions and answers`);
  assert.deepEqual(structured[0].mainEntity.map(item => ({ question: normalizeFaqText(item.name),
    answer: normalizeFaqText(item.acceptedAnswer.text) })), visible,
    `${file}: FAQPage must match the complete visible FAQ`);
  faqPages += 1;
  faqQuestions += visible.length;
}
console.log(`Site FAQ consistency passed: ${faqPages} pages and ${faqQuestions} visible answers.`);
