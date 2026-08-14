import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { repositoryRoot, treeManifest } from './lib.mjs';

const distRoot = join(repositoryRoot, 'dist');
const bundleRoot = join(distRoot, 'ronin');
if (dirname(distRoot) !== repositoryRoot || basename(distRoot) !== 'dist') throw new Error(`Unsafe dist path: ${distRoot}`);
rmSync(distRoot, { recursive: true, force: true });
mkdirSync(bundleRoot, { recursive: true });

for (const name of ['skills', 'docs']) {
  cpSync(join(repositoryRoot, name), join(bundleRoot, name), {
    recursive: true,
    filter: (source) => !source.split('/').includes('node_modules')
  });
}
for (const name of ['LICENSE', 'LICENSE-cursor-team-kit', 'NOTICE.md', 'README.md', 'UPSTREAM.md', 'upstream.json']) {
  cpSync(join(repositoryRoot, name), join(bundleRoot, name));
}

const skillNames = treeManifest(join(bundleRoot, 'skills'))
  .filter((entry) => entry.path.endsWith('/SKILL.md') && !entry.path.slice(0, -9).includes('/'))
  .map((entry) => entry.path.split('/')[0])
  .sort();
const personaNames = treeManifest(join(bundleRoot, 'skills', 'ronin-core', 'personas'))
  .filter((entry) => entry.path.endsWith('.md'))
  .map((entry) => basename(entry.path, '.md'))
  .sort();
const manifest = {
  schemaVersion: 1,
  packageVersion: '0.1.0',
  upstream: JSON.parse(await import('node:fs').then(({ readFileSync }) => readFileSync(join(repositoryRoot, 'upstream.json'), 'utf8'))),
  skillNames,
  personaNames,
  files: treeManifest(bundleRoot)
};
writeFileSync(join(bundleRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built ${skillNames.length} skills and ${personaNames.length} personas in ${resolve(bundleRoot)}`);
