import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inlineCategoryStyles, CATEGORY_STYLE_SOURCES } from './sync-category-styles.mjs';

const root = process.cwd();
const pages = [
  'index.html',
  'gaming-headsets/index.html',
  'gaming-headsets/g946-rgb/index.html',
  'gaming-headsets/g936-lightweight/index.html',
  'gaming-headsets/g938-wireless/index.html',
  'gaming-headsets/g947-foldable/index.html',
  'gaming-headsets/g940-low-latency/index.html',
  'gaming-headsets/g926-wireless/index.html',
  'wireless-gaming-headsets/index.html',
  'bluetooth-headphones/index.html',
  'tws-earbuds/index.html',
  'sample-request/index.html',
  'product-comparison/index.html',
  'insights/evaluate-gaming-headset-sample-before-bulk-order/index.html',
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
      const budget = src.includes('/g946-configuration-presentation-') ? 100000
        : src.includes('/factory-') ? 180000
        : src.includes('g935-connectors-') ? 140000
        : /g947-(gaming-desk|platform-connections)-illustration-/.test(src) ? 90000
          : /g940-feature-board-/.test(src) ? 125000
            : /g926-(feature-overview|controls-material-illustration|gaming-scene-illustration|wearing-fit-illustration|device-connections-illustration)-/.test(src) ? 140000
            : /g940-(gaming-desk|wearing-fit|device-connections)-illustration-/.test(src) ? 90000 : 65000;
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

const homepageFile = pathToFileURL(resolve(root, 'index.html'));
const homeResources = [...home.matchAll(/<(?:img|script|link)\b[^>]*>/g)].flatMap(([tag]) => {
  const source = tag.match(/\bsrc="([^"]+)"/)?.[1];
  const stylesheet = /<link\b/.test(tag) && /rel="(?:stylesheet|icon)"/.test(tag)
    ? tag.match(/\bhref="([^"]+)"/)?.[1] : null;
  const variants = tag.match(/\bsrcset="([^"]+)"/)?.[1].split(',').map(item => item.trim().split(/\s+/)[0]) || [];
  return [source, stylesheet, ...variants].filter(Boolean);
});
for (const source of homeResources.filter(source => !/^[a-z][a-z\d+.-]*:/i.test(source))) {
  assert.ok(!source.startsWith('/'), `Homepage resource must also resolve from a local file: ${source}`);
  const asset = fileURLToPath(new URL(source, homepageFile));
  assert.ok(statSync(asset).isFile(), `Homepage local resource is missing: ${source}`);
}
assert.match(home, /<body class="home-page">/);
assert.match(home, /href="dock-preview\.css\?/);
assert.match(home, /src="assets\/dock-headset-preview\.webp"/);
assert.match(styles, /\.home-page \.about-stats\s*\{[^}]*repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(styles, /\.home-page \.about-columns\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/);
console.log(`Entry image checks passed: ${pages.length} pages, ${checked} responsive images, variant files and byte budgets.`);
console.log(`Homepage local-preview checks passed: ${homeResources.length} resource references resolve without root-relative file paths, with scoped About grids.`);

const category = readFileSync(resolve(root, 'gaming-headsets/index.html'), 'utf8');
assert.equal(category, inlineCategoryStyles(category, root),
  'Category inline styles must stay synchronized: node scripts/sync-category-styles.mjs --write');
assert.equal([...category.matchAll(/<link rel="stylesheet"/g)].length, 1,
  'Keep the shared cacheable stylesheet; avoid three extra category render-blocking requests');
assert.ok(category.includes('href="../styles.css?v=20261108readability"'));
assert.deepEqual([...category.matchAll(/<style data-category-source="([^"]+)"/g)].map(([, source]) => source), CATEGORY_STYLE_SOURCES,
  'Preserve the external stylesheets original cascade order');
assert.doesNotMatch(category, /src="\/dock-preview\.js|data-show-expires/,
  'The category has no expiring notice and does not need its repeated timer');
console.log('Category loading checks passed: one external stylesheet, synchronized source styles and no unused expiry script.');
