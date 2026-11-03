import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const path = 'videos/gaming-headset-assembly/';
const url = `https://talrivo.com/${path}`;
const html = read(`${path}index.html`);
const title = 'Gaming Headset Assembly Video | Workshop Footage | TALRIVO';
const contentUrl = 'https://talrivo.com/assets/quality-review/g935-assembly-workshop.mp4';
const thumbnail = 'https://talrivo.com/assets/quality-review/g935-assembly-video-poster.webp';
assert.ok(html.includes(`<title>${title}</title>`));
assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
assert.match(html, /name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1"/);
const videos = [...html.matchAll(/<video\b[^>]*>/g)];
assert.equal(videos.length, 1, 'The watch page must feature one video');
assert.match(videos[0][0], /controls playsinline preload="metadata"/);
assert.match(html, /<source src="\.\.\/\.\.\/assets\/quality-review\/g935-assembly-workshop\.mp4" type="video\/mp4">/);
assert.doesNotMatch(html, /<iframe/);
assert.doesNotMatch(videos[0][0], /autoplay|data-src=/);
assert.ok(html.indexOf('<video') < html.indexOf('id="visible-stages-title"'), 'Video precedes supporting article');
assert.match(html, /headband preparation, bracket fitting, earcup assembly and hand finishing/i);
assert.match(html, /does not establish a complete packing procedure/);
assert.match(html, /Confirm the wired or wireless version separately/);
assert.match(html, /reference=g935-assembly#inquiry-form/);
assert.doesNotMatch(html, /product=g935|complete manufacturing process|guaranteed.*(click|rank)/i);
assert.ok(html.includes(`content="${thumbnail}"`));
assert.ok(existsSync('assets/quality-review/g935-assembly-video-poster.webp'));
const asset = 'assets/quality-review/g935-assembly-workshop.mp4';
assert.ok(statSync(asset).size > 0 && statSync(asset).size < 30 * 1024 * 1024, 'Keep the original clip within its size budget');
const mp4 = readFileSync(asset);
const metadataOffset = mp4.indexOf(Buffer.from('moov'));
const mediaOffset = mp4.indexOf(Buffer.from('mdat'));
assert.ok(metadataOffset >= 0 && mediaOffset > metadataOffset, 'MP4 metadata must precede media for fast start');
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
assert.ok(schemas.some(schema => schema['@type'] === 'BreadcrumbList'));
assert.equal(schemas.find(schema => schema['@type'] === 'WebPage').url, url);
// Add rich-video metadata only after the original upload date is verified.
for (const video of schemas.filter(schema => schema['@type'] === 'VideoObject')) {
  assert.equal(video.contentUrl, contentUrl);
  assert.equal(video.thumbnailUrl, thumbnail);
  assert.ok(!Number.isNaN(Date.parse(video.uploadDate)), 'VideoObject requires a verified upload date');
}
assert.ok(read('sitemap.xml').includes(`<loc>${url}</loc>`));
const entry = [...read('video-sitemap.xml').matchAll(/<url>[\s\S]*?<\/url>/g)]
  .map(([block]) => block).find(block => block.includes(`<loc>${url}</loc>`));
assert.ok(entry, 'Dedicated watch page belongs in the video sitemap');
assert.ok(entry.includes(`<video:title>${title}</video:title>`));
assert.ok(entry.includes(`<video:thumbnail_loc>${thumbnail}</video:thumbnail_loc>`));
assert.ok(entry.includes(`<video:content_loc>${contentUrl}</video:content_loc>`));
assert.ok(entry.includes('<video:duration>71</video:duration>'));
for (const source of [
  'gaming-headsets/index.html', 'wireless-gaming-headsets/index.html',
  'gaming-headset-quality-review/index.html', 'oem-odm/index.html',
  'sample-request/index.html', 'insights/index.html',
  'insights/choose-gaming-headset-manufacturer-china/index.html', 'site-map/index.html',
]) {
  assert.ok(read(source).includes(`videos/gaming-headset-assembly/`), `${source} needs a watch-page entry`);
  assert.doesNotMatch(read(source), /assembly and packing|handoff and packing/,
    `${source} must not overstate what the assembly clip proves`);
}
const quality = read('gaming-headset-quality-review/index.html');
assert.match(quality, /id="production-video"/); // Preserve existing inbound anchors.
assert.ok(read('llms.txt').includes(url));
assert.ok(read('.github/workflows/deploy-pages.yml').includes('node scripts/test-assembly-watch.mjs'));
console.log('Assembly watch checks passed: initial-HTML video, discovery links, factual scope and inquiry reference.');

const phoneUrl = 'https://talrivo.com/videos/g938-phone-setup-controls/';
const phone = read('videos/g938-phone-setup-controls/index.html');
const phoneTitle = 'Wireless Gaming Headset Phone Setup Video | G938 | TALRIVO';
assert.ok(phone.includes(`<title>${phoneTitle}</title>`), 'Keep the existing watch-page search title stable');
assert.ok(phone.includes(`<link rel="canonical" href="${phoneUrl}">`));
const phoneDescriptions = [...phone.matchAll(/<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]+)"/g)]
  .map(([, text]) => text);
assert.equal(phoneDescriptions.length, 3);
assert.equal(new Set(phoneDescriptions).size, 1);
const phoneSchemas = [...phone.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json));
const phonePage = phoneSchemas.find(schema => schema['@type'] === 'WebPage');
assert.equal(phonePage.name, phoneTitle);
assert.equal(phonePage.description, phoneDescriptions[0]);
assert.equal(phonePage.datePublished, '2026-10-13');
assert.equal(phonePage.dateModified, '2026-11-03');
const phoneVideo = phoneSchemas.find(schema => schema['@type'] === 'VideoObject');
assert.equal(phonePage.mainEntity['@id'], phoneVideo['@id']);
assert.equal(phoneVideo.embedUrl, 'https://www.youtube-nocookie.com/embed/AKqT0fzuqW8');
assert.equal(phoneVideo.uploadDate, '2026-10-13T00:00:00+08:00');
assert.equal(phoneVideo.duration, 'PT1M26S');
assert.equal((phone.match(/<iframe\b/g) || []).length, 1);
assert.ok(phone.includes(`<iframe src="${phoneVideo.embedUrl}"`), 'Keep the actual player in the initial HTML');
assert.ok(phone.indexOf('<iframe') < phone.indexOf('id="chapters-title"'));
assert.match(phone, /Completed Bluetooth pairing is not clearly visible/);
assert.match(phone, /music playback alone does not verify voice-chat performance/);
assert.match(phone, /reference=g938-phone-setup#inquiry-form/);
for (const time of [0, 38, 60]) {
  assert.ok(phone.includes(`href="https://youtu.be/AKqT0fzuqW8?t=${time}"`));
}
assert.ok(read('sitemap.xml').includes(`<loc>${phoneUrl}</loc>\n    <lastmod>2026-11-03</lastmod>`));
assert.ok(read('insights/index.html').includes('href="../videos/g938-phone-setup-controls/"'));
console.log('Phone demo checks passed: stable title/URL, aligned descriptions, unchanged video metadata, visible player and honest pairing/voice-chat limits.');
