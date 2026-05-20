import { parseAtUri, type RecordMap, type RecordResolver } from "./types.js";

export interface FetchRecordResolverOptions {
  /**
   * Base URL of the relay (or PDS) used to fetch records. Calls land
   * on `${relay}/xrpc/com.atproto.repo.getRecord`. Default:
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
 * Builds a RecordResolver that calls `com.atproto.repo.getRecord` on a
 * configurable relay (or PDS) over plain `fetch`. No auth.
 */
export function createFetchRecordResolver(
  options: FetchRecordResolverOptions = {},
): RecordResolver {
  const relay = options.relay ?? DEFAULT_RELAY;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const fetchImpl = options.fetch ?? fetch;

  return async (uri) => {
    const { repo, collection, rkey } = parseAtUri(uri);

    const url = new URL("/xrpc/com.atproto.repo.getRecord", relay);
    url.searchParams.set("repo", repo);
    url.searchParams.set("collection", collection);
    url.searchParams.set("rkey", rkey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetchImpl(url, {
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
