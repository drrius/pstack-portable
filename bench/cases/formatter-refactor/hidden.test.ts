import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { formatDisplayName } from './src/format';
import { normalizeDisplayName } from './src/normalize';

describe('display-name refactor', () => {
  test('preserves formatting behavior', () => {
    expect(formatDisplayName('  aDA   loveLACE ')).toBe('Ada Lovelace');
    expect(formatDisplayName('GRACE\nHOPPER')).toBe('Grace Hopper');
    expect(formatDisplayName('')).toBe('');
  });

  test('extracts and uses the normalization boundary', () => {
    expect(existsSync('./src/normalize.ts')).toBe(true);
    expect(normalizeDisplayName('  A   B ')).toBe('a b');
    expect(Bun.file('./src/format.ts').text()).resolves.toContain('normalizeDisplayName');
  });
});
