import { describe, expect, test } from 'bun:test';
import { MAX_RETRIES, retryDelay } from './src/retry';

describe('comment cleanup', () => {
  test('preserves behavior and constants', () => {
    expect(MAX_RETRIES).toBe(3);
    expect([retryDelay(0), retryDelay(1), retryDelay(8)]).toEqual([250, 500, 2000]);
  });

  test('removes narration but keeps operational rationale', async () => {
    const source = await Bun.file('./src/retry.ts').text();
    expect(source).not.toContain('Set the max retries');
    expect(source).not.toContain('Return the delay');
    expect(source).toContain('upstream lease expires after 30 seconds');
  });
});
