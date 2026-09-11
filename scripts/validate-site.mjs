import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const forbiddenProductFields = new Set(['offers', 'review', 'aggregateRating', 'price', 'priceCurrency']);

function walk(directory, predicate) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, predicate);
    return predicate(path) ? [path] : [];
  });
}

function productNodes(value) {
  if (!value || typeof value !== 'object') return [];
  const current = value['@type'] === 'Product' ? [value] : [];
  return current.concat(...Object.values(value).flatMap(productNodes));
}

function pageFile(pagePath) {
  return join(root, pagePath.replace(/^\//, ''), 'index.html');
}

function validateJsonLd() {
  for (const file of walk(root, (path) => path.endsWith('.html') && !path.includes('/public/'))) {
    const html = readFileSync(file, 'utf8');
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
    for (const [index, script] of scripts.entries()) {
      let data;
      try {
        data = JSON.parse(script[1]);
      } catch (error) {
        errors.push(`${relative(root, file)} JSON-LD block ${index + 1} cannot be parsed: ${error.message}`);
        continue;
      }
      for (const product of productNodes(data)) {
        for (const field of Object.keys(product)) {
          if (forbiddenProductFields.has(field)) {
            errors.push(`${relative(root, file)} Product JSON-LD includes forbidden field: ${field}`);
          }
        }
      }
    }
  }
}

function validateRegistry() {
  const contentDirectory = join(root, 'content/products');
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const llms = readFileSync(join(root, 'llms.txt'), 'utf8');

  for (const file of readdirSync(contentDirectory).filter((name) => name.endsWith('.json'))) {
    const product = JSON.parse(readFileSync(join(contentDirectory, file), 'utf8'));
    const page = pageFile(product.page);
    const canonical = `https://talrivo.com${product.page}`;

    for (const field of ['model', 'status', 'page', 'title', 'specifications', 'assets']) {
      if (!product[field] || (Array.isArray(product[field]) && product[field].length === 0)) {
        errors.push(`content/products/${file} is missing ${field}`);
      }
    }
    if (!existsSync(page)) {
      errors.push(`content/products/${file} points to a missing page: ${product.page}`);
      continue;
    }
    const html = readFileSync(page, 'utf8');
    if (!html.includes(canonical)) errors.push(`${relative(root, page)} is missing canonical ${canonical}`);
    if (!sitemap.includes(canonical)) errors.push(`sitemap.xml is missing ${canonical}`);
    if (!llms.includes(canonical)) warnings.push(`llms.txt does not currently link to ${canonical}`);
    for (const asset of product.assets) {
      if (!existsSync(join(root, asset))) errors.push(`content/products/${file} references missing asset: ${asset}`);
    }
  }
}

function validateSitemap() {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>https:\/\/talrivo\.com(.*?)<\/loc>/g)].map((match) => match[1]);

  for (const pagePath of urls) {
    const page = pageFile(pagePath);
    if (!existsSync(page)) {
      errors.push(`sitemap.xml points to a missing page: ${pagePath}`);
      continue;
    }

    const html = readFileSync(page, 'utf8');
    if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) {
      errors.push(`sitemap.xml includes a noindex page: ${pagePath}`);
    }
  }
}

function validateConfirmedProductFacts() {
  const script = readFileSync(join(root, 'script.js'), 'utf8');
  const expected = [
    ['G938 modal driver', /"G938-wireless"[\s\S]*?\["Driver", "53 mm"\][\s\S]*?"G935-wireless"/],
    ['G941 modal driver', /"G941-wireless"[\s\S]*?\["Driver", "50 mm"\][\s\S]*?"G940-wireless"/],
    ['B9 modal battery', /"B9-bluetooth"[\s\S]*?\["Battery", "300 mAh"\][\s\S]*?"B10-bluetooth"/],
    ['B9 modal charging time', /"B9-bluetooth"[\s\S]*?\["Charging time", "2 hours"\][\s\S]*?"B10-bluetooth"/]
  ];

  for (const [label, pattern] of expected) {
    if (!pattern.test(script)) errors.push(`script.js is missing confirmed ${label}`);
  }
  if (!script.includes('new Set(["wireless", "wired", "bluetooth"])')) {
    errors.push('script.js homepage catalogue is not limited to headset categories');
  }
}

function validateContactTracking() {
  const analytics = readFileSync(join(root, 'analytics.js'), 'utf8');
  const contact = readFileSync(join(root, 'contact-form.js'), 'utf8');
  const sentBlock = contact.match(/if \(params\.get\("sent"\) === "1"\) \{([\s\S]*?)\n  \}/)?.[1] || '';

  if (sentBlock.includes('trackInquirySuccess')) {
    errors.push('contact-form.js records a lead from the sent=1 display state');
  }
  if (!contact.includes('"quick-question": "Quick product question"')) {
    errors.push('contact-form.js does not map the quick-question inquiry type');
  }
  if (!contact.includes('storedSource.utmSource')) {
    errors.push('contact-form.js does not restore stored UTM attribution');
  }
  if (!analytics.includes('captureInquirySource')) {
    errors.push('analytics.js does not capture consented inquiry attribution');
  }
  const homepage = readFileSync(join(root, 'script.js'), 'utf8');
  if (homepage.includes('window.localStorage.setItem(sourceStorageKey')) {
    errors.push('script.js writes inquiry attribution outside the consent-controlled analytics flow');
  }
  if (!homepage.includes('storedSource[storedKey]')) {
    errors.push('script.js does not restore stored UTM attribution for the homepage form');
  }
}

function validateSharedHeadAssets() {
  for (const file of walk(root, (path) => path.endsWith('.html') && !path.includes('/public/') && !path.includes('/admin/'))) {
    const html = readFileSync(file, 'utf8');
    if (!/<link\s+rel="icon"[^>]+talrivo-mark\.svg/i.test(html)) {
      errors.push(`${relative(root, file)} is missing the TALRIVO favicon declaration`);
    }
    if (html.includes('styles.css?v=20260906b')) {
      errors.push(`${relative(root, file)} still references the previous stylesheet cache version`);
    }
    const footer = html.split('<footer class="site-footer">')[1] || '';
    if (footer.includes('talrivo-wordmark-new-dark.png')) {
      errors.push(`${relative(root, file)} uses the dark TALRIVO wordmark in the dark footer`);
    }
  }
}

function validateDiff() {
  try {
    execFileSync('git', ['diff', '--check'], { cwd: root, stdio: 'pipe' });
  } catch (error) {
    errors.push(error.stdout.toString().trim() || 'git diff --check failed');
  }
}

validateJsonLd();
validateRegistry();
validateSitemap();
validateConfirmedProductFacts();
validateContactTracking();
validateSharedHeadAssets();
validateDiff();

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
const registryCount = readdirSync(join(root, 'content/products')).filter((name) => name.endsWith('.json')).length;
console.log(`Validated site structure, JSON-LD, sitemap rules, confirmed model facts, contact tracking, and ${registryCount} registered product record(s).`);
process.exitCode = errors.length ? 1 : 0;
