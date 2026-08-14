import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generatedReportsRoot, repositoryRoot, runsRoot } from './lib/paths';
import { runPreflight } from './lib/preflight';
import { markdownReport, sanitize } from './lib/report';
import { buildMatrix, displayPlan } from './lib/runner';
import { loadSuite } from './lib/suite';

const failures: string[] = [];
const check = (condition: unknown, message: string) => { if (!condition) failures.push(message); };
const suite = loadSuite();

const testFiles = [...new Bun.Glob('bench/lib/*.test.ts').scanSync({ cwd: repositoryRoot })].sort();
const tests = spawnSync(process.execPath, ['test', ...testFiles.map((path) => `./${path}`)], { cwd: repositoryRoot, encoding: 'utf8' });
check(tests.status === 0, `Benchmark tests failed:\n${tests.stdout}${tests.stderr}`);

const preflight = runPreflight(suite);
check(Object.values(preflight.hosts).every((host) => host.available), 'One or more benchmark host CLIs are unavailable');
check(preflight.nativeCursor.available, `Native Cursor plugin failed provenance verification: ${preflight.nativeCursor.note}`);
check(preflight.conditions.length === 6 && preflight.conditions.every((condition) => condition.runnable), 'Preflight did not produce six runnable conditions');

const plans = buildMatrix(suite, { repetitions: 1 });
check(plans.length === suite.conditions.length * suite.cases.length, 'Dry matrix is incomplete');
check(new Set(plans.map((plan) => plan.runId)).size === plans.length, 'Dry matrix has duplicate run IDs');
const displayed = JSON.stringify(plans.map(displayPlan));
check(!displayed.includes(process.env.HOME ?? '\0'), 'Dry plan leaks the current home path');
check(!displayed.includes('CURSOR_API_KEY='), 'Dry plan leaks a Cursor API key');

const sampleScores = suite.conditions.map((condition, index) => ({
  runId: `sample-${condition.id}`,
  conditionId: condition.id,
  caseId: suite.cases[0],
  repetition: 1,
  passed: index % 2 === 0,
  verifierExitCode: index % 2 === 0 ? 0 : 1,
  durationMs: 100 + index,
  toolCalls: index,
  failedTools: 0,
  changedFiles: 1
}));
const firstReport = sanitize(markdownReport(suite, sampleScores, false));
const secondReport = sanitize(markdownReport(suite, sampleScores, false));
check(firstReport === secondReport, 'Readiness report is not deterministic');
check(!/\/Users\/[A-Za-z0-9._-]+\//.test(firstReport), 'Readiness report contains a private absolute path');
check(firstReport.includes('no live model outcome claims'), 'Readiness report overclaims live evidence');

mkdirSync(generatedReportsRoot, { recursive: true });
writeFileSync(join(generatedReportsRoot, 'readiness-sample.md'), firstReport);
writeFileSync(join(generatedReportsRoot, 'readiness-sample.json'), `${JSON.stringify({ schemaVersion: 1, live: false, preflight, runs: plans.map(displayPlan), scores: sampleScores }, null, 2)}\n`);

const verificationRoot = join(runsRoot, 'fixture-verification');
if (existsSync(verificationRoot)) rmSync(verificationRoot, { recursive: true });

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Benchmark readiness verified: ${suite.conditions.length} conditions, ${suite.cases.length} cases, ${plans.length} dry runs.`);
console.log(`Host CLIs: Cursor ${preflight.hosts.cursor.version}, Codex ${preflight.hosts.codex.version}, Claude ${preflight.hosts.claude.version}.`);
console.log(`Native Cursor plugin: ${preflight.nativeCursor.version} ${preflight.nativeCursor.digest}.`);
