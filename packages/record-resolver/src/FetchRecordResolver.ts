import { parseAtUri, type RecordMap } from "./types.js";

export interface FetchRecordResolverOptions {
  /**
   * Base URL of the relay (or PDS) used to fetch records. Calls land on
   * `${relay}/xrpc/com.atproto.repo.getRecord`. Default:
   * `https://bsky.network`.
   */
  relay?: string;
  /** Request timeout in milliseconds. Default: `3000`. */
  timeout?: number;
  /** Override the global `fetch` (for tests, custom transports). */
  fetch?: typeof fetch;
}

const DEFAULT_RELAY = "https://bsky.network";
const DEFAULT_TIMEOUT = 3000;

/**
 * Resolves `at://` URIs to record values by calling
 * `com.atproto.repo.getRecord` on a configurable relay.
 *
 * Suitable for verifying remote attestations from anywhere with HTTPS —
 * no auth required since proof records are public.
 */
export class FetchRecordResolver {
  private readonly relay: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: FetchRecordResolverOptions = {}) {
    this.relay = options.relay ?? DEFAULT_RELAY;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.fetchImpl = options.fetch ?? fetch;
  }

  resolve = async (uri: string): Promise<RecordMap> => {
    const { repo, collection, rkey } = parseAtUri(uri);

    const url = new URL("/xrpc/com.atproto.repo.getRecord", this.relay);
    url.searchParams.set("repo", repo);
    url.searchParams.set("collection", collection);
    url.searchParams.set("rkey", rkey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await this.fetchImpl(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(
          `getRecord ${repo}/${collection}/${rkey} -> ${res.status}`,
        );
      }
      const body = (await res.json()) as { value?: RecordMap };
      if (!body.value || typeof body.value !== "object") {
        throw new Error(`getRecord response missing value: ${uri}`);
      }
      return body.value;
    } finally {
      clearTimeout(timer);
    }
  };
}
