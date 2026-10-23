import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ORIGIN = 'https://talrivo.com';
export const KEY_FILE = 'f5182150f1b9a1ed595a6494a1a45a0c.txt';
export const PRIORITY_URLS = [
  `${ORIGIN}/`,
  `${ORIGIN}/gaming-headsets/`,
  `${ORIGIN}/wireless-gaming-headsets/`,
  `${ORIGIN}/insights/gaming-headset-usb-audio-or-lighting/`,
  `${ORIGIN}/insights/gaming-headset-microphone-performance/`,
];
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export function sitemapPages(xml) {
  const pages = new Map();
  for (const [, value] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(value.trim());
    if (url.origin !== ORIGIN || url.username || url.password || url.search || url.hash) {
      throw new Error('IndexNow sitemap URL must be a plain talrivo.com HTTPS URL.');
    }
    if (!url.pathname.endsWith('/')) throw new Error('Expected canonical directory page URL.');
    const file = `${decodeURIComponent(url.pathname).slice(1)}index.html`;
    if (file.split('/').some(part => part === '..' || part.startsWith('.'))) {
      throw new Error('Unsafe sitemap page path.');
    }
    pages.set(file, url.href);
  }
  if (!pages.size) throw new Error('No public pages found in sitemap.');
  return pages;
}

export function changedPageUrls(files, current, previous = new Map(), bootstrap = false) {
  const urls = new Set();
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const url = current.get(file) || previous.get(file);
    if (url) urls.add(url);
  }
  if (bootstrap) {
    const published = new Set(current.values());
    for (const url of PRIORITY_URLS) if (published.has(url)) urls.add(url);
  }
  return [...urls].sort();
}

export function parseArgs(args) {
  const options = { submit: false, bootstrap: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--submit') options.submit = true;
    else if (arg === '--bootstrap') options.bootstrap = true;
    else if (arg === '--before' || arg === '--after') {
      const value = args[++index];
      if (!/^[a-f0-9]{40,64}$/.test(value || '')) throw new Error(`${arg} requires a full commit SHA.`);
      options[arg.slice(2)] = value;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!!options.before !== !!options.after) throw new Error('Supply both --before and --after.');
  if (!options.before && !options.bootstrap) throw new Error('Supply a commit range or --bootstrap. Default mode is preview only.');
  return options;
}

export function createPlan(options, root = process.cwd()) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const key = readFileSync(resolve(root, KEY_FILE), 'utf8').trim();
  if (key !== KEY_FILE.slice(0, -4) || !/^[a-f0-9]{32}$/.test(key)) throw new Error('Invalid IndexNow key file.');
  const current = sitemapPages(readFileSync(resolve(root, 'sitemap.xml'), 'utf8'));
  let previous = new Map();
  let files = [];
  let bootstrap = options.bootstrap;
  if (options.before) {
    // GitHub's first push has no previous commit. Do not expand this to all URLs.
    if (/^0+$/.test(options.before)) bootstrap = true;
    else {
      previous = sitemapPages(git(['show', `${options.before}:sitemap.xml`]));
      files = git(['diff', '--name-only', '-z', '--no-renames', options.before, options.after, '--'])
        .split('\0').filter(Boolean);
      bootstrap ||= files.includes(KEY_FILE);
    }
  }
  return {
    host: 'talrivo.com', key, keyLocation: `${ORIGIN}/${KEY_FILE}`,
    urlList: changedPageUrls(files, current, previous, bootstrap),
  };
}

export async function submitPlan(plan, {
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  if (!plan.urlList.length) return { status: 'skipped', count: 0 };
  const keyLocation = `${ORIGIN}/${KEY_FILE}`;
  if (plan.host !== 'talrivo.com' || plan.keyLocation !== keyLocation || plan.key !== KEY_FILE.slice(0, -4)) {
    throw new Error('Unexpected IndexNow host or key configuration.');
  }
  for (const value of plan.urlList) {
    const url = new URL(value);
    if (url.origin !== ORIGIN || url.username || url.password || url.search || url.hash) {
      throw new Error('Refusing a non-public or non-canonical URL.');
    }
  }
  // Verify the deployed key before sending any URL to the search engine.
  let verified = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(keyLocation, {
        cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      verified = response.status === 200 && (await response.text()).trim() === plan.key;
    } catch { verified = false; }
    if (verified) break;
    if (attempt < 2) await sleep(2000 * (attempt + 1));
  }
  if (!verified) throw new Error('Published key is unavailable or mismatched; no notification was sent.');
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(plan),
    });
    if (response.status === 200 || response.status === 202) {
      return {
        status: response.status === 200 ? 'received' : 'verification-pending',
        httpStatus: response.status, count: plan.urlList.length,
        note: 'Notification only. This does not confirm crawling, indexing, citations or clicks.',
      };
    }
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    throw new Error(`IndexNow HTTP ${response.status}; indexing was not confirmed.`);
  }
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const plan = createPlan(options);
  console.log(JSON.stringify({ mode: options.submit ? 'submit' : 'preview', urls: plan.urlList }, null, 2));
  if (!options.submit) return;
  console.log(JSON.stringify(await submitPlan(plan)));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
