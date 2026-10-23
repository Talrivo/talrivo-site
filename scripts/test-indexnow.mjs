import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { KEY_FILE, ORIGIN, PRIORITY_URLS, changedPageUrls, createPlan, parseArgs, sitemapPages, submitPlan } from './notify-indexnow.mjs';

const xml = urls => `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
const pages = sitemapPages(xml(PRIORITY_URLS));
assert.equal(pages.get('index.html'), `${ORIGIN}/`);
assert.throws(() => sitemapPages(xml(['https://example.com/'])), /plain talrivo/);
assert.throws(() => sitemapPages(xml([`${ORIGIN}/?email=private`])), /plain talrivo/);
assert.throws(() => sitemapPages(xml([`${ORIGIN}/#fragment`])), /plain talrivo/);
assert.throws(() => sitemapPages('<urlset/>'), /No public pages/);
assert.deepEqual(changedPageUrls(['marketing/note.html', 'assets/photo.jpg', 'styles.css', 'README.md'], pages), []);
assert.deepEqual(changedPageUrls(['gaming-headsets/index.html', 'gaming-headsets/index.html'], pages), [`${ORIGIN}/gaming-headsets/`]);
const previous = sitemapPages(xml([`${ORIGIN}/old-page/`]));
assert.deepEqual(changedPageUrls(['old-page/index.html'], pages, previous), [`${ORIGIN}/old-page/`]);
assert.deepEqual(changedPageUrls([], pages, previous, true), [...PRIORITY_URLS].sort());
assert.equal(parseArgs(['--bootstrap']).submit, false, 'Preview must be the default');
assert.throws(() => parseArgs(['--before', 'HEAD^']), /full commit SHA/);
assert.throws(() => parseArgs(['--submit']), /Supply a commit range/);
assert.throws(() => parseArgs(['--bootstrap', '--unknown']), /Unknown argument/);

const root = mkdtempSync(join(tmpdir(), 'talrivo-indexnow-'));
try {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const commit = () => {
    git(['add', '.']);
    git(['-c', 'user.name=Offline Test', '-c', 'user.email=offline@example.invalid', 'commit', '-qm', 'fixture']);
    return git(['rev-parse', 'HEAD']);
  };
  git(['init', '-q']);
  writeFileSync(join(root, 'sitemap.xml'), xml(PRIORITY_URLS));
  writeFileSync(join(root, 'index.html'), '<h1>Before</h1>');
  const before = commit();
  writeFileSync(join(root, KEY_FILE), KEY_FILE.slice(0, -4));
  const enabled = commit();
  assert.deepEqual(createPlan({ before, after: enabled }, root).urlList, [...PRIORITY_URLS].sort());
  mkdirSync(join(root, 'gaming-headsets'));
  writeFileSync(join(root, 'gaming-headsets/index.html'), '<h1>New category</h1>');
  const added = commit();
  writeFileSync(join(root, 'index.html'), '<h1>After two commits</h1>');
  const after = commit();
  assert.deepEqual(createPlan({ before: enabled, after }, root).urlList,
    [`${ORIGIN}/`, `${ORIGIN}/gaming-headsets/`], 'Use the whole push range, not just the last commit');
  assert.deepEqual(createPlan({ before: added, after }, root).urlList, [`${ORIGIN}/`]);
  assert.equal(createPlan({ bootstrap: true }, root).urlList.length, 5);
} finally { rmSync(root, { recursive: true, force: true }); }

const plan = {
  host: 'talrivo.com', key: KEY_FILE.slice(0, -4), keyLocation: `${ORIGIN}/${KEY_FILE}`,
  urlList: [`${ORIGIN}/gaming-headsets/`],
};
const calls = [];
const reply = (status, text = '') => ({ status, text: async () => text });
const fetchImpl = async (url, options = {}) => {
  calls.push({ url, options });
  return options.method === 'POST' ? reply(200) : reply(200, `${plan.key}\n`);
};
assert.equal((await submitPlan(plan, { fetchImpl })).status, 'received');
assert.equal(calls.length, 2);
assert.equal(calls[0].options.redirect, 'error');
assert.equal(calls[1].url, 'https://api.indexnow.org/indexnow');
assert.deepEqual(JSON.parse(calls[1].options.body), plan);
const sleeps = [];
let posts = 0;
const pending = await submitPlan(plan, {
  fetchImpl: async (_url, options = {}) => options.method !== 'POST' ? reply(200, plan.key) : reply(++posts === 1 ? 503 : 202),
  sleep: async ms => sleeps.push(ms),
});
assert.equal(pending.status, 'verification-pending');
assert.deepEqual(sleeps, [2000]);
let wrongKeyCalls = 0;
await assert.rejects(submitPlan(plan, {
  fetchImpl: async (_url, options = {}) => {
    wrongKeyCalls++;
    assert.notEqual(options.method, 'POST', 'Never notify before the deployed key is verified');
    return reply(200, 'wrong-key');
  }, sleep: async () => {},
}), /no notification was sent/);
assert.equal(wrongKeyCalls, 3);
let rejectedPosts = 0;
await assert.rejects(submitPlan(plan, {
  fetchImpl: async (_url, options = {}) => {
    if (options.method !== 'POST') return reply(200, plan.key);
    rejectedPosts++;
    return reply(400);
  }, sleep: async () => { throw new Error('Do not retry a bad request'); },
}), /HTTP 400/);
assert.equal(rejectedPosts, 1);
let throttledPosts = 0;
await assert.rejects(submitPlan(plan, {
  fetchImpl: async (_url, options = {}) => {
    if (options.method !== 'POST') return reply(200, plan.key);
    throttledPosts++;
    return reply(429);
  }, sleep: async () => {},
}), /HTTP 429/);
assert.equal(throttledPosts, 3);
await assert.rejects(submitPlan({ ...plan, urlList: ['https://example.com/private'] }, {
  fetchImpl: async () => { throw new Error('Should not fetch'); },
}), /Refusing/);
assert.equal((await submitPlan({ ...plan, urlList: [] }, {
  fetchImpl: async () => { throw new Error('Should not fetch'); },
})).status, 'skipped');
assert.equal(readFileSync(KEY_FILE, 'utf8').trim(), plan.key);
const workflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
assert.ok(workflow.indexOf('name: Notify IndexNow') > workflow.indexOf('name: Deploy Pages'));
assert.match(workflow, /fetch-depth: 0/);
assert.match(workflow, /if: github.event_name == 'push' && github.ref == 'refs\/heads\/main'/);
assert.match(workflow, /BEFORE_SHA: \$\{\{ github.event.before \}\}/);
assert.match(workflow, /continue-on-error: true/);
assert.match(workflow, /steps.indexnow.outcome == 'failure'/);
console.log('IndexNow offline checks passed: scoped URLs, five-page bootstrap, multi-commit ranges, preview default, key verification, retries and receipt semantics.');
