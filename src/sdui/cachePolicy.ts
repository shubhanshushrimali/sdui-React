export type CachePolicyName = 'no-cache' | 'cache-first' | 'stale-while-revalidate';

export type CacheDecision =
  | { action: 'use-cache'; revalidate: boolean }
  | { action: 'fetch-network'; keepStaleOnFailure: boolean };

export function isCacheFresh(ttlSeconds: number | undefined, ageMs: number): boolean {
  if (ttlSeconds == null) return true;
  if (ttlSeconds <= 0) return false;
  return ageMs < ttlSeconds * 1000;
}

/**
 * Decides whether a fetch may return the cached screen.
 * `no-cache` never reads or keeps a cached copy.
 * `cache-first` returns a fresh copy and only hits the network when it is missing or expired.
 * `stale-while-revalidate` returns the copy immediately and refreshes in the background once the TTL has passed.
 */
export function decideCache(input: {
  policy: CachePolicyName;
  hasCache: boolean;
  fresh: boolean;
  forceNetwork?: boolean;
}): CacheDecision {
  const bypass = Boolean(input.forceNetwork) || input.policy === 'no-cache' || !input.hasCache;

  if (!bypass && input.policy === 'cache-first' && input.fresh) {
    return { action: 'use-cache', revalidate: false };
  }

  if (!bypass && input.policy === 'stale-while-revalidate') {
    return { action: 'use-cache', revalidate: !input.fresh };
  }

  return {
    action: 'fetch-network',
    keepStaleOnFailure: input.policy !== 'no-cache' && input.hasCache,
  };
}
