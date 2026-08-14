const cache = new Map<string, string>();

export function cacheValue(key: string, value: string): void {
  cache.set(key, value);
}

export function readCached(key: string): string | undefined {
  return cache.get(key);
}
