import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = process.cwd();
const analyticsCode = readFileSync(`${root}/analytics.js`, 'utf8');
const contactCode = readFileSync(`${root}/contact-form.js`, 'utf8');
const contactHtml = readFileSync(`${root}/contact/index.html`, 'utf8');
const productSelect = contactHtml.match(/<select name="product"[^>]*>([\s\S]*?)<\/select>/)[1];
const productOptions = [...productSelect.matchAll(/<option(?: value="([^"]*)")?>([^<]*)<\/option>/g)]
  .map((match) => (match[1] ?? match[2]).replaceAll('&amp;', '&'));

function storageWith(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    value: (key) => values.get(key)
  };
}

function runAnalytics(url, consent = 'granted', existingSource = null) {
  const initial = { talrivoAnalyticsConsent: consent };
  if (existingSource) initial.talrivoInquirySource = JSON.stringify(existingSource);
  const storage = storageWith(initial);
  const document = {
    referrer: '',
    readyState: 'complete',
    head: { appendChild() {} },
    body: { appendChild() {} },
    addEventListener() {},
    querySelector: () => null,
    createElement: () => ({ addEventListener() {}, remove() {}, setAttribute() {} })
  };
  const window = { location: new URL(url), localStorage: storage };

  vm.runInNewContext(analyticsCode, { window, document, URLSearchParams, Date });
  const source = storage.value('talrivoInquirySource');
  return source ? JSON.parse(source) : null;
}

function runContact(url, storedSource = null, consent = 'granted') {
  const nodes = new Map();
  const events = [];
  const storage = storageWith(storedSource ? { talrivoInquirySource: JSON.stringify(storedSource) } : {});
  if (consent) storage.setItem('talrivoAnalyticsConsent', consent);
  const makeNode = () => ({
    value: '',
    disabled: false,
    classList: { add() {}, remove() {} },
    addEventListener() {},
    querySelector: (selector) => querySelector(selector),
    reset() {}
  });
  const querySelector = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, makeNode());
    return nodes.get(selector);
  };
  const productNode = querySelector('select[name="product"]');
  let selectedProduct = '';
  // A real select clears its selection when assigned a value absent from its options.
  Object.defineProperty(productNode, 'value', {
    get: () => selectedProduct,
    set: (value) => { selectedProduct = productOptions.includes(value) ? value : ''; }
  });
  const document = { querySelector, title: 'Contact TALRIVO', referrer: '' };
  const window = {
    location: new URL(url),
    localStorage: storage,
    gtag: (...args) => events.push(args),
    dispatchEvent() {}
  };

  vm.runInNewContext(contactCode, {
    window,
    document,
    URLSearchParams,
    FormData: class { get() { return ''; } },
    CustomEvent: class {},
    fetch() { throw new Error('Network access is not allowed in this test'); }
  });
  return { nodes, events, storage };
}

const captured = runAnalytics('https://talrivo.com/gaming-headsets/g938-wireless/?utm_source=linkedin&utm_medium=social&utm_campaign=g938_device_video');
assert.equal(captured.utmSource, 'linkedin');
assert.equal(captured.utmMedium, 'social');
assert.equal(captured.utmCampaign, 'g938_device_video');
assert.match(captured.firstLandingPage, /g938-wireless/);

const rejected = runAnalytics('https://talrivo.com/', 'denied', captured);
assert.equal(rejected, null);

for (const consent of [null, 'denied']) {
  const fresh = runContact('https://talrivo.com/contact/', null, consent);
  assert.equal(fresh.storage.value('talrivoInquirySource'), undefined, 'form must not create attribution storage');
  const stale = runContact('https://talrivo.com/contact/', captured, consent);
  assert.equal(stale.nodes.get('#contact-utm-source').value, '', 'form must ignore unconsented stored attribution');
}
const partialCampaign = runContact('https://talrivo.com/contact/?utm_source=facebook', captured);
assert.equal(partialCampaign.nodes.get('#contact-utm-source').value, 'facebook');
assert.equal(partialCampaign.nodes.get('#contact-utm-medium').value, '');
assert.equal(partialCampaign.nodes.get('#contact-utm-campaign').value, '');
for (const source of [[], 'invalid', 42]) {
  const malformed = runContact('https://talrivo.com/contact/', source);
  assert.equal(malformed.nodes.get('#contact-utm-source').value, '');
}

