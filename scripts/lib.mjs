import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const installMarker = 'pstack-portable-install-v1';

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

export function parseHomeArgument(argv, fallback) {
  const index = argv.indexOf('--home');
  if (index < 0) return resolve(fallback);
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error('--home requires an explicit directory');
  return resolve(value);
}

export function installationPaths(home) {
  const resolvedHome = resolve(home);
  const root = join(resolvedHome, '.agents', 'pstack-portable');
  const expected = resolve(resolvedHome, '.agents', 'pstack-portable');
  if (resolve(root) !== expected || root === resolvedHome) throw new Error(`Unsafe installation root: ${root}`);
  return {
    home: resolvedHome,
    root,
    agentsSkills: join(resolvedHome, '.agents', 'skills'),
    claudeSkills: join(resolvedHome, '.claude', 'skills'),
    claudeAgents: join(resolvedHome, '.claude', 'agents')
  };
}

export function readInstallManifest(root) {
  const path = join(root, '.pstack-portable-install.json');
  if (!existsSync(path)) throw new Error(`Refusing to replace or remove unowned directory: ${root}`);
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (manifest.marker !== installMarker) throw new Error(`Invalid installation marker: ${path}`);
  return manifest;
}

export function safeLstat(path) {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

export function isOwnedLink(path, expectedTarget) {
  const status = safeLstat(path);
  if (!status?.isSymbolicLink() || !existsSync(path) || !existsSync(expectedTarget)) return false;
  return realpathSync(path) === realpathSync(expectedTarget);
}

export function assertOwnedLinkOrMissing(path, expectedTarget) {
  const status = safeLstat(path);
  if (!status) return;
  if (!status.isSymbolicLink()) throw new Error(`Refusing to overwrite unrelated path: ${path}`);
  if (!existsSync(path)) throw new Error(`Refusing to replace broken unowned link: ${path}`);
  if (realpathSync(path) !== realpathSync(expectedTarget)) throw new Error(`Refusing to replace unrelated link: ${path}`);
}

export function assertRegularDirectory(path) {
  if (!existsSync(path) || !statSync(path).isDirectory()) throw new Error(`Required directory is missing: ${path}`);
}
