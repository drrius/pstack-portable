import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function filesUnder(root, options = {}) {
  const excludedDirectories = new Set(options.excludeDirectories ?? []);
  const files = [];
  if (!existsSync(root)) return files;
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory() && !excludedDirectories.has(entry.name)) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(root);
  return files;
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function treeManifest(root, options = {}) {
  return filesUnder(root, options).map((path) => ({
    path: relative(root, path).split(sep).join('/'),
    sha256: sha256(readFileSync(path))
  }));
}

export function treeDigest(root, options = {}) {
  return sha256(`${JSON.stringify(treeManifest(root, options))}\n`);
}
