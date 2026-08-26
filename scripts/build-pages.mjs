import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'public');

// Publish only visitor-facing pages. Source notes and CMS configuration remain
// in the repository but are intentionally absent from the public site bundle.
const excluded = new Set([
  '.DS_Store',
  '.git',
  '.github',
  '.gitignore',
  '.vercelignore',
  'README.md',
  'admin',
  'content',
  'marketing',
  'node_modules',
  'public',
  'scripts',
]);

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const entry of await import('node:fs/promises').then(({ readdir }) => readdir(root))) {
  if (excluded.has(entry) || entry.startsWith('.')) continue;

  const source = join(root, entry);
  const destination = join(output, basename(entry));
  cpSync(source, destination, { recursive: true });
}

if (!existsSync(join(output, 'index.html'))) {
  throw new Error('Build output is missing index.html. Pages deployment stopped.');
}

console.log('Public Pages bundle created in ./public');
