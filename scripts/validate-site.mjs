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

function validateDiff() {
  try {
    execFileSync('git', ['diff', '--check'], { cwd: root, stdio: 'pipe' });
  } catch (error) {
    errors.push(error.stdout.toString().trim() || 'git diff --check failed');
  }
}

validateJsonLd();
validateRegistry();
validateDiff();

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Validated ${readdirSync(join(root, 'content/products')).filter((name) => name.endsWith('.json')).length} product record(s).`);
process.exitCode = errors.length ? 1 : 0;
