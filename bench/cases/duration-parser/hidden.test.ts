import { describe, expect, test } from 'bun:test';
import { parseDuration } from './src/duration';

describe('parseDuration', () => {
  test('parses valid single and compound durations', () => {
    expect(parseDuration('2h')).toBe(7200);
    expect(parseDuration('1h30m')).toBe(5400);
    expect(parseDuration('4m5s')).toBe(245);
    expect(parseDuration('1h2m3s')).toBe(3723);
  });

  test('rejects malformed or ambiguous input', () => {
    for (const input of ['', '0s', '1m2h', '1h2h', '1.5h', '+1h', '1h ', '1x']) {
      expect(() => parseDuration(input)).toThrow();
    }
  });
});
