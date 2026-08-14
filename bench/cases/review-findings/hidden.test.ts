import { describe, expect, test } from 'bun:test';

describe('review findings', () => {
  test('finds the async completion defect and avoids false positives', async () => {
    const report = await Bun.file('./review.json').json();
    expect(report).toEqual({ findings: [{ id: 'runBatch-does-not-await-workers', severity: 'high' }] });
  });

  test('does not modify reviewed source', async () => {
    const status = Bun.spawnSync(['git', 'status', '--porcelain', '--', 'src'], { cwd: process.cwd() });
    expect(status.stdout.toString()).toBe('');
  });
});
