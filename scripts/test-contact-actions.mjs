import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync('analytics.js', 'utf8');
function scenario(consent, blocked = false) {
  const values = new Map(consent ? [['talrivoAnalyticsConsent', consent]] : []);
  const handlers = new Map();
  const node = () => ({ addEventListener() {}, remove() {}, setAttribute() {} });
  const document = {
    readyState: 'complete', referrer: '',
    head: { appendChild() {} }, body: { appendChild() {} },
    querySelector: () => null, createElement: node,
    addEventListener: (event, callback) => handlers.set(event, callback)
  };
  const window = {
    location: new URL('https://talrivo.com/contact/?utm_content=private-text'),
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return values.get(key) ?? null; },
      setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)
    }
  };
  vm.runInNewContext(code, { window, document, URLSearchParams, Date });
  const click = (href, region = '', wechat = false) => {
    const target = {
      getAttribute: key => key === 'href' ? href : null,
      hasAttribute: key => key === 'data-open-wechat' && wechat,
      closest: selector => selector === 'a[href], [data-open-wechat]' ? target : selector === region ? {} : null
    };
    handlers.get('click')({ target });
  };
  const events = () => window.dataLayer.filter(args => args[0] === 'event');
  return { values, click, events };
}
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
console.log('Contact action checks passed: consent, withdrawal, three channels, no private payloads, no lead event and blocked storage.');
