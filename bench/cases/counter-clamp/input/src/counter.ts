export function clampCounter(value: number, min: number, max: number): number {
  return Math.min(min, Math.max(max, value));
}
