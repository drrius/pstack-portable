export function parseDuration(input: string): number {
  const match = input.match(/(\d+)([hms])/);
  if (!match) throw new Error('Invalid duration');
  return Number(match[1]) * ({ h: 3600, m: 60, s: 1 }[match[2]] ?? 0);
}
