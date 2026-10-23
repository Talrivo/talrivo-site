import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('insights/gaming-headset-microphone-performance/index.html', 'utf8');
const sheet = readFileSync('assets/downloads/gaming-headset-mic-recording-sheet.txt', 'utf8');
const normalize = text => text.replace(/\s+/g, ' ').trim();
const passage = html.match(/<blockquote id="mic-recording-script"><p>([^<]+)<\/p><\/blockquote>/)?.[1];
assert.ok(passage, 'Expose the recording passage as visible text');
assert.ok(normalize(sheet).includes(`"${normalize(passage)}"`), 'Download must contain the same passage');
assert.match(html, /href="#quick-mic-test">Get the Recording Script/);
assert.match(html, /href="\.\.\/\.\.\/assets\/downloads\/gaming-headset-mic-recording-sheet.txt" download/);
assert.match(html, /not a laboratory measurement or a completed test report/);
assert.match(sheet, /Blank buyer worksheet\. Not a completed test report/);
assert.match(sheet, /Do not add music or edit out a dropout or clipped word/);
assert.match(sheet, /processing settings, including noise suppression/);
assert.match(sheet, /Not tested \/ reason:/);
assert.ok(html.includes('<title>Gaming Headset Mic Test Checklist for Importers | TALRIVO</title>'));
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
const section = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)?.[1];
const visible = [...section.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
  .map(([, question, answer]) => ({ question, answer }));
assert.equal(visible.length, 6);
assert.deepEqual(faq.mainEntity.map(q => ({ question: q.name, answer: q.acceptedAnswer.text })), visible);
for (const file of ['gaming-headsets/index.html', 'wireless-gaming-headsets/index.html', 'sample-request/index.html']) {
  const page = readFileSync(file, 'utf8');
  const main = page.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main?.includes('href="../insights/gaming-headset-microphone-performance/#quick-mic-test"'),
    `${file}: expose the recording script in visible main content, not only navigation or JSON-LD`);
}
const sampleRequest = readFileSync('sample-request/index.html', 'utf8');
assert.ok(sampleRequest.includes('href="../assets/downloads/gaming-headset-mic-recording-sheet.txt" download'));
const wireless = readFileSync('wireless-gaming-headsets/index.html', 'utf8');
assert.ok(wireless.includes('href="../insights/gaming-headset-packaging-accessories-checklist/#packing-checklist"'));
assert.match(sampleRequest, /class="buyer-resource-link" href="\.\.\/insights\/gaming-headset-microphone-performance\/#quick-mic-test"/);
assert.match(sampleRequest, /class="buyer-resource-link" href="\.\.\/assets\/downloads\/gaming-headset-mic-recording-sheet.txt" download/);
assert.match(readFileSync('styles.css', 'utf8'), /\.seo-page a\.buyer-resource-link\s*\{[^}]*text-decoration-line: underline;/);
console.log('Mic review checks passed: identical visible/download script, blank worksheet boundaries, stable title and synchronized FAQ.');
