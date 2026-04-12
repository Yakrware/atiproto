import type { SimpleStore, Value, GetOptions } from "@atproto-labs/simple-store";

export interface CacheApiSimpleStoreOptions {
  cacheName?: string;
  prefix?: string;
  ttlSeconds: number;
}

/**
 * SimpleStore backed by the Cloudflare Workers Cache API.
 *
 * Stores values as JSON-serialized Response objects keyed by synthetic URLs.
 * TTL is controlled via Cache-Control max-age headers.
 * Cache is regional (per-colo) and free with no per-operation cost.
 */
export class CacheApiSimpleStore<V extends Value>
  implements SimpleStore<string, V>
{
  private readonly cachePromise: Promise<Cache>;
  private readonly prefix: string;
  private readonly ttlSeconds: number;

  constructor(options: CacheApiSimpleStoreOptions) {
    this.cachePromise = caches.open(options.cacheName ?? "atproto-resolver");
    this.prefix = options.prefix ?? "";
    this.ttlSeconds = options.ttlSeconds;
  }

  private url(key: string): string {
    return `https://cache.internal/${this.prefix}${encodeURIComponent(key)}`;
  }

  async get(key: string, _options?: GetOptions): Promise<V | undefined> {
    const cache = await this.cachePromise;
    const response = await cache.match(this.url(key));
    if (!response) return undefined;
    return response.json() as Promise<V>;
  }

  async set(key: string, value: V): Promise<void> {
    const cache = await this.cachePromise;
    const body = JSON.stringify(value);
    const response = new Response(body, {
      headers: {
        "Cache-Control": `public, max-age=${this.ttlSeconds}`,
        "Content-Type": "application/json",
      },
    });
    await cache.put(this.url(key), response);
  }

  async del(key: string): Promise<void> {
    const cache = await this.cachePromise;
    await cache.delete(this.url(key));
  }
}
