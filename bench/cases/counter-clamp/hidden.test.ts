import { describe, expect, test } from 'bun:test';
import { clampCounter } from './src/counter';

describe('clampCounter', () => {
  test('clamps below and above the interval', () => {
    expect(clampCounter(-4, 0, 10)).toBe(0);
    expect(clampCounter(19, 0, 10)).toBe(10);
  });

  test('preserves interior values and inclusive boundaries', () => {
    expect(clampCounter(4, 0, 10)).toBe(4);
    expect(clampCounter(0, 0, 10)).toBe(0);
    expect(clampCounter(10, 0, 10)).toBe(10);
  });

  test('supports negative intervals', () => {
    expect(clampCounter(-8, -5, -1)).toBe(-5);
    expect(clampCounter(-3, -5, -1)).toBe(-3);
  });
});
