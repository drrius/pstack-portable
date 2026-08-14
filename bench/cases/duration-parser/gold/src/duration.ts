const multipliers = { h: 3600, m: 60, s: 1 } as const;

export function parseDuration(input: string): number {
  if (!/^(?:[1-9]\d*h)?(?:[1-9]\d*m)?(?:[1-9]\d*s)?$/.test(input) || input.length === 0) throw new Error('Invalid duration');
  let total = 0;
  for (const match of input.matchAll(/([1-9]\d*)([hms])/g)) total += Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
  return total;
}
