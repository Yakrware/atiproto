import { parseDidKey } from "@atiproto/atproto-attestation";
import type { SimpleStore } from "@atproto-labs/simple-store";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";
import {
  createDidDocumentFetcher,
  type FetchKeyResolverOptions,
} from "./createFetchKeyResolver.js";
import { extractKeyFromDidDoc } from "./extractKey.js";
import type { DidDocument, KeyResolver } from "./types.js";

export interface CachedKeyResolverOptions extends FetchKeyResolverOptions {
  /**
   * Cache keyed by full DID string (e.g. `did:plc:abc`). Defaults to
   * an in-memory store with a 1-hour TTL bounded at 1000 entries. On
   * Cloudflare Workers, pass a tiered store from
   * `@atiproto/edge-resolver-cache` so documents persist across
   * requests within a colo.
   */
  cache?: SimpleStore<string, DidDocument>;
}

/**
 * Builds a KeyResolver that wraps the network fetch with a
 * `SimpleStore` cache. `did:key:` references skip the cache entirely.
 */
export function createCachedKeyResolver(
  options: CachedKeyResolverOptions = {},
): KeyResolver {
  const fetchDoc = createDidDocumentFetcher(options);
  const cache =
    options.cache ??
    new SimpleStoreMemory<string, DidDocument>({
      ttl: 3_600_000,
      ttlAutopurge: true,
      max: 1000,
    });

  return async (ref) => {
    if (ref.startsWith("did:key:")) return parseDidKey(ref);
    const [did, fragment] = ref.split("#");
    if (!did || !fragment) {
      throw new Error(`Cannot resolve key without DID + fragment: ${ref}`);
    }
    let doc = await cache.get(did);
    if (!doc) {
      doc = await fetchDoc(did);
      void Promise.resolve(cache.set(did, doc)).catch(() => {});
    }
    return extractKeyFromDidDoc(doc, did, fragment);
  };
}
