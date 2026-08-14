export const MAX_RETRIES = 3;

export function retryDelay(attempt: number): number {
  const bounded = Math.min(attempt, MAX_RETRIES);
  return 250 * 2 ** bounded;
}
