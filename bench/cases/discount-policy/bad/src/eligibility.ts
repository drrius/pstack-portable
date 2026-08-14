export interface Account {
  premium: boolean;
}

export function isDiscountEligible(account: Account, subtotal: number): boolean {
  return account.premium || subtotal >= 100;
}
