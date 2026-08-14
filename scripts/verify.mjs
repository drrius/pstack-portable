import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { filesUnder, repositoryRoot, treeDigest, treeManifest } from './lib.mjs';

if (!process.versions.bun) throw new Error('ronin verification requires Bun 1.3.14 or newer');

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const run = (script, args = []) => {
  const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), ...args], { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${script} failed: ${(result.stderr || result.stdout).trim()}`);
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

const taskProfileIds = ['explore', 'implement', 'judge', 'explain', 'verify'];
const reviewSeparationIds = ['self-review', 'fresh-context-review'];
const workerContractFields = ['objective', 'ownershipBoundary', 'permissions', 'isolation', 'verifier', 'stopCondition', 'returnedEvidence'];

function validateTaskProfiles(path, label) {
  check(existsSync(path), `${label} task profile contract is missing`);
  if (!existsSync(path)) return;
  let contract;
  try {
    contract = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    check(false, `${label} task profile contract is invalid JSON`);
    return;
  }
  check(contract.version === 1, `${label} task profile contract has an unsupported version`);
  check(contract.delegation?.model === 'inherit-active', `${label} delegated workers do not inherit the active model`);
  check(JSON.stringify(Object.keys(contract.profiles ?? {}).sort()) === JSON.stringify([...taskProfileIds].sort()), `${label} task profile IDs changed`);
  for (const id of taskProfileIds) {
    const profile = contract.profiles?.[id];
    check(Boolean(profile), `${label} task profile is missing: ${id}`);
    if (!profile) continue;
    for (const field of workerContractFields) check(Boolean(profile[field]), `${label} ${id} profile lacks ${field}`);
    check(profile.targetWrites === (id === 'implement'), `${label} ${id} profile has the wrong target-write policy`);
    if (id !== 'implement') check(`${profile.ownershipBoundary} ${profile.permissions}`.includes('artifact'), `${label} ${id} profile lacks an explicit output-artifact boundary`);
  }
  const actualSeparation = (contract.reviewSeparation ?? []).map(({ id, freshContext }) => [id, freshContext]);
  check(JSON.stringify(actualSeparation) === JSON.stringify([['self-review', false], ['fresh-context-review', true]]), `${label} review separation paths changed`);
  const serialized = JSON.stringify(contract);
  for (const removed of ['modelRouting', 'requiresDistinctModel', 'provider']) {
    check(!serialized.includes(removed), `${label} retains deleted model-routing field ${removed}`);
  }
}

function markdownSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => /^(#{1,6})\s+/.test(line) && line.replace(/^#{1,6}\s+/, '') === heading);
  if (start < 0) return null;
  const level = lines[start].match(/^(#{1,6})/)[1].length;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

function validateHostContractSemantics(text, label) {
  const profileSection = markdownSection(text, 'Task profiles');
  check(profileSection !== null, `${label} host contract lacks the Task profiles section`);
  if (profileSection !== null) {
    for (const id of taskProfileIds) check(profileSection.includes(`- \`${id}\`:`), `${label} host contract lacks prose for the ${id} profile`);
    check(profileSection.includes('task-profiles.json'), `${label} host contract does not bind its prose to task-profiles.json`);
  }

  const separationSection = markdownSection(text, 'Review separation');
  check(separationSection !== null, `${label} host contract lacks review separation`);
  if (separationSection !== null) {
    for (const id of reviewSeparationIds) check(separationSection.includes(`\`${id}\``), `${label} host contract lacks the ${id} review path`);
    check(/separate subagent or session/i.test(separationSection), `${label} host contract does not define fresh context`);
  }
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
  check(skillDirectories.length === 43, `Expected 43 skills, found ${skillDirectories.length}`);
  for (const name of skillDirectories) {
    const path = join(root, 'skills', name, 'SKILL.md');
    const metadata = frontmatter(readFileSync(path, 'utf8'));
    check(metadata, `Invalid frontmatter: skills/${name}/SKILL.md`);
    if (!metadata) continue;
    check(metadata.name === name, `Skill name must match directory: ${name} != ${metadata.name}`);
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) && metadata.name.length <= 64, `Invalid Agent Skills name: ${metadata.name}`);
    check(Boolean(metadata.description) && metadata.description.length <= 1024, `Invalid description: ${name}`);
  }
  check(filesUnder(join(root, 'skills/ronin-core/personas')).filter((path) => path.endsWith('.md')).length === 2, 'Expected two personas');
  for (const path of filesUnder(join(root, 'skills/ronin-core/personas')).filter((path) => path.endsWith('.md'))) {
    const name = basename(path, '.md');
    const metadata = frontmatter(readFileSync(path, 'utf8'));
    check(metadata, `Invalid persona frontmatter: skills/ronin-core/personas/${name}.md`);
    if (metadata) check(metadata.name === name, `Persona name must match filename: ${name} != ${metadata.name}`);
  }
  check(filesUnder(join(root, 'skills/ronin/playbooks')).filter((path) => path.endsWith('.md')).length === 23, 'Expected 23 ronin playbooks');
  check(filesUnder(join(root, 'skills'), sourceOptions).filter((path) => path.includes('/references/')).length === 34, 'Expected 34 skill reference files');
  check(filesUnder(join(root, 'docs/guide')).length === 17, 'Expected 17 guide files');
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
    if (/^(README\.md|PORTING\.md|docs\/|skills\/)/.test(relativePath)) {
      for (const pattern of [/counts? in full/i, /most different model/i, /spawn multiple models/i, /multiple model perspectives/i, /single[- ]provider.{0,50}degraded|degraded.{0,50}single[- ]provider/i]) {
        check(!pattern.test(text), `Manufactured-diversity rule remains in ${relativePath}: ${pattern}`);
      }
      check(!/`(?:fast-code|deep-code|judgment|prose|independent-review)`/.test(text), `Legacy model role remains in ${relativePath}`);
    }
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
  check(existsSync(join(root, 'skills/ronin-deslop/SKILL.md')), 'Imported ronin-deslop skill is missing');
  const upstream = JSON.parse(readFileSync(join(root, 'upstream.json'), 'utf8'));
  check(upstream.version === '0.14.1' && upstream.commit === '2a8044425c7bddf429c3bdedf3ab61e791d34d65', 'Pinned upstream provenance changed');
  const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  check(rootPackage.packageManager === 'bun@1.3.14', 'Root package manager is not pinned to Bun 1.3.14');
  check(Object.values(rootPackage.scripts).every((script) => !/\b(?:node|npm|npx|tsx|vitest)\b/.test(script)), 'Root package scripts still invoke the Node/npm toolchain');
  check(rootPackage.scripts['typecheck:tests'] === 'bun skills/ronin/scripts/node_modules/typescript/bin/tsc --project tsconfig.tests.json', 'Repository-test typecheck does not use ronin\'s pinned TypeScript compiler');
  check(rootPackage.scripts.check.includes('bun run typecheck:tests'), 'Complete check omits the repository-test typecheck');
  const testsTypeScript = JSON.parse(readFileSync(join(root, 'tsconfig.tests.json'), 'utf8'));
  check(testsTypeScript.compilerOptions?.strict === true && testsTypeScript.compilerOptions?.noEmit === true, 'Repository-test typecheck is not strict and no-emit');
  check(testsTypeScript.compilerOptions?.typeRoots?.includes('./skills/ronin/scripts/node_modules/@types'), 'Repository-test typecheck does not use ronin\'s pinned type definitions');
  check(testsTypeScript.include?.includes('tests/**/*.ts'), 'Repository-test typecheck does not include the complete tests tree');
  const toolsRoot = join(root, 'skills/ronin/scripts');
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
  const contract = readFileSync(join(root, 'skills/ronin-core/HOST_CONTRACT.md'), 'utf8');
  validateHostContractSemantics(contract, 'Source');
  for (const capability of capabilities.capabilities) {
    check(contract.includes(capability.contractNeedle), `Host contract lacks ${capability.name}`);
    const source = join(root, capability.fallbackFile);
    check(existsSync(source), `Capability fallback file is missing: ${capability.fallbackFile}`);
    if (existsSync(source)) check(readFileSync(source, 'utf8').includes(capability.fallbackNeedle), `Capability fallback is not explicit for ${capability.name}`);
  }
  validateTaskProfiles(join(root, 'skills/ronin-core/task-profiles.json'), 'Source');
  const profileRouting = JSON.parse(readFileSync(join(root, 'tests/fixtures/profile-routing.json'), 'utf8'));
  for (const route of profileRouting.routes) {
    const source = join(root, route.file);
    check(existsSync(source), `Task-profile routing file is missing: ${route.file}`);
    if (!existsSync(source)) continue;
    const section = markdownSection(readFileSync(source, 'utf8'), route.heading);
    check(section !== null, `Task-profile routing heading is missing in ${route.file}: ${route.heading}`);
    if (section === null) continue;
    for (const profile of route.profiles) check(section.includes(`\`${profile}\``), `Task-profile route ${profile} is not explicit under ${route.heading} in ${route.file}`);
  }
  check(JSON.stringify([...new Set(profileRouting.routes.flatMap((route) => route.profiles))].sort()) === JSON.stringify([...taskProfileIds].sort()), 'Task-profile routing fixtures do not retain the complete profile union');
  for (const doc of profileRouting.reviewSeparationDocs ?? []) {
    const source = join(root, doc.file);
    check(existsSync(source), `Review-separation documentation is missing: ${doc.file}`);
    if (!existsSync(source)) continue;
    const text = readFileSync(source, 'utf8');
    for (const needle of doc.needles) check(text.includes(needle), `Review-separation documentation in ${doc.file} lacks ${JSON.stringify(needle)}`);
  }
  validateNamedSkillReferences(root, skillDirectories);
  check(readFileSync(join(root, 'skills/ronin-core/personas/poteto-agent.md'), 'utf8').includes('/ronin'), 'Poteto Agent persona cannot route to /ronin');
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

validateSource(repositoryRoot);
run('build.mjs');
const firstBuildDigest = existsSync(join(repositoryRoot, 'dist/ronin')) ? treeDigest(join(repositoryRoot, 'dist/ronin')) : '';
check(!filesUnder(join(repositoryRoot, 'dist/ronin')).some((path) => path.includes('/node_modules/')), 'Build output contains cached dependencies');
run('build.mjs');
const secondBuildDigest = existsSync(join(repositoryRoot, 'dist/ronin')) ? treeDigest(join(repositoryRoot, 'dist/ronin')) : '';
check(firstBuildDigest === secondBuildDigest, 'Build output is not deterministic');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Verified Agent Skills metadata, review separation, exclusions, local references, and capability fixtures.');
console.log('Verified deterministic build output without cached dependencies.');
