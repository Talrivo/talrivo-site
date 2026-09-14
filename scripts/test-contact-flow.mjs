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
    querySelector: () => null,
    createElement: () => ({ addEventListener() {}, remove() {}, setAttribute() {} })
  };
  const window = { location: new URL(url), localStorage: storage };

  vm.runInNewContext(analyticsCode, { window, document, URLSearchParams, Date });
  const source = storage.value('talrivoInquirySource');
  return source ? JSON.parse(source) : null;
}

function runContact(url, storedSource = null) {
  const nodes = new Map();
  const events = [];
  const storage = storageWith(storedSource ? { talrivoInquirySource: JSON.stringify(storedSource) } : {});
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
  return { nodes, events };
}

const captured = runAnalytics('https://talrivo.com/gaming-headsets/g938-wireless/?utm_source=linkedin&utm_medium=social&utm_campaign=g938_device_video');
assert.equal(captured.utmSource, 'linkedin');
assert.equal(captured.utmMedium, 'social');
assert.equal(captured.utmCampaign, 'g938_device_video');
assert.match(captured.firstLandingPage, /g938-wireless/);

const rejected = runAnalytics('https://talrivo.com/', 'denied', captured);
assert.equal(rejected, null);

const contact = runContact('https://talrivo.com/contact/?product=g938&inquiry=quick-question', captured);
assert.equal(contact.nodes.get('#contact-utm-source').value, 'linkedin');
assert.equal(contact.nodes.get('#contact-first-landing-page').value, captured.firstLandingPage);
assert.equal(contact.nodes.get('#contact-inquiry-type').value, 'Quick product question');

const successDisplay = runContact('https://talrivo.com/contact/?sent=1');
assert.equal(successDisplay.events.filter((event) => event[1] === 'generate_lead').length, 0);

const productRoutes = {
  'gaming-headsets': 'Gaming Headset Collection',
  'wireless-gaming-headsets': 'Wireless Gaming Headset Series',
  'wired-gaming-headsets': 'Wired RGB Gaming Headset Series',
  'bluetooth-headphones': 'Bluetooth Headphones',
  'tws-earbuds': 'TWS & Open-Ear Earbuds',
  g926: 'G926 Wireless Gaming Headset',
  g935: 'G935 Wireless Gaming Headset',
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
const unknownProduct = runContact('https://talrivo.com/contact/?product=unknown-model');
assert.equal(unknownProduct.nodes.get('select[name="product"]').value, '');

console.log(`Contact flow checks passed: ${Object.keys(productRoutes).length} product routes, consented source retention, quick-question mapping, and no sent=1 lead event.`);
