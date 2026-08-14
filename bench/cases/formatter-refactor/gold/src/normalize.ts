export function normalizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, ' ').toLowerCase();
}
