import { cpSync, existsSync, mkdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { assertOwnedLinkOrMissing, installMarker, installationPaths, isOwnedLink, parseHomeArgument, readInstallManifest, repositoryRoot, safeLstat } from './lib.mjs';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const home = parseHomeArgument(argv, homedir());
const paths = installationPaths(home);
const bundleRoot = join(repositoryRoot, 'dist', 'pstack-portable');
const sourceManifestPath = join(bundleRoot, 'manifest.json');
if (!existsSync(sourceManifestPath)) throw new Error('Build output is missing. Run `bun run build` first.');
const sourceManifest = JSON.parse(await import('node:fs').then(({ readFileSync }) => readFileSync(sourceManifestPath, 'utf8')));
if (sourceManifest.marker !== installMarker) throw new Error('Build output has an invalid ownership marker');

const priorManifest = existsSync(paths.root) ? readInstallManifest(paths.root) : null;
for (const name of sourceManifest.skillNames) {
  const target = join(paths.root, 'skills', name);
  assertOwnedLinkOrMissing(join(paths.agentsSkills, name), target);
  assertOwnedLinkOrMissing(join(paths.claudeSkills, name), target);
}
for (const name of sourceManifest.personaNames) {
  assertOwnedLinkOrMissing(join(paths.claudeAgents, `${name}.md`), join(paths.root, 'skills', 'pstack-core', 'personas', `${name}.md`));
}

// Links owned by the prior manifest whose names the new manifest no longer
// claims would dangle after the root swap. Ownership must be resolved now,
// while the prior targets still exist; anything unowned at a released name
// stays untouched.
const staleLinks = [];
if (priorManifest) {
  const keptSkills = new Set(sourceManifest.skillNames);
  const keptPersonas = new Set(sourceManifest.personaNames);
  for (const name of priorManifest.skillNames.filter((name) => !keptSkills.has(name))) {
    const target = join(paths.root, 'skills', name);
    for (const link of [join(paths.agentsSkills, name), join(paths.claudeSkills, name)]) {
      if (isOwnedLink(link, target)) staleLinks.push(link);
    }
  }
  for (const name of priorManifest.personaNames.filter((name) => !keptPersonas.has(name))) {
    const link = join(paths.claudeAgents, `${name}.md`);
    if (isOwnedLink(link, join(paths.root, 'skills', 'pstack-core', 'personas', `${name}.md`))) staleLinks.push(link);
  }
}

if (dryRun) {
  console.log(`Would install ${sourceManifest.skillNames.length} skills and ${sourceManifest.personaNames.length} personas under ${paths.root}`);
  if (staleLinks.length) console.log(`Would remove ${staleLinks.length} stale links owned by the prior installation`);
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
  if (!existsSync(link)) symlinkSync(join(paths.root, 'skills', 'pstack-core', 'personas', `${name}.md`), link);
}
for (const link of staleLinks) {
  if (safeLstat(link)) rmSync(link);
}
if (existsSync(backup)) rmSync(backup, { recursive: true });
console.log(`Installed ${sourceManifest.skillNames.length} skills and ${sourceManifest.personaNames.length} personas under ${paths.root}`);
if (staleLinks.length) console.log(`Removed ${staleLinks.length} stale links owned by the prior installation`);
console.log(`Agent Skills: ${paths.agentsSkills}`);
console.log(`Claude aliases: ${paths.claudeSkills} and ${paths.claudeAgents}`);
