import { existsSync, realpathSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { installationPaths, parseHomeArgument, readInstallManifest, safeLstat } from './lib.mjs';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const paths = installationPaths(parseHomeArgument(argv, homedir()));
if (!existsSync(paths.root)) {
  console.log(`No ronin installation found under ${paths.root}`);
  process.exit(0);
}
const manifest = readInstallManifest(paths.root);
const links = [];
for (const name of manifest.skillNames) {
  links.push([join(paths.agentsSkills, name), join(paths.root, 'skills', name)]);
  links.push([join(paths.claudeSkills, name), join(paths.root, 'skills', name)]);
}
for (const name of manifest.personaNames) {
  links.push([join(paths.claudeAgents, `${name}.md`), join(paths.root, 'skills', 'ronin-core', 'personas', `${name}.md`)]);
}
for (const [link, target] of links) {
  const status = safeLstat(link);
  if (!status) continue;
  if (!status.isSymbolicLink() || !existsSync(link) || realpathSync(link) !== realpathSync(target)) {
    throw new Error(`Refusing uninstall because an owned link changed: ${link}`);
  }
}
if (dryRun) {
  console.log(`Would remove ${links.length} manifest-owned links and ${paths.root}`);
  process.exit(0);
}
for (const [link] of links) {
  if (safeLstat(link)) rmSync(link);
}
rmSync(paths.root, { recursive: true });
console.log(`Removed ronin from ${paths.root}`);
