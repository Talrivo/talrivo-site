import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const originals = [
  ['sit240719190301-red', 'd96ffdab06a344991d38618ba00ddeb70545ead85589ba12a79bc3c4923d8d99'],
  ['sit240719190302r-rohs', '410aacddfe4650e7c9981326f023cc794974910e4bdb39956f609fa3e26a69b4'],
];
const html = readFileSync('gaming-headset-quality-review/index.html', 'utf8');
const section = html.match(/<section[^>]*id="published-certificates"[\s\S]*?<\/section>/)?.[0];
assert.ok(section, 'Original documents require a visible scope and named holder');
assert.match(section, /Nanrui Electronic Technology Co\., Ltd\./);
assert.match(section, /PHX-WPRO, G938, G939, G926, G927, G922 and G923/);
assert.match(section, /July 31, 2024/);
assert.match(section, /do not name TALRIVO as the certificate holder/);
assert.match(section, /G936 and other unlisted models are not covered/);
assert.match(section, /not a new issuer verification/);
for (const [name, expected] of originals) {
  const pdf = readFileSync(`assets/certificates/${name}.pdf`);
  assert.equal(pdf.toString('ascii', 0, 5), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), expected,
    `${name}: keep the supplied original PDF unchanged`);
  const preview = readFileSync(`assets/certificates/${name}-preview.webp`);
  assert.equal(preview.toString('ascii', 0, 4), 'RIFF');
  assert.equal(preview.toString('ascii', 8, 12), 'WEBP');
  assert.ok(section.includes(`href="../assets/certificates/${name}.pdf"`));
  assert.ok(section.includes(`src="../assets/certificates/${name}-preview.webp"`));
}
const model = readFileSync('gaming-headsets/g938-wireless/index.html', 'utf8');
assert.match(model, /gaming-headset-quality-review\/#published-certificates/);
assert.match(model, /not a claim that every G938 variant is covered/);

const guide = readFileSync('insights/gaming-headset-import-documents-checklist/index.html', 'utf8');
assert.ok(guide.includes('<title>Gaming Headset Import Documents Checklist | TALRIVO</title>'));
assert.ok(guide.includes('<link rel="canonical" href="https://talrivo.com/insights/gaming-headset-import-documents-checklist/">'));
assert.match(guide, /id="certificate-match" aria-labelledby="certificate-match-title"/);
assert.match(guide, /href="#certificate-match">Check the Certificate Model List/);
const matchSection = guide.match(/<section[^>]*id="certificate-match"[\s\S]*?<\/section>/)?.[0];
assert.match(matchSection, /Nanrui Electronic Technology Co\., Ltd\./);
assert.match(matchSection, /July 31, 2024/);
assert.match(matchSection, /PHX-WPRO, G938, G939, G926, G927, G922 and G923/);
assert.match(matchSection, /G936 is not listed in these two PDFs/);
assert.match(matchSection, /do not name TALRIVO as the certificate holder/);
assert.match(matchSection, /not a new issuer verification or a complete set/);
assert.match(matchSection, /class="seo-grid video-grid"/);
assert.doesNotMatch(matchSection, /class="table-wrap"/, 'Keep the two original PDF links directly visible on narrow screens');
for (const [name] of originals) {
  assert.ok(matchSection.includes(`href="../../assets/certificates/${name}.pdf"`));
}
assert.equal((guide.match(/reference=import-documents-guide#inquiry-form/g) || []).length, 3);
const schemas = [...guide.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const article = schemas.find(schema => schema['@type'] === 'Article');
const description = guide.match(/<meta name="description" content="([^"]+)"/)[1];
assert.equal(article.description, description);
for (const attribute of ['property="og:description"', 'name="twitter:description"']) {
  assert.ok(guide.includes(`<meta ${attribute} content="${description}">`));
}
assert.equal(article.dateModified, '2026-10-24');
assert.match(guide, /Updated October 24, 2026/);
const visibleFaq = guide.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
const answers = [...visibleFaq.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({question, answer}));
assert.equal(answers.length, 4, 'Retain every structured question in visible content');
assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
  .map(q => ({question: q.name, answer: q.acceptedAnswer.text})), answers);
assert.ok(readFileSync('insights/index.html', 'utf8').includes('href="gaming-headset-import-documents-checklist/#certificate-match"'));
console.log('Certificate checks passed: unchanged originals, explicit holder/model/date scope, direct guide links, synchronized description and visible FAQ, stable title/canonical.');
