import { describe, expect, test } from 'bun:test';
import { markdownReport, sanitize, summarize } from './report';
import { loadSuite } from './suite';
import type { ScoreRecord } from './types';

const scores: ScoreRecord[] = [
  { runId: 'a', conditionId: 'cursor-bare', caseId: 'counter-clamp', repetition: 1, passed: false, verifierExitCode: 1, durationMs: 20, toolCalls: 1, failedTools: 0, changedFiles: 1 },
  { runId: 'b', conditionId: 'cursor-native', caseId: 'counter-clamp', repetition: 1, passed: true, verifierExitCode: 0, durationMs: 30, toolCalls: 2, failedTools: 0, changedFiles: 1 }
];

describe('benchmark report', () => {
  test('is deterministic and separates readiness from live claims', () => {
    const suite = loadSuite();
    expect(markdownReport(suite, scores, false)).toBe(markdownReport(suite, scores, false));
    expect(markdownReport(suite, scores, false)).toContain('no live model outcome claims');
  });

  test('summarizes conditions without cross-host ranking', () => {
    const summary = summarize(loadSuite(), scores);
    expect(summary.find((row) => row.conditionId === 'cursor-native')).toMatchObject({ runs: 1, passed: 1, successRate: 1 });
  });

  test('excludes treatment-invalid runs from outcome rates', () => {
    const contaminated = { ...scores[0], validComparison: false };
    const summary = summarize(loadSuite(), [contaminated]);
    expect(summary.find((row) => row.conditionId === 'cursor-bare')).toMatchObject({ runs: 0, invalidTreatmentRuns: 1 });
  });

  test('sanitizes home paths and credential-looking environment values', () => {
    const value = sanitize(['', 'Users', 'example', 'private'].join('/') + ' CURSOR_API_KEY=secret');
    expect(value).toBe('<home>/private CURSOR_API_KEY=<redacted>');
  });
});
