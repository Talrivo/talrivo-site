import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelMatches, setupModelFinder } from '../gaming-headset-models/model-finder.mjs';

const html = readFileSync('gaming-headset-models/index.html', 'utf8');
const code = readFileSync('gaming-headset-models/model-finder.mjs', 'utf8');
assert.doesNotMatch(code, /fetch\(|sendBeacon|localStorage|sessionStorage|gtag\(|\.innerHTML/);
assert.match(html, /<form[^>]*id="model-finder"[^>]*hidden>/);
assert.match(html, /type="module" src="model-finder\.mjs/);
assert.match(html, /product=identify-headset&amp;inquiry=quick-question/);
assert.match(html, /href="\.\.\/product-comparison\/#quick-shortlist"/);
assert.doesNotMatch(html, /Compare G926, G935, G938, G940 and G941/);

assert.ok(modelMatches('G936 wireless', 'g 936'));
assert.ok(modelMatches('G936 wireless', 'WIRELESS G936'));
assert.ok(modelMatches('G936 wired', 'G-936 wired'));
assert.equal(modelMatches('G936 wireless', 'G936 wired'), false);
assert.equal(modelMatches('G936 wireless', 'G9360'), false);
assert.equal(modelMatches('G936 wireless', 'unknown'), false);
assert.ok(modelMatches('G946 wireless', 'Ｇ９４６'));
assert.ok(modelMatches('G936 wireless', '936'));
assert.equal(modelMatches('G1936 wireless', 'G936'), false);
assert.equal(modelMatches('G936 wireless', '---'), false);
assert.equal(modelMatches('G936 wireless', '無線'), false);
assert.ok(modelMatches('G939 wireless', '50mm', '50 mm driver'));
assert.ok(modelMatches('G939 wireless', '1000 mAh', '1000mAh battery'));
assert.ok(modelMatches('G938 wireless', '2.4GHz', '2.4G receiver'));
assert.equal(modelMatches('G940 wireless', '24GHz', '2.4G receiver'), false);
assert.equal(modelMatches('G941 wireless', 'wired', 'Bluetooth and wired direction'), false);
assert.equal(modelMatches('G941 wired reference', 'Bluetooth'), false);
assert.equal(modelMatches('G946 wireless', 'phone charging', 'wireless charging dock'), false);
assert.ok(modelMatches('G946 wireless', '   '));

const node = () => ({ hidden: false, disabled: false, value: '', textContent: '', handlers: {},
  addEventListener(type, handler) { this.handlers[type] = handler; }, focus() { this.focused = true; } });
const form = node(); form.hidden = true;
const input = node(), clear = node(), status = node(), empty = node();
form.querySelector = selector => ({input, 'button[type="button"]':clear, '[role="status"]':status, '#model-finder-empty':empty})[selector];
const sections = new Map();
for (const [id, count] of [['wireless-models',13],['wired-models',7],['pending-models',6]]) {
  const sectionHtml = html.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?<\\/section>`))[0];
  const matches = id === 'pending-models'
    ? [...sectionHtml.matchAll(/<a href="([^\"]+)">([^<]+)<\/a>/g)]
    : [...sectionHtml.matchAll(/<tr><td><a href="([^\"]+)">([^<]+)<\/a>/g)];
  assert.equal(matches.length, count, 'Retain all original entries in crawlable HTML');
  const rows = [...sectionHtml.matchAll(/<tr><td>[\s\S]*?<\/tr>/g)].map(([row]) => row);
  const entries = matches.map(([, href, text], index) => {
    const link = node(); link.href = href; link.textContent = text;
    if (id === 'pending-models') return link;
    const row = node(); row.link = link; row.querySelector = () => link;
    const cells = [...rows[index].matchAll(/<td>([\s\S]*?)<\/td>/g)]
      .map(([, text]) => ({ textContent: text.replace(/<[^>]*>/g, '') }));
    row.querySelectorAll = () => cells;
    return row;
  });
  const section = node(); section.entries = entries; section.summary = node();
  section.querySelector = () => section.summary;
  section.querySelectorAll = () => entries;
  sections.set('#'+id, section);
}
const shortcut = node(), versionChecks = node();
setupModelFinder({ querySelector: selector => selector === '#model-finder' ? form : selector === '#version-checks' ? versionChecks : sections.get(selector), querySelectorAll: () => [shortcut] });
assert.equal(form.hidden, false);
assert.match(status.textContent, /20 listed product versions and 6 references awaiting specifications shown/);
assert.equal(empty.hidden, true);
assert.equal(clear.disabled, true);
const search = query => { input.value = query; input.handlers.input(); };
const visible = id => sections.get('#'+id).entries.filter(entry => !entry.hidden);
const listedLabels = () => [...visible('wireless-models'), ...visible('wired-models')]
  .map(entry => entry.link.textContent);
for (const [query, expected] of [
  ['charging dock', ['G946 wireless']],
  ['fabric cushions', ['G936 wireless']],
  ['50mm', ['G941 wireless', 'G939 wireless', 'G927 wireless', 'G926 wireless', 'G946 wireless', 'G947 wireless']],
  ['53 mm', ['G938 wireless']],
  ['1000mAh', ['G941 wireless', 'G939 wireless', 'G938 wireless']],
  ['Bluetooth', ['G941 wireless', 'G938 wireless', 'G946 wireless', 'G947 wireless']],
  ['G941 Bluetooth', ['G941 wireless']],
  ['Ｇ９４６', ['G946 wireless']],
  ['wired fabric', []],
  ['G9410', []],
  ['phone charging', []],
  ['無線', []],
  ['---', []],
]) {
  search(query);
  assert.deepEqual(listedLabels(), expected, `Listed-feature search: ${query}`);
  assert.equal(visible('pending-models').length, 0, 'Do not invent specifications for pending references');
  assert.equal(empty.hidden, expected.length > 0);
}
search('G941 wired');
assert.deepEqual(listedLabels(), []);
assert.equal(visible('pending-models').length, 1);
search('wired');
assert.equal(visible('wireless-models').length, 0, 'Tri-mode wired capability must not change the version label');
assert.equal(visible('wired-models').length, 7);
assert.equal(visible('pending-models').length, 4);
search('G936');
assert.equal(versionChecks.hidden, true, 'Show matching tables directly below the finder');
assert.equal(visible('wireless-models').length, 1);
assert.equal(visible('wired-models').length, 1);
assert.equal(visible('pending-models').length, 0);
assert.equal(sections.get('#pending-models').hidden, true);
assert.match(status.textContent, /2 listed product versions and 0 references/);
search('G941');
assert.equal(visible('wireless-models').length, 1);
assert.equal(visible('pending-models').length, 1, 'An image-only wired reference must stay pending');
assert.match(status.textContent, /1 listed product version and 1 reference awaiting specifications/);
search('G935 wired');
let prevented = false;
form.handlers.submit({preventDefault() { prevented = true; }});
assert.ok(prevented, 'The local finder must never submit a network form');
assert.equal(visible('wired-models')[0].link.focused, true, 'Explicit Find moves focus to the matching product link');
assert.equal(sections.get('#wireless-models').hidden, true);
search('G9360');
assert.equal(empty.hidden, false);
assert.match(status.textContent, /^0 listed product versions and 0 references/);
assert.ok([...sections.values()].every(section => section.hidden));
shortcut.handlers.click();
assert.equal(input.value, '');
assert.ok([...sections.values()].every(section => !section.hidden));
search('private-person@example.invalid');
assert.equal(empty.hidden, false);
assert.doesNotMatch(status.textContent, /private-person|example.invalid/);
clear.handlers.click();
assert.equal(versionChecks.hidden, false, 'Restore version explanations when clearing the search');
assert.equal(input.focused, true);
assert.equal(visible('wireless-models').length + visible('wired-models').length + visible('pending-models').length, 26);
assert.ok([...sections.values()].every(section => section.summary.hidden));
console.log('Model finder checks passed: all 26 static links, wired/wireless separation, six pending references, listed-feature and normalized code matching, wired/wireless boundaries, no match, clear, keyboard focus, shortcuts and no storage/network.');
