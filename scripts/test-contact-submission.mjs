import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync('contact-form.js', 'utf8');
const create = (mode, search = '') => {
  const nodes = new Map();
  const calls = [];
  const events = [];
  let submit;
  let resets = 0;
  const node = selector => {
    if (!nodes.has(selector)) {
      const classes = new Set();
      nodes.set(selector, {
        value: '', textContent: '', disabled: false,
        classList: { add: (...x) => x.forEach(v => classes.add(v)), remove: (...x) => x.forEach(v => classes.delete(v)), contains: x => classes.has(x) },
        querySelector: node,
        addEventListener: (type, handler) => { if (type === 'submit') submit = handler; },
        reset: () => { resets++; },
        action: 'https://example.invalid/submit'
      });
    }
    return nodes.get(selector);
  };
  class Fields extends Map {
    constructor() { super([['message', 'Video 00:25 - sample question'], ['product', 'Gaming Headset Collection']]); }
  }
  const window = {
    location: { search, href: 'https://example.invalid/contact/' + search },
    localStorage: { getItem: () => null, setItem() {} },
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
  await test.submit();
  await first;
  const accepted = mode === 'success' || mode === 'tracking';
  assert.equal(test.calls.length, 1, mode + ': duplicate');
  assert.equal(test.resets(), accepted ? 1 : 0, mode + ': retained fields');
  assert.equal(test.node('#form-status').classList.contains('success'), accepted);
  assert.equal(test.node('button[type="submit"]').disabled, false);
  assert.equal(test.events.length, mode === 'success' ? 1 : 0);
  assert(test.calls[0].get('message').includes('Video 00:25'));
  if (!accepted) {
    await test.submit();
    assert.equal(test.calls.length, 2, mode + ': retry available');
  }
}
const redirected = create('success', '?sent=1');
assert.equal(redirected.node('#form-status').classList.contains('success'), false);
assert.equal(redirected.events.length, 0);
console.log('Submission regression checks passed: success, HTTP failure, rejection, invalid success value, JSON failure, offline, timeout, tracking failure, duplicate prevention, retry, and unverified redirect.');

