export async function runBatch<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  items.forEach(async (item) => worker(item));
}
