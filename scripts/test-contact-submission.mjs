import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync('contact-form.js', 'utf8');
const create = (mode, search = '', storedSource = null, consent = null) => {
  const nodes = new Map();
  const calls = [];
  const events = [];
  let submit;
  let resets = 0;
  const node = selector => {
    if (!nodes.has(selector)) {
      const classes = new Set();
      nodes.set(selector, {
        value: '', textContent: '', disabled: false, hidden: true, handlers: {},
        classList: { add: (...x) => x.forEach(v => classes.add(v)), remove: (...x) => x.forEach(v => classes.delete(v)), contains: x => classes.has(x) },
        querySelector: node,
        addEventListener: (type, handler) => { nodes.get(selector).handlers[type] = handler; if (type === 'submit') submit = handler; },
        reset: () => { resets++; },
        action: 'https://example.invalid/submit'
      });
    }
    return nodes.get(selector);
  };
  class Fields extends Map {
    constructor() { super([
      ['message', 'Video 00:25 - sample question'], ['product', node('select[name="product"]').value || 'Gaming Headset Collection'],
      ['product_reference', node('#contact-product-reference').value],
      ['observed_source', node('#contact-observed-source').value],
      ['source_evidence', node('#contact-source-evidence').value],
      ['source_recorded_at', node('#contact-source-recorded-at').value],
      ['source_landing_path', node('#contact-source-landing-path').value],
      ['discovery_source', node('select[name="discovery_source"]').value]
    ]); }
  }
  const window = {
    location: { search, href: 'https://example.invalid/contact/' + search },
    localStorage: { getItem: key => key === 'talrivoAnalyticsConsent' ? consent : key === 'talrivoInquirySource' && storedSource ? JSON.stringify(storedSource) : null, setItem() {} },
    setTimeout: (fn) => setTimeout(fn, 10), clearTimeout,
    gtag: () => { if (mode === 'tracking') throw new Error('Tracking failed'); },
    dispatchEvent: event => events.push(event)
  };
  vm.runInNewContext(code, {
    document: { querySelector: node, referrer: '', title: 'Test' },
    window, URLSearchParams, AbortController, FormData: Fields,
    CustomEvent: class { constructor(type, detail) { this.type = type; this.detail = detail; } },
    fetch: async (url, options) => {
      calls.push(options.body);
      if (mode === 'timeout') return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('Aborted'))));
      await Promise.resolve();
      if (mode === 'network') throw new Error('Offline');
      return { ok: mode !== 'http', json: async () => {
        if (mode === 'json') throw new Error('Invalid JSON');
        return { success: mode === 'rejected' ? false : mode === 'string' ? 'true' : true };
      }};
    }
  });
  return { node, calls, events, submit: () => submit({ preventDefault() {} }), resets: () => resets };
};

for (const mode of ['success', 'http', 'rejected', 'string', 'json', 'network', 'timeout', 'tracking']) {
  const test = create(mode);
  const first = test.submit();
  assert.equal(test.node('button[type="submit"]').textContent, 'Sending inquiry…', mode + ': pending label');
  assert.equal(test.node('#inquiry-recovery').hidden, true);
  await test.submit();
  await first;
  const accepted = mode === 'success' || mode === 'tracking';
  assert.equal(test.calls.length, 1, mode + ': duplicate');
  assert.equal(test.resets(), accepted ? 1 : 0, mode + ': retained fields');
  assert.equal(test.node('#form-status').classList.contains('success'), accepted);
  assert.equal(test.node('button[type="submit"]').disabled, false);
  assert.equal(test.events.length, mode === 'success' ? 1 : 0);
  assert.equal(test.node('button[type="submit"]').textContent, 'Send Product Inquiry', mode + ': restored label');
  assert.equal(test.node('#inquiry-recovery').hidden, accepted, mode + ': failure alternatives only');
  assert(test.calls[0].get('message').includes('Video 00:25'));
  if (!accepted) {
    await test.submit();
    assert.equal(test.calls.length, 2, mode + ': retry available');
  }
}
const redirected = create('success', '?sent=1');
assert.equal(redirected.node('#form-status').classList.contains('success'), false);
assert.equal(redirected.events.length, 0);
for (const [reference, expectedPath] of [
  ['mic-comparison-guide', '/insights/gaming-headset-microphone-performance/'],
  ['packing-checklist', '/insights/gaming-headset-packaging-accessories-checklist/'],
  ['import-documents-guide', '/insights/gaming-headset-import-documents-checklist/']
]) {
  const guide = create('success', `?product=gaming-headsets&inquiry=quick-question&reference=${reference}`);
  assert.equal(guide.calls.length, 0, 'opening a guide reference never submits a form');
  await guide.submit();
  assert.ok(guide.calls[0].get('product_reference').includes(expectedPath));
  assert.ok(guide.calls[0].get('message').includes(`https://talrivo.com${expectedPath}`), 'retain article context in the submitted message');
  assert.ok(guide.calls[0].get('message').includes('Video 00:25 - sample question'), 'never overwrite the buyer message');
}
console.log('Submission regression checks passed: success, HTTP failure, rejection, invalid success value, JSON failure, offline, timeout, tracking failure, duplicate prevention, retry, and unverified redirect.');


