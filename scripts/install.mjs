import { cpSync, existsSync, mkdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { assertOwnedLinkOrMissing, installMarker, installationPaths, parseHomeArgument, readInstallManifest, repositoryRoot } from './lib.mjs';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const home = parseHomeArgument(argv, homedir());
const paths = installationPaths(home);
const bundleRoot = join(repositoryRoot, 'dist', 'pstack-portable');
const sourceManifestPath = join(bundleRoot, 'manifest.json');
if (!existsSync(sourceManifestPath)) throw new Error('Build output is missing. Run `npm run build` first.');
const sourceManifest = JSON.parse(await import('node:fs').then(({ readFileSync }) => readFileSync(sourceManifestPath, 'utf8')));
if (sourceManifest.marker !== installMarker) throw new Error('Build output has an invalid ownership marker');

if (existsSync(paths.root)) readInstallManifest(paths.root);
for (const name of sourceManifest.skillNames) {
  const target = join(paths.root, 'skills', name);
  assertOwnedLinkOrMissing(join(paths.agentsSkills, name), target);
  assertOwnedLinkOrMissing(join(paths.claudeSkills, name), target);
}
for (const name of sourceManifest.personaNames) {
  assertOwnedLinkOrMissing(join(paths.claudeAgents, `${name}.md`), join(paths.root, 'personas', `${name}.md`));
}

if (dryRun) {
  console.log(`Would install ${sourceManifest.skillNames.length} skills and ${sourceManifest.personaNames.length} personas under ${paths.root}`);
  process.exit(0);
}

mkdirSync(join(paths.home, '.agents'), { recursive: true });
const stage = join(paths.home, '.agents', `.pstack-portable-stage-${process.pid}`);
const backup = join(paths.home, '.agents', `.pstack-portable-backup-${process.pid}`);
if (existsSync(stage) || existsSync(backup)) throw new Error('Unexpected staging path already exists');
cpSync(bundleRoot, stage, { recursive: true });
writeFileSync(join(stage, '.pstack-portable-install.json'), `${JSON.stringify({
  marker: installMarker,
  skillNames: sourceManifest.skillNames,
  personaNames: sourceManifest.personaNames
}, null, 2)}\n`);

if (existsSync(paths.root)) renameSync(paths.root, backup);
renameSync(stage, paths.root);
for (const directory of [paths.agentsSkills, paths.claudeSkills, paths.claudeAgents]) mkdirSync(directory, { recursive: true });
for (const name of sourceManifest.skillNames) {
  const target = join(paths.root, 'skills', name);
  for (const link of [join(paths.agentsSkills, name), join(paths.claudeSkills, name)]) {
    if (!existsSync(link)) symlinkSync(target, link);
  }
}
for (const name of sourceManifest.personaNames) {
  const link = join(paths.claudeAgents, `${name}.md`);
  if (!existsSync(link)) symlinkSync(join(paths.root, 'personas', `${name}.md`), link);
}
if (existsSync(backup)) rmSync(backup, { recursive: true });
console.log(`Installed ${sourceManifest.skillNames.length} skills and ${sourceManifest.personaNames.length} personas under ${paths.root}`);
console.log(`Agent Skills: ${paths.agentsSkills}`);
console.log(`Claude aliases: ${paths.claudeSkills} and ${paths.claudeAgents}`);
