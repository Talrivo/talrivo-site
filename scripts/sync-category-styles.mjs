import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CATEGORY_STYLE_SOURCES = ['dock-preview.css', 'buyer-contact.css', 'product-browse.css'];

// Preserve the original cascade order and source files used by other pages.
// Regenerate when a source changes: node scripts/sync-category-styles.mjs --write
export function inlineCategoryStyles(html, root) {
  for (const source of CATEGORY_STYLE_SOURCES) {
    const css = readFileSync(resolve(root, source), 'utf8').trimEnd();
    if (/<\/style|@import|@charset|url\s*\(/i.test(css)) {
      throw new Error(`${source}: review stylesheet URL resolution before inlining.`);
    }
    const escaped = source.replaceAll('.', '\\.');
    const reference = new RegExp(`<link rel="stylesheet" href="(?:\\.\\./|/)?${escaped}\\?[^\"]+">|<style data-category-source="${escaped}">[\\s\\S]*?<\\/style>`, 'g');
    const matches = [...html.matchAll(reference)];
    if (matches.length !== 1) throw new Error(`${source}: expected one category style source, found ${matches.length}.`);
    html = html.replace(reference, () => `<style data-category-source="${source}">\n${css}\n  </style>`);
  }
  return html;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--check', '--write'].includes(args[0])) {
    throw new Error('Use --check or --write.');
  }
  const path = resolve(root, 'gaming-headsets/index.html');
  const current = readFileSync(path, 'utf8');
  const expected = inlineCategoryStyles(current, root);
  if (args[0] === '--write') {
    writeFileSync(path, expected);
    console.log('Category styles synchronized from three unchanged source files.');
  } else if (current !== expected) {
    throw new Error('Category styles are stale. Run node scripts/sync-category-styles.mjs --write.');
  } else {
    console.log('Category style sources match their inline blocks.');
  }
}
