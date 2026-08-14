import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generatedReportsRoot } from './lib/paths';
import { runPreflight } from './lib/preflight';
import { markdownReport, sanitize } from './lib/report';
import { buildMatrix, displayPlan, executePlan, readScores } from './lib/runner';
import type { MatrixOptions } from './lib/runner';
import { loadSuite } from './lib/suite';
import type { Host } from './lib/types';

function valuesAfter(flag: string): string[] | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a comma-separated value`);
  return value.split(',').filter(Boolean);
}

function valueAfter(flag: string): string | undefined {
  return valuesAfter(flag)?.[0];
}

const [, , command] = process.argv;
const suite = loadSuite();

function matrixOptions(repetitions: number): MatrixOptions {
  const modelPairs: Array<[Host, string | undefined]> = [
    ['cursor', valueAfter('--cursor-model')],
    ['codex', valueAfter('--codex-model')],
    ['claude', valueAfter('--claude-model')]
  ];
  const models: Partial<Record<Host, string>> = {};
  for (const [host, model] of modelPairs) if (model) models[host] = model;
  return {
    repetitions,
    conditionIds: valuesAfter('--conditions'),
    caseIds: valuesAfter('--cases'),
    model: valueAfter('--model'),
    models
  };
}

try {
if (command === 'preflight') {
  const report = runPreflight(suite);
  console.log(JSON.stringify(report, null, 2));
  if (!report.nativeCursor.available || Object.values(report.hosts).some((host) => !host.available)) process.exitCode = 1;
} else if (command === 'smoke') {
  if (!process.argv.includes('--dry-run')) throw new Error('Smoke defaults to no model calls; pass --dry-run to print the exact plan');
  const plans = buildMatrix(suite, matrixOptions(Number(valueAfter('--repetitions') ?? 1)));
  console.log(JSON.stringify({ schemaVersion: 1, live: false, runs: plans.map(displayPlan) }, null, 2));
} else if (command === 'compare') {
  if (!process.argv.includes('--confirm-live')) throw new Error('Live model execution is approval-gated. Re-run with --confirm-live after confirming the selected run count and cost.');
  const preflight = runPreflight(suite);
  if (!preflight.nativeCursor.available || preflight.conditions.some((condition) => !condition.runnable)) throw new Error('Live preflight failed; run bun run bench:preflight for details');
  const plans = buildMatrix(suite, matrixOptions(Number(valueAfter('--repetitions') ?? suite.defaultRepetitions)));
  const timeoutMs = Number(valueAfter('--timeout-ms') ?? 900_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 10_000) throw new Error('Timeout must be at least 10000 ms');
  console.error(`Launching ${plans.length} approved live runs.`);
  const scores = plans.map((plan, index) => {
    console.error(`[${index + 1}/${plans.length}] ${plan.runId}`);
    return executePlan(plan, timeoutMs);
  });
  mkdirSync(generatedReportsRoot, { recursive: true });
  const report = sanitize(markdownReport(suite, scores, true));
  writeFileSync(join(generatedReportsRoot, 'latest.md'), report);
  writeFileSync(join(generatedReportsRoot, 'latest.json'), `${JSON.stringify({ schemaVersion: 1, suiteId: suite.suiteId, live: true, preflight, scores }, null, 2)}\n`);
  console.log(report);
} else if (command === 'report') {
  const scores = readScores();
  if (!scores.length) throw new Error('No benchmark score records exist. Run an approved comparison first.');
  const report = sanitize(markdownReport(suite, scores, true));
  if (process.argv.includes('--write')) {
    mkdirSync(generatedReportsRoot, { recursive: true });
    writeFileSync(join(generatedReportsRoot, 'latest.md'), report);
  }
  console.log(report);
} else {
  console.error('Usage: bun bench/cli.ts <preflight|smoke|compare|report> [options]');
  process.exitCode = 1;
}
} catch (error) {
  console.error(`Benchmark error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
