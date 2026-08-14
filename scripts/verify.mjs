import { existsSync, lstatSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { filesUnder, installationPaths, parseHomeArgument, repositoryRoot, sha256, treeDigest, treeManifest } from './lib.mjs';

if (!process.versions.bun) throw new Error('pstack-portable verification requires Bun 1.3.14 or newer');

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const run = (script, args = []) => {
  const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), ...args], { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${script} failed: ${(result.stderr || result.stdout).trim()}`);
  return result;
};
const runExpectingFailure = (script, args = []) => {
  const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), ...args], { cwd: repositoryRoot, encoding: 'utf8' });
  check(result.status !== 0, `${script} unexpectedly succeeded`);
  return result;
};

function frontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return null;
  const body = text.slice(4, end);
  return Object.fromEntries(body.split('\n').flatMap((line) => {
    const match = line.match(/^([a-zA-Z0-9-]+):\s*(.+)$/);
    return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, '')]] : [];
  }));
}

function validateLinks(markdownPath, root) {
  const text = readFileSync(markdownPath, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || target === 'url' || /^(https?:|mailto:)/.test(target) || target.includes('<') || target.includes('{{')) continue;
    const resolved = resolve(dirname(markdownPath), target);
    check(resolved.startsWith(`${resolve(root)}/`) && existsSync(resolved), `Broken local link in ${relative(root, markdownPath)}: ${match[1]}`);
  }
}

function validateSource(root) {
  const sourceOptions = { excludeDirectories: ['node_modules'] };
  const skillDirectories = treeManifest(join(root, 'skills'), sourceOptions)
    .filter((entry) => entry.path.endsWith('/SKILL.md') && !entry.path.slice(0, -9).includes('/'))
    .map((entry) => entry.path.split('/')[0])
    .sort();
  check(skillDirectories.length === 46, `Expected 46 skills, found ${skillDirectories.length}`);
  for (const name of skillDirectories) {
    const path = join(root, 'skills', name, 'SKILL.md');
    const metadata = frontmatter(readFileSync(path, 'utf8'));
    check(metadata, `Invalid frontmatter: skills/${name}/SKILL.md`);
    if (!metadata) continue;
    check(metadata.name === name, `Skill name must match directory: ${name} != ${metadata.name}`);
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) && metadata.name.length <= 64, `Invalid Agent Skills name: ${metadata.name}`);
    check(Boolean(metadata.description) && metadata.description.length <= 1024, `Invalid description: ${name}`);
  }
  check(filesUnder(join(root, 'skills/pstack-core/personas')).filter((path) => path.endsWith('.md')).length === 2, 'Expected two personas');
  for (const path of filesUnder(join(root, 'skills/pstack-core/personas')).filter((path) => path.endsWith('.md'))) {
    const name = basename(path, '.md');
    const metadata = frontmatter(readFileSync(path, 'utf8'));
    check(metadata, `Invalid persona frontmatter: skills/pstack-core/personas/${name}.md`);
    if (metadata) check(metadata.name === name, `Persona name must match filename: ${name} != ${metadata.name}`);
  }
  check(filesUnder(join(root, 'skills/poteto-mode/playbooks')).filter((path) => path.endsWith('.md')).length === 23, 'Expected 23 playbooks');
  check(filesUnder(join(root, 'skills'), sourceOptions).filter((path) => path.includes('/references/')).length === 34, 'Expected 34 skill reference files');
  check(filesUnder(join(root, 'docs')).length === 17, 'Expected 17 guide files');
  for (const path of filesUnder(root, { excludeDirectories: ['.git', '.codex', 'dist', 'node_modules'] }).filter((path) => path.endsWith('.md'))) validateLinks(path, root);

  const trackedResult = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'buffer' });
  check(trackedResult.status === 0, 'Unable to enumerate tracked publication files');
  const publishable = trackedResult.status === 0
    ? trackedResult.stdout.toString('utf8').split('\0').filter(Boolean).map((path) => join(root, path)).filter(existsSync)
    : [];
  for (const path of publishable) {
    const relativePath = relative(root, path);
    check(!relativePath.split('/').includes('node_modules'), `Cached dependency is tracked: ${relativePath}`);
    if (!/\.(md|json|mjs|js|ts|sh|yaml|yml|txt)$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    check(!new RegExp(['ben', 'ny'].join(''), 'i').test(text), `Excluded automation reference in ${relativePath}`);
    check(!/\/Users\/[A-Za-z0-9._-]+\//.test(text), `Private absolute path in ${relativePath}`);
    check(!/(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,})/.test(text), `Possible secret in ${relativePath}`);
  }

  for (const path of filesUnder(join(root, 'skills'), sourceOptions)) {
    if (!/\.(md|sh|ts|js|mjs|json)$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    for (const forbidden of ['~/.cursor/', '.cursor/skills/', 'subagent_type', 'run_in_background', 'environment: "cloud"', 'cloud_base_branch', 'cursor-team-kit', "Cursor's built-in"]) {
      check(!text.includes(forbidden), `Host coupling ${JSON.stringify(forbidden)} remains in ${relative(root, path)}`);
    }
    check(!/(claude-fable-5|gpt-5\.6-sol|grok-4\.6-fast|claude-opus-5)/.test(text), `Hard-coded host model remains in ${relative(root, path)}`);
  }

  const license = readFileSync(join(root, 'LICENSE'), 'utf8');
  check(license.includes('Copyright (c) 2026 Lauren Tan'), 'Lauren Tan copyright notice is missing');
  const teamKitLicense = readFileSync(join(root, 'LICENSE-cursor-team-kit'), 'utf8');
  check(teamKitLicense.includes('Copyright (c) 2026 Cursor'), 'Cursor Team Kit copyright notice is missing');
  check(existsSync(join(root, 'skills/deslop/SKILL.md')), 'Imported deslop skill is missing');
  const upstream = JSON.parse(readFileSync(join(root, 'upstream.json'), 'utf8'));
  check(upstream.version === '0.14.1' && upstream.commit === '2a8044425c7bddf429c3bdedf3ab61e791d34d65', 'Pinned upstream provenance changed');
  const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  check(rootPackage.packageManager === 'bun@1.3.14', 'Root package manager is not pinned to Bun 1.3.14');
  check(Object.values(rootPackage.scripts).every((script) => !/\b(?:node|npm|npx|tsx|vitest)\b/.test(script)), 'Root package scripts still invoke the Node/npm toolchain');
  const toolsRoot = join(root, 'skills/poteto-mode/scripts');
  const toolsPackage = JSON.parse(readFileSync(join(toolsRoot, 'package.json'), 'utf8'));
  const toolDependencies = { ...toolsPackage.dependencies, ...toolsPackage.devDependencies };
  check(toolsPackage.packageManager === 'bun@1.3.14', 'Tool package manager is not pinned to Bun 1.3.14');
  check(existsSync(join(toolsRoot, 'bun.lock')), 'Pinned Bun tool lockfile is missing');
  check(!existsSync(join(toolsRoot, 'package-lock.json')), 'Legacy npm lockfile remains');
  for (const removed of ['tsx', 'vitest']) check(!(removed in toolDependencies), `Legacy ${removed} dependency remains`);
  for (const path of ['orch/orch', 'watch-pr/watch-pr']) {
    const launcher = readFileSync(join(toolsRoot, path), 'utf8');
    check(launcher.includes('bun') && !/\b(?:npm|npx|tsx)\b/.test(launcher), `Tool launcher is not Bun-native: ${path}`);
  }
  const fixture = JSON.parse(readFileSync(join(root, 'tests/fixtures/delegation.json'), 'utf8'));
  for (const field of ['objective', 'ownershipBoundary', 'permissions', 'isolation', 'verifier', 'stopCondition', 'returnedEvidence']) check(Boolean(fixture[field]), `Delegation fixture lacks ${field}`);
  check(existsSync(join(root, fixture.persona)), 'Delegation fixture persona is missing');
  check(existsSync(join(root, fixture.requiredSkill)), 'Delegation fixture skill is missing');
  const routing = JSON.parse(readFileSync(join(root, 'tests/fixtures/routing.json'), 'utf8'));
  for (const edge of routing.edges) {
    const source = join(root, edge.from);
    const target = join(root, edge.to);
    check(existsSync(source), `Routing fixture source is missing: ${edge.from}`);
    check(existsSync(target), `Routing fixture target is missing: ${edge.to}`);
    if (existsSync(source)) check(edge.needles.some((needle) => readFileSync(source, 'utf8').includes(needle)), `Routing edge is not expressed in ${edge.from}: ${edge.to}`);
  }
  const capabilities = JSON.parse(readFileSync(join(root, 'tests/fixtures/capabilities.json'), 'utf8'));
  const contract = readFileSync(join(root, 'skills/pstack-core/HOST_CONTRACT.md'), 'utf8');
  for (const capability of capabilities.capabilities) {
    check(contract.includes(capability.contractNeedle), `Host contract lacks ${capability.name}`);
    const source = join(root, capability.fallbackFile);
    check(existsSync(source), `Capability fallback file is missing: ${capability.fallbackFile}`);
    if (existsSync(source)) check(readFileSync(source, 'utf8').includes(capability.fallbackNeedle), `Capability fallback is not explicit for ${capability.name}`);
  }
  validateNamedSkillReferences(root, skillDirectories);
  check(readFileSync(join(root, 'skills/pstack-core/personas/poteto-agent.md'), 'utf8').includes('poteto-mode'), 'Poteto Agent persona cannot route to Poteto Mode');
}

function validateNamedSkillReferences(root, skillDirectories) {
  const skillSet = new Set(skillDirectories);
  const nonSkillSlashTokens = new Set(['tmp']);
  const files = filesUnder(join(root, 'skills'), { excludeDirectories: ['node_modules'] }).filter((path) => path.endsWith('.md'));
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/(?<![A-Za-z0-9_./:<>])\/([a-z0-9]+(?:-[a-z0-9]+)*)\b/g)) {
      const name = match[1];
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + 1);
      if (after === '/' || after === '.' || after === '-') continue;
      if (skillSet.has(name) || nonSkillSlashTokens.has(name)) continue;
      check(false, `Unresolved skill invocation /${name} in ${relative(root, path)}`);
    }
  }
}

function validateInstallation(home) {
  const paths = installationPaths(home);
  const manifestPath = join(paths.root, '.pstack-portable-install.json');
  check(existsSync(manifestPath), `Installed ownership manifest is missing: ${manifestPath}`);
  if (!existsSync(manifestPath)) return;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const distributionManifestPath = join(paths.root, 'manifest.json');
  check(existsSync(distributionManifestPath), `Installed distribution manifest is missing: ${distributionManifestPath}`);
  if (existsSync(distributionManifestPath)) {
    const distributionManifest = JSON.parse(readFileSync(distributionManifestPath, 'utf8'));
    for (const entry of distributionManifest.files) {
      const path = resolve(paths.root, entry.path);
      check(path.startsWith(`${resolve(paths.root)}/`) && existsSync(path), `Installed manifest path is missing or unsafe: ${entry.path}`);
      if (path.startsWith(`${resolve(paths.root)}/`) && existsSync(path)) check(sha256(readFileSync(path)) === entry.sha256, `Installed file digest changed: ${entry.path}`);
    }
  }
  for (const name of manifest.skillNames) {
    for (const base of [paths.agentsSkills, paths.claudeSkills]) {
      const link = join(base, name);
      check(existsSync(link) && lstatSync(link).isSymbolicLink(), `Missing skill link: ${link}`);
      if (existsSync(link)) check(realpathSync(link) === realpathSync(join(paths.root, 'skills', name)), `Incorrect skill target: ${link}`);
    }
  }
  for (const name of manifest.personaNames) {
    const link = join(paths.claudeAgents, `${name}.md`);
    check(existsSync(link) && lstatSync(link).isSymbolicLink(), `Missing persona link: ${link}`);
    if (existsSync(link)) check(realpathSync(link) === realpathSync(join(paths.root, 'skills', 'pstack-core', 'personas', `${name}.md`)), `Incorrect persona target: ${link}`);
  }
  const installedRouter = join(paths.root, 'skills/poteto-mode/SKILL.md');
  const installedPlaybook = join(paths.root, 'skills/poteto-mode/playbooks/feature.md');
  const installedSibling = join(paths.root, 'skills/architect/SKILL.md');
  const installedPersona = join(paths.root, 'skills/pstack-core/personas/poteto-agent.md');
  check(existsSync(installedRouter) && readFileSync(installedRouter, 'utf8').includes('playbooks/feature.md'), 'Installed Poteto Mode router cannot resolve the Feature playbook');
  check(existsSync(installedPlaybook) && readFileSync(installedPlaybook, 'utf8').includes('architect'), 'Installed Feature playbook cannot resolve architect');
  check(existsSync(installedSibling) && readFileSync(installedSibling, 'utf8').includes('HOST_CONTRACT.md'), 'Installed architect skill cannot resolve the host contract');
  const architectDir = realpathSync(dirname(installedSibling));
  const contractFromSkill = resolve(architectDir, '../pstack-core/HOST_CONTRACT.md');
  check(existsSync(contractFromSkill), 'HOST_CONTRACT.md is not reachable as ../pstack-core/HOST_CONTRACT.md from installed skills/architect');
  if (existsSync(contractFromSkill)) {
    try {
      readFileSync(contractFromSkill, 'utf8');
    } catch {
      check(false, 'HOST_CONTRACT.md at the skill locator path is unreadable');
    }
  }
  check(existsSync(installedPersona) && readFileSync(installedPersona, 'utf8').includes('poteto-mode'), 'Installed Poteto Agent cannot resolve Poteto Mode');
}

function validateToolLaunchers(home) {
  const toolsRoot = join(installationPaths(home).root, 'skills/poteto-mode/scripts');
  for (const [relativePath, expected] of [['orch/orch', 'Usage:'], ['watch-pr/watch-pr', 'Usage:']]) {
    const path = join(toolsRoot, relativePath);
    const result = spawnSync(path, ['--help'], {
      cwd: toolsRoot,
      encoding: 'utf8',
      env: { ...process.env, BUN_BIN: process.execPath }
    });
    check(result.status === 0, `Installed Bun launcher failed: ${relativePath}: ${(result.stderr || result.stdout).trim()}`);
    check((result.stdout || '').includes(expected), `Installed Bun launcher returned unexpected help: ${relativePath}`);
  }
  check(existsSync(join(toolsRoot, 'node_modules/commander/package.json')), 'Installed Bun launcher did not bootstrap pinned dependencies');
}

validateSource(repositoryRoot);
run('build.mjs');
const firstBuildDigest = existsSync(join(repositoryRoot, 'dist/pstack-portable')) ? treeDigest(join(repositoryRoot, 'dist/pstack-portable')) : '';
check(!filesUnder(join(repositoryRoot, 'dist/pstack-portable')).some((path) => path.includes('/node_modules/')), 'Build output contains cached dependencies');
run('build.mjs');
const secondBuildDigest = existsSync(join(repositoryRoot, 'dist/pstack-portable')) ? treeDigest(join(repositoryRoot, 'dist/pstack-portable')) : '';
check(firstBuildDigest === secondBuildDigest, 'Build output is not deterministic');

const argv = process.argv.slice(2);
if (argv.includes('--installed')) {
  validateInstallation(parseHomeArgument(argv, homedir()));
} else {
  const testHome = mkdtempSync(join(tmpdir(), 'pstack-portable-test-'));
  try {
    writeFileSync(join(testHome, 'sentinel'), 'preserve\n');
    const collision = join(testHome, '.agents/skills/architect');
    await import('node:fs').then(({ mkdirSync }) => mkdirSync(dirname(collision), { recursive: true }));
    writeFileSync(collision, 'unrelated\n');
    const collisionResult = runExpectingFailure('install.mjs', ['--home', testHome]);
    check((collisionResult.stderr || collisionResult.stdout).includes('Refusing to overwrite unrelated path'), 'Collision refusal did not explain the unrelated path');
    check(readFileSync(collision, 'utf8') === 'unrelated\n', 'Collision refusal changed the unrelated path');
    check(!existsSync(installationPaths(testHome).root), 'Collision refusal created an installation root');
    rmSync(collision);
    run('install.mjs', ['--home', testHome, '--dry-run']);
    run('install.mjs', ['--home', testHome]);
    validateInstallation(testHome);
    validateToolLaunchers(testHome);
    run('install.mjs', ['--home', testHome]);
    validateInstallation(testHome);
    const unrelated = join(testHome, '.agents/skills/unrelated');
    symlinkSync(join(testHome, 'sentinel'), unrelated);
    run('uninstall.mjs', ['--home', testHome, '--dry-run']);
    run('uninstall.mjs', ['--home', testHome]);
    check(existsSync(join(testHome, 'sentinel')), 'Uninstall removed an unrelated file');
    check(existsSync(unrelated), 'Uninstall removed an unrelated skill link');
    check(!existsSync(installationPaths(testHome).root), 'Uninstall left the owned installation root');
  } finally {
    if (basename(testHome).startsWith('pstack-portable-test-') && dirname(testHome) === resolve(tmpdir())) rmSync(testHome, { recursive: true });
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Verified Agent Skills metadata, provenance, exclusions, local references, and capability fixtures.');
console.log('Verified deterministic build plus isolated-home install, Bun tool bootstrap, reinstall, installed-file integrity, discovery links, dry-run, and exact uninstall.');
