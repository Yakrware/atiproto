import type { Did, DidDocument, AtprotoDid } from "@atproto/did";
import type { SimpleStore } from "@atproto-labs/simple-store";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";
import { CacheApiSimpleStore } from "./CacheApiSimpleStore.js";
import { TieredSimpleStore } from "./TieredSimpleStore.js";

export { CacheApiSimpleStore, type CacheApiSimpleStoreOptions } from "./CacheApiSimpleStore.js";
export { TieredSimpleStore } from "./TieredSimpleStore.js";

// Type aliases matching @atproto-labs conventions
type DidCache = SimpleStore<Did, DidDocument>;
type HandleCache = SimpleStore<string, AtprotoDid | null>;

export interface CreateResolverCacheOptions {
  /** Name for the Cache API namespace. Defaults to "atproto-resolver". */
  cacheName?: string;
}

/**
 * Create a tiered DID document cache: in-memory L1 (1hr TTL, ~50MB max)
 * backed by Cache API L2 (24hr TTL, regional, free).
 */
export function createDidCache(options?: CreateResolverCacheOptions): DidCache {
  return new TieredSimpleStore(
    new SimpleStoreMemory({ ttl: 3_600_000, maxSize: 50 * 1024 * 1024 }),
    new CacheApiSimpleStore({ cacheName: options?.cacheName, prefix: "did:", ttlSeconds: 86_400 }),
  );
}

/**
 * Create a tiered handle resolution cache: in-memory L1 (10min TTL, 1000 entries max)
 * backed by Cache API L2 (1hr TTL, regional, free).
 */
export function createHandleCache(options?: CreateResolverCacheOptions): HandleCache {
  return new TieredSimpleStore(
    new SimpleStoreMemory({ max: 1000, ttl: 600_000 }),
    new CacheApiSimpleStore({ cacheName: options?.cacheName, prefix: "handle:", ttlSeconds: 3_600 }),
  );
}
