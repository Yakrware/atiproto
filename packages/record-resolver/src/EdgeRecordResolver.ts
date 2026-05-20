import type { SimpleStore } from "@atproto-labs/simple-store";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";
import {
  FetchRecordResolver,
  type FetchRecordResolverOptions,
} from "./FetchRecordResolver.js";
import type { RecordMap } from "./types.js";

export interface EdgeRecordResolverOptions extends FetchRecordResolverOptions {
  /**
   * Cache keyed by full `at://` URI. Defaults to an in-memory store
   * with a 24-hour TTL. For Cloudflare Workers, pass a tiered store
   * (e.g. memory + CacheApiStore from `@atiproto/edge-resolver-cache`)
   * so proof records persist across requests within a colo.
   *
   * Caching is safe because proof records are content-addressed by
   * their strongRef CID — once written, the value at a URI never
   * changes.
   */
  cache?: SimpleStore<string, RecordMap>;
}

/**
 * `FetchRecordResolver` with a `SimpleStore` cache in front of the
 * `getRecord` call. The default cache is in-memory; pass a tiered
 * store for cross-request persistence on the edge.
 */
export class EdgeRecordResolver {
  private readonly fetcher: FetchRecordResolver;
  private readonly cache: SimpleStore<string, RecordMap>;

  constructor(options: EdgeRecordResolverOptions = {}) {
    this.fetcher = new FetchRecordResolver(options);
    this.cache =
      options.cache ??
      new SimpleStoreMemory<string, RecordMap>({
        ttl: 86_400_000,
        ttlAutopurge: true,
        max: 1000,
      });
  }

  resolve = async (uri: string): Promise<RecordMap> => {
    const cached = await this.cache.get(uri);
    if (cached) return cached;

    const record = await this.fetcher.resolve(uri);
    void Promise.resolve(this.cache.set(uri, record)).catch(() => {});
    return record;
  };
}
