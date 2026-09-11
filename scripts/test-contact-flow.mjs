import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = process.cwd();
const analyticsCode = readFileSync(`${root}/analytics.js`, 'utf8');
const contactCode = readFileSync(`${root}/contact-form.js`, 'utf8');

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
    querySelector: () => makeNode(),
    reset() {}
  });
  const querySelector = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, makeNode());
    return nodes.get(selector);
  };
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

console.log('Contact flow checks passed: consented source retention, quick-question mapping, and no sent=1 lead event.');
