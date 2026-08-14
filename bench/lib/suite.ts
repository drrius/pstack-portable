import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { casesRoot, suitePath } from './paths';
import type { Condition, ScoreRecord, Suite } from './types';

const hosts = new Set(['cursor', 'codex', 'claude']);
const modes = new Set(['none', 'native', 'portable']);

export function validateSuite(value: unknown): asserts value is Suite {
  if (!value || typeof value !== 'object') throw new Error('Suite must be an object');
  const suite = value as Suite;
  if (suite.schemaVersion !== 1) throw new Error('Unsupported suite schema version');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(suite.suiteId)) throw new Error('Invalid suite ID');
  if (!Number.isInteger(suite.defaultRepetitions) || suite.defaultRepetitions < 1) throw new Error('Invalid repetition count');
  if (!Array.isArray(suite.conditions) || suite.conditions.length !== 6) throw new Error('Suite must define exactly six conditions');
  const ids = new Set<string>();
  for (const condition of suite.conditions) {
    if (!condition || typeof condition !== 'object') throw new Error('Invalid condition');
    if (!/^[a-z0-9][a-z0-9-]*$/.test(condition.id) || ids.has(condition.id)) throw new Error(`Invalid or duplicate condition ID: ${condition.id}`);
    if (!hosts.has(condition.host) || !modes.has(condition.pstack)) throw new Error(`Invalid condition: ${condition.id}`);
    if (condition.host === 'cursor' && !['none', 'native'].includes(condition.pstack)) throw new Error(`Invalid Cursor mode: ${condition.pstack}`);
    if (condition.host !== 'cursor' && !['none', 'portable'].includes(condition.pstack)) throw new Error(`Invalid portable mode: ${condition.id}`);
    ids.add(condition.id);
  }
  const expected = ['claude-bare', 'claude-portable', 'codex-bare', 'codex-portable', 'cursor-bare', 'cursor-native'];
  if (JSON.stringify([...ids].sort()) !== JSON.stringify(expected)) throw new Error('Suite condition inventory does not match the six-condition contract');
  if (!Array.isArray(suite.cases) || suite.cases.length < 2 || new Set(suite.cases).size !== suite.cases.length) throw new Error('Suite needs at least two unique cases');
  for (const caseId of suite.cases) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(caseId) || isAbsolute(caseId) || !existsSync(join(casesRoot, caseId))) throw new Error(`Invalid or missing case: ${caseId}`);
  }
  const pin = suite.nativeCursor;
  if (!pin || pin.name !== 'pstack' || !/^\d+\.\d+\.\d+$/.test(pin.version) || !/^[a-f0-9]{40}$/.test(pin.commit) || !/^[a-f0-9]{64}$/.test(pin.allowlistDigest)) throw new Error('Invalid native Cursor provenance pin');
}

export function loadSuite(): Suite {
  const value = JSON.parse(readFileSync(suitePath, 'utf8'));
  validateSuite(value);
  return value;
}

export function validateScore(score: ScoreRecord): void {
  if (!score.runId || !score.conditionId || !score.caseId) throw new Error('Score identity is incomplete');
  for (const [name, value] of Object.entries({ repetition: score.repetition, verifierExitCode: score.verifierExitCode, durationMs: score.durationMs, toolCalls: score.toolCalls, failedTools: score.failedTools, changedFiles: score.changedFiles })) {
    if (!Number.isInteger(value) || value < 0) throw new Error(`Invalid score field ${name}`);
  }
  if (score.passed !== (score.verifierExitCode === 0)) throw new Error('Score pass state disagrees with verifier exit code');
}

export function conditionById(suite: Suite, id: string): Condition {
  const condition = suite.conditions.find((candidate) => candidate.id === id);
  if (!condition) throw new Error(`Unknown condition: ${id}`);
  return condition;
}