for (const reference of ['g946-headset-only', 'g946-wireless-charging-dock']) {
  const changed = create('success', `?product=g946&inquiry=sample&reference=${reference}`);
  changed.node('select[name="product"]').value = 'G938 Wireless Gaming Headset';
  // Submission refreshes context even if a browser never dispatched change.
  await changed.submit();
  assert.equal(changed.calls[0].get('product'), 'G938 Wireless Gaming Headset');
  assert.equal(changed.calls[0].get('product_reference'), '');
  assert.match(changed.calls[0].get('message'), /Product \/ video reference: Not specified/);
  assert.ok(changed.calls[0].get('message').includes('Video 00:25 - sample question'));
}
const contactHtml = fs.readFileSync('contact/index.html', 'utf8');
const recovery = contactHtml.match(/<div class="inquiry-recovery"[\s\S]*?<\/div>\s*<\/div>/)?.[0];
assert.ok(recovery?.includes('data-nosnippet hidden'), 'Keep failure-only guidance hidden until needed');
assert.match(recovery, /mailto:sales@talrivo.com/);
assert.match(recovery, /https:\/\/wa\.me\/8613824276001/);
assert.doesNotMatch(recovery, /body=|name=|email=/, 'Recovery links must not embed buyer fields');
console.log('Recovery checks passed: pending label, failure-only alternatives and accurate changed-model submission.');

const shortlisted = create('success', '?product=gaming-headsets&inquiry=compare&reference=model-shortlist&models=g946&models=g938');
await shortlisted.submit();
assert.ok(shortlisted.calls[0].get('product_reference').includes('Requested wireless models: G946, G938'));
assert.ok(shortlisted.calls[0].get('product_reference').includes('G946 package to confirm'));
console.log('Shortlisted model reference is retained in the isolated outgoing form fields.');

const sourceHint = {latestSourceTouch: {
  channel:'perplexity', evidence:'external_referrer', landingPath:'/gaming-headsets/', recordedAt:new Date().toISOString()
}};
const attributed = create('success', '?product=g946&inquiry=sample', sourceHint, 'granted');
attributed.node('select[name="discovery_source"]').value = 'ChatGPT';
assert.equal(attributed.calls.length, 0, 'Source selection never sends an inquiry by itself');
await attributed.submit();
const outgoing = attributed.calls[0];
assert.equal(outgoing.get('observed_source'), 'perplexity');
assert.equal(outgoing.get('discovery_source'), 'ChatGPT');
assert.match(outgoing.get('message'), /Last observed source hint \(30-day window\): perplexity/);
assert.match(outgoing.get('message'), /How the buyer found TALRIVO \(self-reported\): ChatGPT/);
assert.match(outgoing.get('message'), /Video 00:25 - sample question/);
const noConsentSource = create('success', '', sourceHint, 'denied');
noConsentSource.node('select[name="discovery_source"]').value = 'ChatGPT';
await noConsentSource.submit();
assert.equal(noConsentSource.calls[0].get('observed_source'), 'unknown');
assert.equal(noConsentSource.calls[0].get('discovery_source'), 'ChatGPT', 'A deliberate inquiry answer is distinct from analytics storage');
console.log('Inquiry source submission checks passed: observed hints and voluntary answers remain distinct in the isolated outgoing fields and message.');

