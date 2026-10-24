import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const CHECKS = [
  { id: 'canonical_home', url: 'https://talrivo.com/' },
  { id: 'www_https_home', url: 'https://www.talrivo.com/', redirectTo: 'https://talrivo.com/' },
  { id: 'www_https_product_path', url: 'https://www.talrivo.com/wireless-gaming-headsets/', redirectTo: 'https://talrivo.com/wireless-gaming-headsets/' },
  { id: 'www_http_home', url: 'http://www.talrivo.com/', redirectTo: 'https://talrivo.com/' },
];

const certificateErrors = new Set([
  'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
]);

function errorCode(error) {
  for (let depth = 0; error && depth < 6; depth++, error = error.cause) {
    if (typeof error.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code)) return error.code;
    if (error.name === 'AbortError' || error.name === 'TimeoutError') return 'REQUEST_TIMEOUT';
  }
  return 'UNKNOWN_NETWORK_ERROR';
}

export async function checkLiveSite({ fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new Error('Live checks require a timeout between 1 and 30000 ms.');
  }
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    throw new Error('Refusing a live HTTPS check with certificate validation disabled.');
  }
  const checks = [];
  for (const check of CHECKS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(check.url, {
        method: 'HEAD', redirect: 'manual', credentials: 'omit', cache: 'no-store',
        signal: controller.signal,
      });
      if (!check.redirectTo) {
        checks.push({ id: check.id, url: check.url, status: response.status === 200 ? 'pass' : 'fail',
          httpStatus: response.status, reason: response.status === 200 ? 'Canonical homepage reachable.' : 'Expected HTTP 200 from the canonical homepage.' });
        continue;
      }
      const location = response.headers.get('location');
      let destination = null;
      try { destination = location ? new URL(location, check.url).href : null; } catch { /* Invalid redirect remains a failure. */ }
      const valid = [301, 308].includes(response.status) && destination === check.redirectTo;
      checks.push({ id: check.id, url: check.url, status: valid ? 'pass' : 'fail',
        httpStatus: response.status, expectedRedirect: check.redirectTo,
        reason: valid ? 'Permanent redirect preserves the canonical path.' : 'Expected a permanent redirect to the matching canonical URL.' });
    } catch (error) {
      const code = errorCode(error);
      checks.push({ id: check.id, url: check.url, status: certificateErrors.has(code) ? 'fail' : 'unverified', code,
        reason: certificateErrors.has(code) ? 'TLS certificate or hostname verification failed.' : 'Network or timeout prevented verification; downtime is not established.' });
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    ok: checks.every(check => check.status === 'pass'), checks,
    note: 'Read-only connection checks. No DNS or certificate setting was changed. This is not an indexing, CTR or traffic measurement.',
  };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length) throw new Error('This check accepts no arguments or insecure overrides.');
  const result = await checkLiveSite();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
