import { normalizeDisplayName } from './normalize';

export function formatDisplayName(input: string): string {
  return normalizeDisplayName(input).replace(/\b\w/g, (letter) => letter.toUpperCase());
}
