export interface Account {
  premium: boolean;
}

export function isDiscountEligible(account: Account, subtotal: number): boolean {
  return subtotal >= 0 && (account.premium || subtotal >= 100);
}
