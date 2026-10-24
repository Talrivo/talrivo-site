import assert from 'node:assert/strict';
import { CHECKS, checkLiveSite, main } from './check-live-site.mjs';

const response = (status, location) => ({ status, headers: new Headers(location ? { location } : {}) });
const calls = [];
const healthy = await checkLiveSite({ fetchImpl: async (url, options) => {
  calls.push({ url, options });
  const check = CHECKS.find(check => check.url === url);
  return check.redirectTo ? response(301, check.redirectTo) : response(200);
}});
assert.equal(healthy.ok, true);
assert.equal(calls.length, 4);
for (const { url, options } of calls) {
  assert.ok(['talrivo.com', 'www.talrivo.com'].includes(new URL(url).hostname));
  assert.equal(options.method, 'HEAD');
  assert.equal(options.redirect, 'manual');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.body, undefined);
  assert.equal(options.headers, undefined, 'Never send tokens, cookies or buyer information');
  assert.ok(options.signal instanceof AbortSignal);
}
const tlsFailure = await checkLiveSite({ fetchImpl: async url => {
  if (url.startsWith('https://www.')) {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error('Untrusted response'), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' }) });
  }
  return url.startsWith('http:') ? response(301, 'https://talrivo.com/') : response(200);
}});
assert.equal(tlsFailure.ok, false);
assert.deepEqual(tlsFailure.checks.map(check => check.status), ['pass', 'fail', 'fail', 'pass']);
assert.equal(tlsFailure.checks[1].code, 'ERR_TLS_CERT_ALTNAME_INVALID');
for (const location of [undefined, 'https://talrivo.com.evil.example/', 'http://talrivo.com/', '/', 'not a valid URL']) {
  const result = await checkLiveSite({ fetchImpl: async () => response(301, location) });
  assert.equal(result.ok, false);
  assert.equal(result.checks[1].status, 'fail');
}
const droppedPath = await checkLiveSite({ fetchImpl: async url => url === 'https://talrivo.com/'
  ? response(200) : response(301, 'https://talrivo.com/') });
assert.equal(droppedPath.checks[1].status, 'pass');
assert.equal(droppedPath.checks[2].status, 'fail', 'Do not silently drop the product path');
for (const status of [200, 302, 404, 503]) {
  const result = await checkLiveSite({ fetchImpl: async () => response(status, 'https://talrivo.com/') });
  assert.equal(result.checks[1].status, 'fail');
}
const networkFailure = await checkLiveSite({ fetchImpl: async () => {
  throw Object.assign(new Error('Offline'), { code: 'ECONNRESET' });
}});
assert.equal(networkFailure.ok, false);
assert.ok(networkFailure.checks.every(check => check.status === 'unverified'));
const timedOut = await checkLiveSite({ timeoutMs: 5, fetchImpl: async (url, options) =>
  new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true }))
});
assert.ok(timedOut.checks.every(check => check.status === 'unverified' && check.code === 'REQUEST_TIMEOUT'));
await assert.rejects(main(['--insecure']), /no arguments or insecure overrides/);
for (const timeoutMs of [0, -1, 30001, NaN]) {
  await assert.rejects(checkLiveSite({ timeoutMs, fetchImpl: async () => { throw Error('Must not request'); } }), /timeout/);
}
console.log('Live-site offline checks passed: strict TLS errors, manual permanent redirects, preserved paths, no credentials, bounded timeouts and unverified network failures.');
