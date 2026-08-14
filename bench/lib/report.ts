import type { ScoreRecord, Suite } from './types';

export interface ConditionSummary {
  conditionId: string;
  runs: number;
  passed: number;
  successRate: number;
  medianDurationMs: number;
  invalidTreatmentRuns: number;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[midpoint] : Math.round((sorted[midpoint - 1] + sorted[midpoint]) / 2);
}

export function summarize(suite: Suite, scores: ScoreRecord[]): ConditionSummary[] {
  return suite.conditions.map((condition) => {
    const allRecords = scores.filter((score) => score.conditionId === condition.id);
    const records = allRecords.filter((score) => score.validComparison !== false);
    const passed = records.filter((score) => score.passed).length;
    return {
      conditionId: condition.id,
      runs: records.length,
      passed,
      successRate: records.length ? passed / records.length : 0,
      medianDurationMs: median(records.map((score) => score.durationMs)),
      invalidTreatmentRuns: allRecords.length - records.length
    };
  });
}

export function markdownReport(suite: Suite, scores: ScoreRecord[], live: boolean): string {
  const summary = summarize(suite, scores);
  const lines = [
    `# ${suite.suiteId} benchmark report`,
    '',
    live ? 'This report contains live host outcomes.' : 'This readiness sample contains no live model outcome claims.',
    '',
    '| Condition | Valid runs | Invalid treatment | Passed | Success rate | Median time |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...summary.map((row) => `| ${row.conditionId} | ${row.runs} | ${row.invalidTreatmentRuns} | ${row.passed} | ${(row.successRate * 100).toFixed(1)}% | ${row.medianDurationMs} ms |`),
    '',
    '## Uplift interpretation',
    '',
    'Compare assisted minus bare success rate within each host. Do not compare raw host scores as a model ranking unless model versions, budgets, and run settings were controlled.',
    ''
  ];
  return `${lines.join('\n')}\n`;
}

export function sanitize(value: string): string {
  return value
    .replaceAll(process.cwd(), '<repository>')
    .replace(/\/Users\/[A-Za-z0-9._-]+\//g, '<home>/')
    .replace(/(CURSOR_API_KEY|ANTHROPIC_API_KEY|CLAUDE_CODE_OAUTH_TOKEN)=[^\s]+/g, '$1=<redacted>');
}
