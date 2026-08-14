// Set the max retries to 3.
export const MAX_RETRIES = 3;

export function retryDelay(attempt: number): number {
  // Cap retries because the upstream lease expires after 30 seconds; longer backoff can apply work after ownership is lost.
  const bounded = Math.min(attempt, MAX_RETRIES);
  // Return the delay.
  return 250 * 2 ** bounded;
}
