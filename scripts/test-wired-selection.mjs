import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync('wired-gaming-headsets/index.html', 'utf8');
const section = html.match(/<section\b[^>]*id="wired-models"[\s\S]*?<\/section>/)?.[0];
assert.ok(section, 'Retain the wired model selection section');
const cards = [...section.matchAll(/<article>[\s\S]*?<\/article>/g)].map(([card]) => card);
assert.equal(cards.length, 2, 'Keep wireless and tri-mode references outside the wired product cards');
assert.match(cards[0], /G942 RGB Wired Gaming Headset/);
assert.match(cards[1], /G935 RGB Wired Gaming Headset/);
assert.ok(cards.every(card => !/G936|G946/.test(card)), 'Do not classify multi-mode models as wired-only');

const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const collection = schemas.find(schema => schema['@type'] === 'CollectionPage');
assert.deepEqual(collection.mainEntity.itemListElement.map(item => item.name),
  ['G942 RGB Wired Gaming Headset', 'G935 RGB Wired Gaming Headset']);
assert.match(html, /id="connection-options"/);
assert.ok(html.indexOf('id="connection-options"') < html.indexOf('id="wired-models"'),
  'Explain the audio connection before presenting model choices');
assert.match(html, /role="region" aria-label="Wired headset connection comparison"/);
assert.match(html, /not included in the described standard package or headset unit price/);
assert.match(html, /not a device compatibility test report/);
for (const target of [
  '../insights/gaming-headset-usb-audio-or-lighting/#lighting',
  '../assets/downloads/wired-gaming-headset-sample-checklist.txt',
  '../wireless-gaming-headsets/',
]) {
  assert.ok(html.includes(`href="${target}"`), `Missing buyer resource: ${target}`);
  const path = resolve('wired-gaming-headsets', target.split('#')[0]);
  assert.ok(existsSync(path), `Missing local target: ${target}`);
}
console.log('Wired selection checks passed: distinct model cards, matching collection schema, connection and accessory boundaries, resource links.');