const contact = runContact('https://talrivo.com/contact/?product=g938&inquiry=quick-question', captured);
assert.equal(contact.nodes.get('#contact-utm-source').value, 'linkedin');
assert.equal(contact.nodes.get('#contact-first-landing-page').value, captured.firstLandingPage);
assert.equal(contact.nodes.get('#contact-inquiry-type').value, 'Quick product question');

const successDisplay = runContact('https://talrivo.com/contact/?sent=1');
assert.equal(successDisplay.events.filter((event) => event[1] === 'generate_lead').length, 0);

const productRoutes = {
  'dock-headset': 'Magnetic Charging Dock Headset Preview',
  'identify-headset': 'Gaming Headset - Model Not Yet Identified',
  'gaming-headsets': 'Gaming Headset Collection',
  'wireless-gaming-headsets': 'Wireless Gaming Headset Series',
  'wired-gaming-headsets': 'Wired RGB Gaming Headset Series',
  'bluetooth-headphones': 'Bluetooth Headphones',
  'tws-earbuds': 'TWS & Open-Ear Earbuds',
  g926: 'G926 Wireless Gaming Headset',
  g935: 'G935 Wireless Gaming Headset',
  'G942-wired': 'G942 RGB Wired Gaming Headset',
  'G935-wired': 'G935 RGB Wired Gaming Headset',
  g936: 'G936 Lightweight Gaming Headset',
  g938: 'G938 Wireless Gaming Headset',
  g940: 'G940 Low-Latency Wireless Gaming Headset',
  g941: 'G941 Tri-Mode ANC Gaming Headset',
  g946: 'G946 Tri-Mode RGB Gaming Headset',
  g947: 'G947 Tri-Mode Gaming Headset',
  b7: 'B7 Bluetooth Over-Ear Headphone',
  b9: 'B9 Bluetooth Over-Ear Headphone',
  b10: 'B10 Bluetooth Over-Ear Headphone',
  tws044f: 'TWS044F Earbuds',
  earclip09s: 'Earclip09S Open-Ear TWS Earbuds',
  'g938-g941': 'G938 / G941 Gaming Headset Comparison',
  'audio-products': 'Custom Audio Project'
};
for (const [route, expected] of Object.entries(productRoutes)) {
  const inquiry = route === 'g938-g941' ? 'compare' : 'sample';
  const result = runContact(`https://talrivo.com/contact/?product=${route}&inquiry=${inquiry}`);
  assert.equal(result.nodes.get('select[name="product"]').value, expected, `${route} must select an existing product option`);
  assert.equal(result.nodes.get('#contact-inquiry-type').value, inquiry === 'compare' ? 'Model comparison' : 'Sample request');
  assert.ok(result.nodes.get('#contact-selected-from').value.includes(`Product: ${expected}`));
}
const g938VideoContact = runContact('https://talrivo.com/contact/?product=g938&inquiry=quick-question&reference=g938-phone-setup', captured);
assert.equal(g938VideoContact.nodes.get('select[name="product"]').value, 'G938 Wireless Gaming Headset');
assert.equal(g938VideoContact.nodes.get('#contact-inquiry-type').value, 'Quick product question');
assert.match(g938VideoContact.nodes.get('#contact-product-reference').value, /G938 phone setup and controls.*AKqT0fzuqW8/);
assert.equal(g938VideoContact.nodes.get('#contact-reference-note').hidden, false);
assert.equal(g938VideoContact.nodes.get('#contact-utm-source').value, 'linkedin');
assert.equal(g938VideoContact.events.length, 0, 'opening a video inquiry must not generate a lead');
const unknownProduct = runContact('https://talrivo.com/contact/?product=unknown-model');
for (const [route, expected] of [['model-code', 'Model comparison'], ['oem-odm', 'OEM / private-label project']]) {
  const legacy = runContact(`https://talrivo.com/contact/?product=gaming-headsets&inquiry=${route}`);
  assert.equal(legacy.nodes.get('#contact-inquiry-type').value, expected);
  assert.ok(legacy.nodes.get('#contact-selected-from').value.includes(`Inquiry: ${expected}`));
  assert.equal(legacy.events.length, 0, 'opening a legacy inquiry route must not generate a lead');
}
for (const inquiry of ['quick-question', 'sample']) {
  const guide = runContact(`https://talrivo.com/contact/?product=wired-gaming-headsets&inquiry=${inquiry}&reference=usb-connection-guide`, captured);
  assert.equal(guide.nodes.get('select[name="product"]').value, 'Wired RGB Gaming Headset Series');
  assert.equal(guide.nodes.get('#contact-inquiry-type').value, inquiry === 'sample' ? 'Sample request' : 'Quick product question');
  assert.match(guide.nodes.get('#contact-product-reference').value, /Gaming headset USB audio or lighting guide: https:\/\/talrivo.com\/insights\/gaming-headset-usb-audio-or-lighting\//);
  assert.equal(guide.nodes.get('#contact-reference-note').hidden, false);
  assert.match(guide.nodes.get('#contact-reference-note').textContent, /Guide reference:.*target device/);
  assert.doesNotMatch(guide.nodes.get('#contact-reference-note').textContent, /timestamp/);
  assert.equal(guide.nodes.get('#contact-utm-source').value, 'linkedin');
  assert.equal(guide.events.length, 0, 'opening a guide inquiry must not generate a lead');
}
const videoContact = runContact('https://talrivo.com/contact/?product=identify-headset&inquiry=quick-question&reference=hk-headsets-2026');
const assemblyContact = runContact('https://talrivo.com/contact/?product=gaming-headsets&inquiry=quick-question&reference=g935-assembly');
const g946StyleContact = runContact('https://talrivo.com/contact/?product=g946&inquiry=quick-question&reference=g946-style');
assert.equal(g946StyleContact.nodes.get('select[name="product"]').value, 'G946 Tri-Mode RGB Gaming Headset');
assert.match(g946StyleContact.nodes.get('#contact-product-reference').value, /G946 fashion-to-gaming style concept.*PGj_ESVdFgA/);
assert.equal(g946StyleContact.nodes.get('#contact-reference-note').hidden, false);
assert.equal(assemblyContact.nodes.get('select[name="product"]').value, 'Gaming Headset Collection');
assert.equal(assemblyContact.nodes.get('#contact-inquiry-type').value, 'Quick product question');
assert.match(assemblyContact.nodes.get('#contact-product-reference').value, /G935 assembly and packing process.*1KQfLCmMhE4/);
assert.equal(assemblyContact.nodes.get('#contact-reference-note').hidden, false);
assert.equal(assemblyContact.events.length, 0, 'opening the assembly-video inquiry must not generate a lead');
assert.ok(videoContact.nodes.get('#contact-product-reference').value.includes('https://youtu.be/SLcAr-jqdUs'));
assert.equal(videoContact.nodes.get('#contact-reference-note').hidden, false);
for (const reference of ['unknown', '__proto__', 'constructor', 'https://example.com/']) {
  const result = runContact(`https://talrivo.com/contact/?reference=${encodeURIComponent(reference)}`);
  assert.equal(result.nodes.get('#contact-product-reference').value, '');
}
assert.equal(unknownProduct.nodes.get('select[name="product"]').value, '');

for (const route of ['dock-headset', 'identify-headset']) {
  const result = runContact(`https://talrivo.com/contact/?product=${route}&inquiry=quick-question`);
  assert.equal(result.nodes.get('select[name="product"]').value, productRoutes[route]);
  assert.equal(result.nodes.get('#contact-inquiry-type').value, 'Quick product question');
}
for (const page of ['index.html', 'gaming-headsets/index.html']) {
  const html = readFileSync(`${root}/${page}`, 'utf8');
  assert.ok(html.includes('/contact/?product=dock-headset&amp;inquiry=quick-question#inquiry-form'));
}
assert.ok(contactHtml.includes('id="model-reference-help"'));

console.log(`Contact flow checks passed: ${Object.keys(productRoutes).length} product routes, consented source retention, quick-question mapping, and no sent=1 lead event.`);
