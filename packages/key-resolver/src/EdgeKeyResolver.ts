import { parseDidKey } from "@atiproto/atproto-attestation";
import type { SimpleStore } from "@atproto-labs/simple-store";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";
import { extractKeyFromDidDoc } from "./extractKey.js";
import {
  FetchKeyResolver,
  type FetchKeyResolverOptions,
} from "./FetchKeyResolver.js";
import type { DidDocument, KeyData } from "./types.js";

export interface EdgeKeyResolverOptions extends FetchKeyResolverOptions {
  /**
   * Cache for DID documents. Keyed by full DID string (e.g.
   * `did:plc:abc`). Defaults to an in-memory store with a 1-hour TTL.
   * For Cloudflare Workers, pass a tiered store from
   * `@atiproto/edge-resolver-cache` so docs persist across requests
   * within a colo.
   */
  cache?: SimpleStore<string, DidDocument>;
}

/**
 * `FetchKeyResolver` with a `SimpleStore` cache in front of the DID
 * document fetch. Resolution for the same DID hits the cache; the
 * verification-method lookup itself stays in-process.
 *
 * `did:key:` references are always parsed locally — no fetch, no cache.
 */
export class EdgeKeyResolver {
  private readonly fetcher: FetchKeyResolver;
  private readonly cache: SimpleStore<string, DidDocument>;

  constructor(options: EdgeKeyResolverOptions = {}) {
    this.fetcher = new FetchKeyResolver(options);
    this.cache =
      options.cache ??
      new SimpleStoreMemory<string, DidDocument>({
        ttl: 3_600_000,
        ttlAutopurge: true,
        max: 1000,
      });
  }

  resolve = async (ref: string): Promise<KeyData> => {
    if (ref.startsWith("did:key:")) return parseDidKey(ref);

    const [did, fragment] = ref.split("#");
    if (!did || !fragment) {
      throw new Error(`Cannot resolve key without DID + fragment: ${ref}`);
    }

    let doc = await this.cache.get(did);
    if (!doc) {
      doc = await this.fetcher.fetchDidDocument(did);
      void Promise.resolve(this.cache.set(did, doc)).catch(() => {});
    }
    return extractKeyFromDidDoc(doc, did, fragment);
  };
}
