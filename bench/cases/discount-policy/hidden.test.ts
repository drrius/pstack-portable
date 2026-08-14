import { describe, expect, test } from 'bun:test';
import { discountAmount } from './src/discount';
import { isDiscountEligible } from './src/eligibility';

describe('discount policy', () => {
  test('premium accounts qualify below the threshold', () => {
    const account = { premium: true };
    expect(isDiscountEligible(account, 42)).toBe(true);
    expect(discountAmount(account, 42)).toBe(6.3);
  });

  test('standard accounts qualify at the inclusive threshold', () => {
    const account = { premium: false };
    expect(isDiscountEligible(account, 99.99)).toBe(false);
    expect(discountAmount(account, 99.99)).toBe(0);
    expect(isDiscountEligible(account, 100)).toBe(true);
    expect(discountAmount(account, 100)).toBe(15);
  });

  test('rounds the currency amount to two decimal places', () => {
    expect(discountAmount({ premium: false }, 123.45)).toBe(18.52);
  });
});
