import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync('analytics.js', 'utf8');
function scenario(consent, blocked = false, url = 'https://talrivo.com/contact/?utm_content=private-text') {
  const values = new Map(consent ? [['talrivoAnalyticsConsent', consent]] : []);
  const handlers = new Map();
  const rendered = [];
  const node = () => ({
    attributes: new Map(), addEventListener() {}, remove() {},
    setAttribute(name, value) { this.attributes.set(name, value); }
  });
  const document = {
    readyState: 'complete', referrer: '',
    head: { appendChild() {} }, body: { appendChild(element) { rendered.push(element); } },
    querySelector: () => null, createElement: node,
    addEventListener: (event, callback) => handlers.set(event, callback)
  };
  const window = {
    location: new URL(url),
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return values.get(key) ?? null; },
      setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)
    }
  };
  vm.runInNewContext(code, { window, document, URL, URLSearchParams, Date });
  const click = (href, region = '', wechat = false, inMain = false) => {
    const target = {
      getAttribute: key => key === 'href' ? href : null,
      hasAttribute: key => key === 'data-open-wechat' && wechat,
      closest: selector => selector === 'a[href], [data-open-wechat]' ? target
        : selector === region || (selector === 'main' && inMain) ? {} : null
    };
    handlers.get('click')({ target });
  };
  const events = () => window.dataLayer.filter(args => args[0] === 'event');
  return { values, click, events, rendered };
}
const firstVisit = scenario(null);
const consentPanel = firstVisit.rendered.find(element => element.className === 'analytics-consent');
assert.equal(consentPanel.attributes.get('data-nosnippet'), '', 'Keep consent boilerplate out of search snippets');
assert.equal(consentPanel.attributes.get('role'), 'dialog');
assert.match(consentPanel.innerHTML, /data-analytics-consent="denied"/);
assert.match(consentPanel.innerHTML, /data-analytics-consent="granted"/);
for (const consent of [null, 'denied']) {
  const run = scenario(consent);
  run.click('mailto:sales@talrivo.com');
  assert.equal(run.events().length, 0);
}
const allowed = scenario('granted');
allowed.click('mailto:sales@talrivo.com?body=private-message', '.site-footer');
allowed.click('https://wa.me/8613824276001?text=private-message', '.contact-dock');
allowed.click('', '', true);
allowed.click('https://wa.me.example.org/');
allowed.click('/gaming-headsets/');
assert.equal(allowed.events().length, 3);
assert.deepEqual(Array.from(allowed.events(), args => args[2].contact_method), ['email', 'whatsapp', 'wechat']);
assert.equal(allowed.events()[0][2].contact_location, 'footer');
assert.equal(allowed.events()[1][2].contact_location, 'contact_dock');
for (const args of allowed.events()) {
  assert.equal(args[1], 'contact_click');
  assert.equal(args[2].page_path, '/contact/');
  assert.equal(JSON.stringify(args).includes('private-'), false);
  assert.equal(JSON.stringify(args).includes('sales@'), false);
}
allowed.values.set('talrivoAnalyticsConsent', 'denied');
allowed.click('mailto:sales@talrivo.com');
assert.equal(allowed.events().length, 3);
const blocked = scenario(null, true);
blocked.click('mailto:sales@talrivo.com');
assert.equal(blocked.events().length, 0);

const micPage = '/insights/gaming-headset-microphone-performance/';
const packingPage = '/insights/gaming-headset-packaging-accessories-checklist/';
const documentsPage = '/insights/gaming-headset-import-documents-checklist/';
const resourceCases = [
  ['/insights/', '../assets/downloads/gaming-headset-mic-recording-sheet.txt', 'mic_recording_sheet'],
  ['/insights/', '../assets/downloads/gaming-headset-packing-review-sheet.txt', 'packing_review_sheet'],
  ['/insights/', '../assets/downloads/wireless-gaming-headset-sample-review.txt', 'sample_review_sheet'],
  [micPage, '#quick-mic-test', 'mic_script'],
  [packingPage, '#packing-checklist', 'packing_checklist'],
  [documentsPage, '#certificate-match', 'certificate_match'],
  [documentsPage, '../../assets/certificates/sit240719190301-red.pdf', 'red_document'],
  [documentsPage, '../../assets/certificates/sit240719190302r-rohs.pdf', 'rohs_document'],
  [documentsPage, '/contact/?product=gaming-headsets&inquiry=documents&reference=import-documents-guide', 'inquiry_form'],
  [micPage, '../../assets/downloads/gaming-headset-mic-recording-sheet.txt', 'mic_recording_sheet'],
  [packingPage, '../../assets/downloads/gaming-headset-packing-review-sheet.txt', 'packing_review_sheet'],
  ['/sample-request/', '../assets/downloads/gaming-headset-mic-recording-sheet.txt', 'mic_recording_sheet'],
  [micPage, '/gaming-headsets/g938-wireless/', 'model_details'],
  [packingPage, '/sample-request/', 'sample_guide'],
  [micPage, '/contact/?product=gaming-headsets&reference=mic-comparison-guide&message=private-text#inquiry-form', 'inquiry_form']
];
for (const [path, href, type] of resourceCases) {
  const run = scenario('granted', false, `https://talrivo.com${path}?utm_content=private-text`);
  run.click(href, '', false, true);
  assert.equal(run.events().length, 1, `${path}: ${href}`);
  const event = run.events()[0];
  assert.equal(event[1], 'buyer_resource_click');
  assert.equal(event[2].resource_type, type);
  assert.equal(event[2].page_path, path);
  assert.equal(event[2].destination_path, new URL(href, `https://talrivo.com${path}`).pathname);
  assert.deepEqual(Object.keys(event[2]).sort(), ['destination_path', 'page_path', 'resource_type']);
  assert.doesNotMatch(JSON.stringify(event), /private-|message=|utm_|generate_lead/);
  run.values.set('talrivoAnalyticsConsent', 'denied');
  run.click(href, '', false, true);
  assert.equal(run.events().length, 1, 'withdrawal stops resource events');
  for (const consent of [null, 'denied']) {
    const denied = scenario(consent, false, `https://talrivo.com${path}`);
    denied.click(href, '', false, true);
    assert.equal(denied.events().length, 0);
  }
}
const exclusions = scenario('granted', false, `https://talrivo.com${micPage}`);
for (const href of [
  'https://example.com/contact/', 'https://talrivo.com.example.org/contact/',
  'https://[', 'javascript:void(0)', 'data:text/plain,test', '#unrelated',
  '/insights/gaming-headset-microphone-performance/#packing-checklist-other',
  '/assets/downloads/unrelated.txt'
]) exclusions.click(href, '', false, true);
exclusions.click('/sample-request/', '.site-header');
assert.equal(exclusions.events().length, 0, 'ignore unrelated, external, invalid and navigation links');
const otherPage = scenario('granted', false, 'https://talrivo.com/');
otherPage.click('/sample-request/', '', false, true);
assert.equal(otherPage.events().length, 0, 'resource tracking stays scoped to the buyer pages');
const blockedResource = scenario(null, true, `https://talrivo.com${micPage}`);
blockedResource.click('#quick-mic-test', '', false, true);
assert.equal(blockedResource.events().length, 0);
console.log('Contact and buyer-resource action checks passed: consent, withdrawal, scoped paths, downloads, contact channels, no private payloads and no lead event.');
