import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const cases = [
  ['g938-vs-g941-wireless-gaming-headset',
    'Tri-Mode Gaming Headsets Compared: G938 vs G941 | TALRIVO',
    'Choosing a tri-mode gaming headset: G938 or G941?',
    'quick-g938-g941-comparison', ['g938-wireless', 'g941-tri-mode-anc']],
  ['g941-vs-g940-wireless-gaming-headset',
    'Tri-Mode vs 2.4GHz Gaming Headsets: G941 vs G940',
    'Need Bluetooth too? Compare G941 and G940 gaming headsets',
    'connection-comparison', ['g941-tri-mode-anc', 'g940-low-latency']],
];
const sitemap = readFileSync('sitemap.xml', 'utf8');
const llms = readFileSync('llms.txt', 'utf8');
const pages = new Map();
for (const [slug, title, heading, anchor, models] of cases) {
  const html = readFileSync(`insights/${slug}/index.html`, 'utf8');
  pages.set(slug, html);
  const url = `https://talrivo.com/insights/${slug}/`;
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<h1>${heading}</h1>`));
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.ok(html.includes('<meta name="robots" content="index, follow">'));
  for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
    assert.ok(html.includes(`<meta ${attribute} content="${title}">`));
  }
  const descriptions = [...html.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
    .map(([, text]) => text);
  assert.equal(descriptions.length, 3);
  assert.equal(new Set(descriptions).size, 1, `${slug}: descriptions agree`);
  assert.match(descriptions[0], /\?/);
  assert.match(descriptions[0], /sample/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const article = schemas.find(schema => schema['@type'] === 'Article');
  assert.equal(article.headline, title);
  assert.equal(article.description, descriptions[0]);
  assert.equal(article.dateModified, '2026-10-31');
  assert.equal(article.mainEntityOfPage, url);
  for (const image of article.image) {
    const path = new URL(image).pathname.slice(1);
    assert.ok(existsSync(path), `${slug}: structured image exists: ${path}`);
  }
  const faq = html.match(/<section class="seo-section seo-faq">([\s\S]*?)<\/section>/)[1];
  const visible = [...faq.matchAll(/<article><h3>([^<]+)<\/h3><p>([^<]+)<\/p><\/article>/g)]
    .map(([, question, answer]) => ({ question, answer }));
  assert.equal(visible.length, 5);
  assert.deepEqual(schemas.find(schema => schema['@type'] === 'FAQPage').mainEntity
    .map(question => ({ question: question.name, answer: question.acceptedAnswer.text })), visible,
  `${slug}: FAQ markup matches the visible answers exactly`);
  assert.ok(html.includes(`href="#${anchor}"`));
  assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
  for (const model of models) assert.ok(html.includes(`href="../../gaming-headsets/${model}/"`));
  assert.match(html, /inquiry=compare#inquiry-form/);
  for (const fact of ['frame version', 'lighting off', 'not results from a matched battery test']) {
    assert.ok(html.includes(fact), `${slug}: preserve ${fact}`);
  }
  assert.doesNotMatch(html, /guaranteed to increase clicks|guaranteed compatibility|zero latency|35dB|free samples?/i);
  assert.ok(sitemap.includes(`<loc>${url}</loc>\n    <lastmod>2026-10-31</lastmod>`));
  assert.ok(llms.includes(`](${url}):`));
}
const g940 = pages.get('g941-vs-g940-wireless-gaming-headset');
for (const fact of ['35mm + 16mm', '500mAh', '1000mAh', 'approximately 20 hours', 'approximately 50 hours',
  'Receiver-based phone use is not Bluetooth pairing', 'do not infer Bluetooth or headset USB audio']) {
  assert.ok(g940.includes(fact), `G941/G940: retain ${fact}`);
}
assert.doesNotMatch(g940, /400mAh|stronger futuristic gaming appearance|product product role/);
const g938 = pages.get('g938-vs-g941-wireless-gaming-headset');
for (const fact of ['53mm', '50mm', '1000mAh', 'Driver size alone does not establish better sound']) {
  assert.ok(g938.includes(fact), `G938/G941: retain ${fact}`);
}
assert.doesNotMatch(g938, /lighter listed weight|cleaner premium lead/);
console.log('Comparison copy checks passed: two buyer questions, aligned metadata/visible FAQs, preserved facts and sample paths.');
