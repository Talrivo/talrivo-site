import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const pages = [
  'index.html',
  'gaming-headsets/index.html',
  'gaming-headsets/g936-lightweight/index.html',
  'gaming-headsets/g938-wireless/index.html',
  'wireless-gaming-headsets/index.html',
  'bluetooth-headphones/index.html',
  'tws-earbuds/index.html',
  'sample-request/index.html',
  'contact/index.html',
  'wired-gaming-headsets/index.html',
  'insights/gaming-headset-usb-audio-or-lighting/index.html',
];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
  const responsive = images.filter((tag) => tag.includes('assets/responsive/'));
  assert.ok(responsive.length, `${page}: missing responsive entry image`);
  for (const tag of responsive) {
    const attribute = (name) => tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
    assert.ok(attribute('sizes'), `${page}: sizes is required`);
    assert.ok(Number(attribute('width')) > 0 && Number(attribute('height')) > 0,
      `${page}: intrinsic image dimensions are required`);
    const candidates = attribute('srcset')?.split(',').map((item) => item.trim().split(/\s+/));
    assert.ok(candidates?.length >= 2, `${page}: multiple responsive sizes are required`);
    for (const [src, descriptor] of candidates) {
      assert.match(descriptor, /^\d+w$/, `${page}: use width descriptors`);
      assert.ok(src.endsWith(`-${descriptor.slice(0, -1)}.webp`), `${page}: variant/width mismatch`);
      const file = resolve(root, dirname(page), src);
      const bytes = readFileSync(file);
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${src}: invalid WebP header`);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${src}: invalid WebP header`);
      const budget = src.includes('g935-connectors-') ? 140000 : 65000;
      assert.ok(statSync(file).size < budget, `${src}: exceeds entry-image byte budget`);
    }
    assert.ok(candidates.some(([src]) => src === attribute('src')), `${page}: fallback must match a candidate`);
    if (attribute('fetchpriority') === 'high') {
      assert.notEqual(attribute('loading'), 'lazy', `${page}: do not defer the main image`);
    }
    checked += 1;
  }
}

const home = readFileSync(resolve(root, 'index.html'), 'utf8');
const usbGuide = readFileSync(resolve(root, 'insights/gaming-headset-usb-audio-or-lighting/index.html'), 'utf8');
assert.match(usbGuide, /<a href="g935-usb-35mm-scene\.png"[^>]*>[\s\S]*?g935-connectors-960\.webp/,
  'Keep the original connector illustration accessible from the responsive preview');
assert.ok(statSync(resolve(root, 'insights/gaming-headset-usb-audio-or-lighting/g935-usb-35mm-scene.png')).size > 0,
  'Do not remove the original connector illustration');
const styles = readFileSync(resolve(root, 'styles.css'), 'utf8');
assert.match(styles, /\.site-header \.seo-nav\s*\{[^}]*position:\s*static\s*;/,
  'Mobile SEO navigation must stay in document flow instead of covering the hero');
const cards = [...home.matchAll(/<a class="primary-product-card"[\s\S]*?<\/a>/g)];
assert.equal(cards.length, 3, 'Homepage must retain all three product category routes');
for (const [card] of cards) assert.match(card, /loading="lazy"/, 'Defer below-hero category images');
console.log(`Entry image checks passed: ${pages.length} pages, ${checked} responsive images, variant files and byte budgets.`);
