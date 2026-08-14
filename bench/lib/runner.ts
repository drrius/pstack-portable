import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildRunPlan, configureWorkspace } from './adapters';
import { prepareWorkspace, scoreWorkspace } from './cases';
import { runsRoot } from './paths';
import { resolveNativePlugin } from './preflight';
import { normalizeTrace } from './normalize';
import { validateScore } from './suite';
import type { RunPlan, ScoreRecord, Suite } from './types';
import type { Host } from './types';

export interface MatrixOptions {
  repetitions?: number;
  conditionIds?: string[];
  caseIds?: string[];
  model?: string;
  models?: Partial<Record<Host, string>>;
}

export function buildMatrix(suite: Suite, options: MatrixOptions = {}): RunPlan[] {
  const repetitions = options.repetitions ?? suite.defaultRepetitions;
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 20) throw new Error('Repetitions must be between 1 and 20');
  const conditions = options.conditionIds?.length ? suite.conditions.filter((condition) => options.conditionIds!.includes(condition.id)) : suite.conditions;
  const cases = options.caseIds?.length ? suite.cases.filter((caseId) => options.caseIds!.includes(caseId)) : suite.cases;
  if (!conditions.length || conditions.length !== new Set(options.conditionIds ?? conditions.map((value) => value.id)).size) throw new Error('Unknown or duplicate condition selection');
  if (!cases.length || cases.length !== new Set(options.caseIds ?? cases).size) throw new Error('Unknown or duplicate case selection');
  const nativePluginPath = resolveNativePlugin(suite);
  const plans: RunPlan[] = [];
  for (const condition of conditions) {
    for (const caseId of cases) {
      for (let repetition = 1; repetition <= repetitions; repetition += 1) {
        const runId = `${suite.suiteId}--${condition.id}--${caseId}--r${repetition}`;
        const root = join(runsRoot, runId);
        plans.push(buildRunPlan(suite.suiteId, condition, caseId, repetition, {
          workspace: join(root, 'workspace'),
          isolatedHome: join(root, 'home'),
          tracePath: join(root, 'trace.jsonl'),
          nativePluginPath,
          model: options.models?.[condition.host] ?? options.model
        }));
      }
    }
  }
  return plans;
}

export function displayPlan(plan: RunPlan): object {
  const root = join(runsRoot, plan.runId);
  const displayedRoot = `<runs>/${plan.runId}`;
  const pluginIndex = plan.command.indexOf('--plugin-dir');
  return {
    runId: plan.runId,
    condition: plan.condition.id,
    case: plan.caseId,
    repetition: plan.repetition,
    workspace: `<runs>/${plan.runId}/workspace`,
    command: plan.command.map((argument, index) => index === pluginIndex + 1 ? '<native-plugin>' : argument.replace(root, displayedRoot)),
    environment: Object.fromEntries(Object.entries(plan.environment).map(([key, value]) => {
      const displayedValue = key === 'CODEX_HOME' ? '<credential-home>' : value.replace(root, displayedRoot);
      return [key, displayedValue];
    }))
  };
}

export function executePlan(plan: RunPlan, timeoutMs: number): ScoreRecord {
  const runRoot = join(runsRoot, plan.runId);
  if (!resolve(runRoot).startsWith(`${resolve(runsRoot)}/`)) throw new Error(`Unsafe run root: ${runRoot}`);
  if (existsSync(runRoot)) rmSync(runRoot, { recursive: true });
  mkdirSync(join(runRoot, 'home'), { recursive: true });
  prepareWorkspace(plan.caseId, plan.workspace);
  configureWorkspace(plan.condition, {
    workspace: plan.workspace,
    isolatedHome: join(runRoot, 'home'),
    tracePath: plan.tracePath,
    nativePluginPath: plan.condition.pstack === 'native' ? plan.command[plan.command.indexOf('--plugin-dir') + 1] : undefined
  });
  const started = performance.now();
  const result = spawnSync(plan.command[0], plan.command.slice(1), {
    cwd: plan.workspace,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, ...plan.environment }
  });
  const durationMs = Math.round(performance.now() - started);
  const trace = `${result.stdout || ''}${result.stderr || ''}`;
  writeFileSync(plan.tracePath, trace);
  const events = normalizeTrace(plan.condition.host, trace);
  const pstackEvidence = events.some((event) => /(?:poteto-mode|pstack-portable|\/pstack\/skills)/i.test([event.text, event.tool, event.rawType].filter(Boolean).join(' ')));
  const treatmentExpected = plan.condition.pstack !== 'none';
  const modelIndex = plan.command.indexOf('--model');
  const requestedModel = modelIndex >= 0 ? plan.command[modelIndex + 1] : undefined;
  const actualModel = events.find((event) => event.model)?.model;
  const score = scoreWorkspace(plan.caseId, plan.workspace);
  const changed = spawnSync('git', ['status', '--porcelain'], { cwd: plan.workspace, encoding: 'utf8' });
  const record: ScoreRecord = {
    runId: plan.runId,
    conditionId: plan.condition.id,
    caseId: plan.caseId,
    repetition: plan.repetition,
    passed: score.passed,
    verifierExitCode: score.exitCode,
    durationMs,
    toolCalls: events.filter((event) => event.kind === 'tool').length,
    failedTools: events.filter((event) => event.kind === 'error').length,
    changedFiles: (changed.stdout || '').split(/\r?\n/).filter(Boolean).filter((line) => !line.includes('.pstack-bench')).length,
    treatmentObserved: pstackEvidence,
    baselineContaminated: !treatmentExpected && pstackEvidence,
    validComparison: treatmentExpected ? pstackEvidence : !pstackEvidence,
    requestedModel,
    actualModel,
    error: result.error ? result.error.message : result.status === 0 ? undefined : `Host exited ${result.status ?? 'without a status'}`
  };
  validateScore(record);
  writeFileSync(join(runRoot, 'score.json'), `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

export function readScores(): ScoreRecord[] {
  if (!existsSync(runsRoot)) return [];
  const glob = new Bun.Glob('*/score.json');
  return [...glob.scanSync({ cwd: runsRoot })].sort().map((path) => JSON.parse(readFileSync(join(runsRoot, path), 'utf8')) as ScoreRecord);
}
