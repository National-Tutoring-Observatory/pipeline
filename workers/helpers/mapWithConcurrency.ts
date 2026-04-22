const DEFAULT_CONCURRENCY = 10;

export default async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = DEFAULT_CONCURRENCY,
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += concurrency) {
    const batch = await Promise.all(
      items.slice(index, index + concurrency).map(fn),
    );
    results.push(...batch);
  }

  return results;
}
