export type SearchState<T> =
  | { status: 'idle' | 'loading' | 'error'; query: string }
  | { status: 'success'; query: string; data: T[] };

/** Cancels both the debounce and in-flight response when the keyword changes. */
export function scheduleDestinationSearch<T>(
  keyword: string,
  request: (query: string, signal: AbortSignal) => Promise<T[]>,
  onState: (state: SearchState<T>) => void,
  delay = 300,
): () => void {
  const query = keyword.trim();
  const controller = new AbortController();
  if (query.length < 2) {
    onState({ status: 'idle', query });
    return () => controller.abort();
  }
  onState({ status: 'loading', query });
  const timer = setTimeout(async () => {
    try {
      const data = await request(query, controller.signal);
      if (!controller.signal.aborted) onState({ status: 'success', query, data });
    } catch {
      if (!controller.signal.aborted) onState({ status: 'error', query });
    }
  }, delay);
  return () => { clearTimeout(timer); controller.abort(); };
}

export function removeDestinationFilter(
  params: URLSearchParams,
  key: string,
  categoryId?: number,
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete('page');
  if (key === 'categoryIds' && categoryId !== undefined) {
    const ids = [...new Set([params.get('categoryIds'), params.get('categoryId')]
      .flatMap((value) => value?.split(',') ?? [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0 && id !== categoryId))];
    next.delete('categoryId');
    if (ids.length) next.set('categoryIds', ids.join(','));
    else next.delete('categoryIds');
    if (ids.length < 2) next.delete('categoryMatch');
  } else {
    next.delete(key);
  }
  return next;
}
