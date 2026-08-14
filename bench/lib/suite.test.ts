import { describe, expect, test } from 'bun:test';
import { loadSuite, validateScore, validateSuite } from './suite';

describe('benchmark suite contract', () => {
  test('loads the exact six-condition inventory', () => {
    const suite = loadSuite();
    expect(suite.conditions.map((condition) => condition.id).sort()).toEqual([
      'claude-bare', 'claude-portable', 'codex-bare', 'codex-portable', 'cursor-bare', 'cursor-native'
    ]);
  });

  test('rejects duplicates and unsafe case paths', () => {
    const suite = loadSuite();
    expect(() => validateSuite({ ...suite, conditions: [...suite.conditions.slice(0, 5), suite.conditions[0]] })).toThrow();
    expect(() => validateSuite({ ...suite, cases: ['../counter-clamp', 'discount-policy'] })).toThrow();
  });

  test('rejects scores whose pass state disagrees with the verifier', () => {
    expect(() => validateScore({
      runId: 'run', conditionId: 'cursor-bare', caseId: 'case', repetition: 1,
      passed: true, verifierExitCode: 1, durationMs: 0, toolCalls: 0, failedTools: 0, changedFiles: 0
    })).toThrow('disagrees');
  });
});
