import { describe, expect, test } from 'bun:test';
import { buildMatrix, displayPlan } from './runner';
import { loadSuite } from './suite';

describe('host command adapters', () => {
  test('build one deterministic plan for every condition and case', () => {
    const suite = loadSuite();
    const first = buildMatrix(suite, { repetitions: 1 }).map(displayPlan);
    const second = buildMatrix(suite, { repetitions: 1 }).map(displayPlan);
    expect(first).toEqual(second);
    expect(first).toHaveLength(suite.conditions.length * suite.cases.length);
  });

  test('only native Cursor receives the native plugin flag', () => {
    const plans = buildMatrix(loadSuite(), { repetitions: 1, caseIds: ['counter-clamp'] });
    for (const plan of plans) {
      expect(plan.command.includes('--plugin-dir')).toBe(plan.condition.id === 'cursor-native');
    }
  });

  test('bare conditions do not reference portable skill roots', () => {
    const plans = buildMatrix(loadSuite(), { repetitions: 1, caseIds: ['counter-clamp'] });
    for (const plan of plans.filter((candidate) => candidate.condition.pstack === 'none')) {
      expect(plan.command.join('\n')).not.toContain('/skills/');
      expect(plan.environment.HOME ?? '').not.toContain('.agents');
      expect(plan.environment.HOME ?? '').not.toContain('.claude/skills');
    }
  });

  test('Cursor plans isolate plugin state while retaining subscription HOME', () => {
    const plans = buildMatrix(loadSuite(), { repetitions: 1, conditionIds: ['cursor-bare', 'cursor-native'], caseIds: ['counter-clamp'] });
    for (const plan of plans) {
      expect(plan.environment.CURSOR_DATA_DIR).toContain('/home/cursor-data');
      expect(plan.environment.CURSOR_CONFIG_DIR).toContain('/home/cursor-config');
    }
  });
});
