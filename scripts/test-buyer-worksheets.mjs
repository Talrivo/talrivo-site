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
  if (sheet !== 'wireless-gaming-headset-sample-review') {
    assert.ok(page.includes(`href="https://talrivo.com/insights/${guide}/#${anchor}"`));
    assert.match(text, /SHARING THE BLANK WORKSHEET/);
  }
}
assert.match(section, /No email is needed/);
assert.ok(readFileSync('llms.txt', 'utf8').includes('#buyer-worksheets'));
assert.ok(hub.includes('<title>Gaming Headset Sourcing Guides for Importers | TALRIVO</title>'));
console.log('Buyer worksheet checks passed: three direct downloads, source versions, real guide anchors, sharing boundaries and stable title.');
