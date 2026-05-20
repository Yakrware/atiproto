import type { SimpleStore } from "@atproto-labs/simple-store";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";
import {
  createFetchRecordResolver,
  type FetchRecordResolverOptions,
} from "./createFetchRecordResolver.js";
import type { RecordMap, RecordResolver } from "./types.js";

export interface CachedRecordResolverOptions
  extends FetchRecordResolverOptions {
  /**
   * Cache keyed by full `at://` URI. Defaults to an in-memory store
   * with a 24-hour TTL bounded at 1000 entries. Proof records are
   * content-addressed by their strongRef CID, so caching by URI is
   * safe for an unlimited duration.
   */
  cache?: SimpleStore<string, RecordMap>;
}

/**
 * Builds a RecordResolver that wraps `createFetchRecordResolver` with
 * a `SimpleStore` cache. Safe by virtue of content-addressed
 * strongRefs.
 */
export function createCachedRecordResolver(
  options: CachedRecordResolverOptions = {},
): RecordResolver {
  const fetcher = createFetchRecordResolver(options);
  const cache =
    options.cache ??
    new SimpleStoreMemory<string, RecordMap>({
      ttl: 86_400_000,
      ttlAutopurge: true,
      max: 1000,
    });

  return async (uri) => {
    const cached = await cache.get(uri);
    if (cached) return cached;
    const record = await fetcher(uri);
    void Promise.resolve(cache.set(uri, record)).catch(() => {});
    return record;
  };
}
