import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hub = readFileSync('insights/index.html', 'utf8');
const section = hub.match(/<section[^>]*id="buyer-worksheets"[\s\S]*?<\/section>/)?.[0];
assert.ok(section, 'Expose a linkable worksheet section in rendered HTML');
assert.ok(hub.includes('href="#buyer-worksheets"'));
for (const [sheet, guide, anchor] of [
  ['gaming-headset-mic-recording-sheet', 'gaming-headset-microphone-performance', 'quick-mic-test'],
  ['gaming-headset-packing-review-sheet', 'gaming-headset-packaging-accessories-checklist', 'packing-checklist'],
  ['wireless-gaming-headset-sample-review', 'evaluate-gaming-headset-sample-before-bulk-order', 'review-worksheet']
]) {
  assert.ok(section.includes(`href="../assets/downloads/${sheet}.txt" download`));
  assert.ok(section.includes(`href="${guide}/#${anchor}"`));
  const page = readFileSync(`insights/${guide}/index.html`, 'utf8');
  assert.ok(page.includes(`id="${anchor}"`));
  const text = readFileSync(`assets/downloads/${sheet}.txt`, 'utf8');
  assert.match(text, /Version: \d{4}-\d{2}-\d{2}/);
  assert.ok(text.includes(`https://talrivo.com/insights/${guide}/`));
  assert.match(text, /[Bb]lank buyer worksheet/);
  {
    assert.ok(page.includes(`href="https://talrivo.com/insights/${guide}/#${anchor}"`));
    assert.match(text, /SHARING THE BLANK WORKSHEET/);
  }
}
for (const [file, reference] of [
  ['wireless-gaming-headset-sample-review', 'sample-evaluation-guide'],
  ['gaming-headset-packing-review-sheet', 'packing-checklist'],
  ['gaming-headset-mic-recording-sheet', 'mic-comparison-guide']
]) {
  const text = readFileSync(`assets/downloads/${file}.txt`, 'utf8');
  assert.ok(text.includes(`&reference=${reference}#inquiry-form`), 'Downloaded worksheets retain their inquiry context');
}
assert.match(section, /No email is needed/);
assert.ok(readFileSync('llms.txt', 'utf8').includes('#buyer-worksheets'));
assert.ok(hub.includes('<title>Gaming Headset Sourcing Guides for Importers | TALRIVO</title>'));
console.log('Buyer worksheet checks passed: three direct downloads, source versions, real guide anchors, sharing boundaries and stable title.');

// Download promises must resolve to versioned, editable resources and instructions.
for (const [name, page, anchor] of [
  ['gaming-headset-rfq-template', 'rfq-guide/index.html', 'rfq-download'],
  ['gaming-headset-quote-scope-review', 'insights/private-label-gaming-headset-rfq-checklist/index.html', 'quote-comparison'],
]) {
  const file = `assets/downloads/${name}.txt`;
  const text = readFileSync(file, 'utf8');
  const html = readFileSync(page, 'utf8');
  assert.match(text, /Version: \d{4}-\d{2}-\d{2}/);
  assert.match(text, /Blank buyer worksheet/);
  assert.match(text, /Not confirmed/);
  assert.match(text, /SHARING THE BLANK WORKSHEET/);
  assert.ok(text.includes(`https://talrivo.com/${page.replace(/index\.html$/, '')}#${anchor}`));
  assert.ok(text.includes('&reference=rfq-template#inquiry-form'));
  assert.ok(html.includes(`id="${anchor}"`));
  assert.ok(html.includes(`${file}" download`));
  assert.ok(section.includes(`${file}" download`));
  assert.doesNotMatch(text, /(?:USD|US\$|\$)\s*\d|MOQ[: ]+\d|lead time[: ]+\d/i);
}
const rfq = readFileSync('rfq-guide/index.html', 'utf8');
const rfqDescription = rfq.match(/<meta name="description" content="([^"]+)"/)[1];
for (const attr of ['property="og:description"', 'name="twitter:description"']) {
  assert.ok(rfq.includes(`<meta ${attr} content="${rfqDescription}">`));
}
console.log('RFQ resources passed: two ungated versioned downloads, canonical instructions, inquiry context and no numeric commercial promises.');

for (const page of ['rfq-guide/index.html', 'insights/private-label-gaming-headset-rfq-checklist/index.html']) {
  const html = readFileSync(page, 'utf8');
  assert.match(html, /<main class="seo-page rfq-buyer-page">/);
  assert.match(html, /analytics\.js\?v=20261113buyerpaths/);
}
assert.match(readFileSync('styles.css', 'utf8'), /\.rfq-buyer-page \.seo-hero > img\s*\{\s*order: 0;/);