// Execute the actual homepage attribution functions and submit handler in an
// isolated DOM/network fixture; the endpoint is never contacted.
const homeCode = fs.readFileSync('script.js', 'utf8');
const sourceFunctions = homeCode.slice(homeCode.indexOf('function getStoredSourceContext()'), homeCode.indexOf('function setProductInterest('));
const homeSubmitCode = homeCode.slice(homeCode.indexOf('let inquirySubmitting = false;'), homeCode.indexOf('if (contactDock) {', homeCode.indexOf('let inquirySubmitting = false;')));
async function checkHomeSource(consent, touch, blocked = false) {
  const sourceFields = Object.fromEntries(['pageUrl','pageTitle','referrer','firstLandingPage','firstReferrer','utmSource','utmMedium','utmCampaign','utmTerm','utmContent','selectedFrom','observedSource','sourceEvidence','sourceRecordedAt','sourceLandingPath'].map(key => [key,{value:''}]));
  let handler;
  const calls = [];
  const button = {disabled:false};
  const form = {dataset:{web3formsKey:'isolated-fixture-key'}, addEventListener:(type, fn)=>{handler=fn;}, querySelector:()=>button, reset() {}};
  const window = {location:new URL('https://talrivo.com/'),localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return key==='talrivoAnalyticsConsent'?consent:key==='talrivoInquirySource'?JSON.stringify({latestSourceTouch:touch}):null;}},setTimeout,clearTimeout};
  class HomeFields extends Map { constructor(){super([
    ['name','Test buyer'], ['email','test@example.invalid'],['product','G946'],['message','Keep my sample question'],['discovery_source','ChatGPT'],
    ...['observedSource','sourceEvidence','sourceRecordedAt','sourceLandingPath'].map(key=>[key.replace(/[A-Z]/g,c=>'_'+c.toLowerCase()),sourceFields[key].value])
  ]);} }
  const context = {form,sourceFields,sourceStorageKey:'talrivoInquirySource',window,document:{title:'TALRIVO',referrer:''},URLSearchParams,
    formStatus:{textContent:'',classList:{add(){},remove(){}}},mailbox:'sales@talrivo.com',FormData:HomeFields,AbortController,
    trackInquirySuccess(){},fetch:async(url,options)=>{calls.push(options.body);return{ok:true,json:async()=>({success:true})};}};
  vm.runInNewContext(sourceFunctions+'\npopulateSourceFields();\n'+homeSubmitCode,context);
  assert.equal(calls.length,0);
  await handler({preventDefault(){}});
  assert.equal(calls.length,1);
  const expected = consent==='granted'&&!blocked?'perplexity':'unknown';
  assert.equal(calls[0].get('observed_source'),expected);
  assert.equal(calls[0].get('discovery_source'),'ChatGPT');
  assert.match(calls[0].get('message'), /Keep my sample question/);
  assert.ok(calls[0].get('message').includes(`Last observed source hint (30-day window): ${expected}`));
}
for(const consent of [null,'denied','granted']) await checkHomeSource(consent,sourceHint.latestSourceTouch);
await checkHomeSource('granted',sourceHint.latestSourceTouch,true);
const homeHtml=fs.readFileSync('index.html','utf8');
assert.ok(homeHtml.includes('name="discovery_source"'));
assert.ok(homeHtml.indexOf('name="discovery_source"')>homeHtml.indexOf('<details class="rfq-optional-details">'));
console.log('Homepage RFQ source checks passed: actual source functions and isolated submit handler, consent denied/granted/blocked, separate voluntary answer and preserved buyer message.');
