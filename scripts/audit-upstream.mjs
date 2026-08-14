import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { repositoryRoot } from './lib.mjs';

const argv = process.argv.slice(2);
const sourceIndex = argv.indexOf('--source');
if (sourceIndex < 0 || !argv[sourceIndex + 1] || argv[sourceIndex + 1].startsWith('--')) {
  throw new Error('Usage: node scripts/audit-upstream.mjs --source /path/to/pstack');
}

const sourceRoot = resolve(argv[sourceIndex + 1]);
const required = ['skills', 'docs', 'agents', 'LICENSE', '.cursor-plugin/plugin.json'];
for (const name of required) {
  if (!existsSync(join(sourceRoot, name))) throw new Error(`Upstream source is missing ${name}: ${sourceRoot}`);
}

const provenance = JSON.parse(readFileSync(join(repositoryRoot, 'upstream.json'), 'utf8'));
const plugin = JSON.parse(readFileSync(join(sourceRoot, '.cursor-plugin/plugin.json'), 'utf8'));
if (plugin.name !== provenance.name || plugin.version !== provenance.version) {
  throw new Error(`Expected ${provenance.name} ${provenance.version}, found ${plugin.name} ${plugin.version}`);
}

const entries = [];
function visit(directory, prefix) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'node_modules' || entry.name === '.cache-complete') continue;
    const path = join(directory, entry.name);
    const normalized = join(prefix, entry.name).split(sep).join('/');
    if (entry.isDirectory()) visit(path, normalized);
    else if (entry.isFile()) entries.push({ path: normalized, contents: readFileSync(path) });
  }
}

visit(join(sourceRoot, 'skills'), 'skills');
visit(join(sourceRoot, 'docs'), 'docs');
for (const entry of readdirSync(join(sourceRoot, 'agents'), { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md')) entries.push({ path: `personas/${entry.name}`, contents: readFileSync(join(sourceRoot, 'agents', entry.name)) });
}
entries.push({ path: 'LICENSE', contents: readFileSync(join(sourceRoot, 'LICENSE')) });
entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

const digestInput = entries.map(({ path, contents }) => `${createHash('sha256').update(contents).digest('hex')}  ${path}\n`).join('');
const digest = createHash('sha256').update(digestInput).digest('hex');
if (digest !== provenance.importedAllowlistDigest) {
  throw new Error(`Imported allowlist digest mismatch: expected ${provenance.importedAllowlistDigest}, found ${digest}`);
}

const paths = entries.map((entry) => entry.path);
const skills = paths.filter((path) => /^skills\/[^/]+\/SKILL\.md$/.test(path));
const personas = paths.filter((path) => /^personas\/[^/]+\.md$/.test(path));
const playbooks = paths.filter((path) => /^skills\/poteto-mode\/playbooks\/[^/]+\.md$/.test(path));
const references = paths.filter((path) => path.startsWith('skills/') && path.includes('/references/'));
const docs = paths.filter((path) => path.startsWith('docs/'));
const expected = { skills: 44, personas: 2, playbooks: 23, references: 34, docs: 17 };
const actual = { skills: skills.length, personas: personas.length, playbooks: playbooks.length, references: references.length, docs: docs.length };
for (const [name, count] of Object.entries(expected)) {
  if (actual[name] !== count) throw new Error(`Expected ${count} ${name}, found ${actual[name]}`);
}
if (!readFileSync(join(sourceRoot, 'LICENSE'), 'utf8').includes('Copyright (c) 2026 Lauren Tan')) {
  throw new Error('Upstream Lauren Tan license notice is missing');
}

console.log(`Verified ${plugin.name} ${plugin.version} allowlist at ${basename(sourceRoot)}.`);
console.log(`Digest: ${digest}`);
console.log(`Inventory: ${actual.skills} skills, ${actual.personas} personas, ${actual.playbooks} playbooks, ${actual.references} references, ${actual.docs} docs files.`);
