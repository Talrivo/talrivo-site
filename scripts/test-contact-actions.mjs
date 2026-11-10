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
      closest: selector => selector === 'a[href], [data-open-wechat], #sample-review-preview, #sample-review-download, #sample-review-print' ? target
        : selector === region || (selector === 'main' && inMain) ? {} : null
    };
    handlers.get('click')({ target });
  };
  const reviewAction = (id, {insideTool = true, fieldsetDisabled = false, disabled = false} = {}) => {
    const target = {id, disabled, getAttribute: () => null, hasAttribute: () => false,
      closest: selector => selector.includes('a[href]') ? target
        : selector === '#sample-review-tool' && insideTool ? {}
        : selector === 'fieldset[disabled]' && fieldsetDisabled ? {} : null};
    handlers.get('click')({target});
  };
  const events = () => window.dataLayer.filter(args => args[0] === 'event');
  return { values, click, reviewAction, events, rendered };
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
  ['/insights/evaluate-gaming-headset-sample-before-bulk-order/', '../../assets/downloads/wireless-gaming-headset-sample-review.txt', 'sample_review_sheet'],
  ['/insights/evaluate-gaming-headset-sample-before-bulk-order/', '#review-worksheet', 'sample_worksheet'],
  ['/insights/evaluate-gaming-headset-sample-before-bulk-order/', '#sample-review-tool', 'sample_worksheet'],
  ['/insights/choose-2-4g-wireless-gaming-headset/', '../../assets/downloads/wireless-gaming-headset-sample-review.txt', 'sample_review_sheet'],
  ['/insights/choose-2-4g-wireless-gaming-headset/', '#receiver-checks', 'receiver_checklist'],
  ['/insights/2-4g-vs-bluetooth-gaming-headsets-importers/', '../../assets/downloads/wireless-gaming-headset-sample-review.txt', 'sample_review_sheet'],
  ['/insights/2-4g-vs-bluetooth-gaming-headsets-importers/', '#connection-comparison', 'connection_comparison'],
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


// Check procurement entry points, without joining them to search impressions.
for (const path of ['/gaming-headsets/', '/wireless-gaming-headsets/', '/wired-gaming-headsets/', '/product-comparison/',
  '/gaming-headsets/g926-wireless/', '/gaming-headsets/g940-low-latency/', '/gaming-headsets/g935-wireless/', '/gaming-headsets/g936-lightweight/', '/gaming-headsets/g938-wireless/',
  '/gaming-headsets/g941-tri-mode-anc/', '/gaming-headsets/g946-rgb/', '/gaming-headsets/g947-foldable/']) {
  for (const [href,type] of [
    ['/insights/evaluate-gaming-headset-sample-before-bulk-order/?model=g946#sample-review-tool','sample_review_guide'],
    ['/product-comparison/','model_comparison'],
    ['/contact/?product=g946&reference=g946-headset-only&private=buyer-note','inquiry_form']
  ]) {
    const run=scenario('granted',false,`https://talrivo.com${path}?private=buyer-note`);
    run.click(href,'',false,true);
    if (path === '/product-comparison/' && href === '/product-comparison/') {
      assert.equal(run.events().length,0); continue;
    }
    assert.equal(run.events().length,1,`${path} -> ${href}`);
    assert.equal(run.events()[0][2].resource_type,type);
    assert.doesNotMatch(JSON.stringify(run.events()),/private|buyer-note|reference=|generate_lead/);
    run.values.set('talrivoAnalyticsConsent','denied');
    run.click(href,'',false,true);
    assert.equal(run.events().length,1);
  }
}
const reviewPath='/insights/evaluate-gaming-headset-sample-before-bulk-order/';
for (const consent of [null,'denied','granted']) {
  const run=scenario(consent,false,`https://talrivo.com${reviewPath}?model=g946&private=buyer-note`);
  for (const id of ['sample-review-preview','sample-review-download','sample-review-print']) run.reviewAction(id);
  assert.equal(run.events().length,consent==='granted'?3:0);
  if (consent==='granted') {
    assert.deepEqual(Array.from(run.events(),e=>e[2].review_action),['preview_request','download_request','print_request']);
    for (const event of run.events()) {
      assert.equal(event[1],'sample_review_action');
      assert.deepEqual(Object.keys(event[2]).sort(),['page_path','review_action']);
      assert.doesNotMatch(JSON.stringify(event),/buyer-note|private|model=|generate_lead/);
    }
    run.values.set('talrivoAnalyticsConsent','denied');
    run.reviewAction('sample-review-download');
    assert.equal(run.events().length,3);
  }
}
for (const opts of [{insideTool:false},{fieldsetDisabled:true},{disabled:true}]) {
  const run=scenario('granted',false,`https://talrivo.com${reviewPath}`);
  run.reviewAction('sample-review-download',opts);
  assert.equal(run.events().length,0);
}
const wrongToolPage=scenario('granted',false,'https://talrivo.com/contact/');
wrongToolPage.reviewAction('sample-review-download');
assert.equal(wrongToolPage.events().length,0);
const blockedTool=scenario('granted',true,`https://talrivo.com${reviewPath}`);
blockedTool.reviewAction('sample-review-download');
assert.equal(blockedTool.events().length,0);
console.log('Procurement measurement checks passed: scoped product entries, tool action requests, no disabled-tool events, consent withdrawal and fixed non-personal payloads.');

// Every explicitly measured product route must be a real public page.
const productRoutes=code.match(/const productPages = \[([\s\S]*?)\];/)[1];
for (const [,path] of productRoutes.matchAll(/"([^" ]+)"/g)) {
  assert.ok(readFileSync(`.${path}index.html`,'utf8').includes('<main'),path);
}
for (const consent of [null,'denied']) {
  const run=scenario(consent,false,'https://talrivo.com/gaming-headsets/g946-rgb/');
  run.click('/contact/?product=g946','',false,true);
  assert.equal(run.events().length,0);
}
