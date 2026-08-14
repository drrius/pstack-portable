import { type Account, isDiscountEligible } from './eligibility';

export function discountAmount(account: Account, subtotal: number): number {
  if (!isDiscountEligible(account, subtotal)) return 0;
  return Math.round(subtotal * 0.1);
}
