/**
 * Patch globalThis.Request to strip the `cache` property from init options.
 *
 * Cloudflare Workers' Request constructor doesn't support the `cache` property,
 * but @atproto/oauth-client uses `new Request(url, { cache: ... })` which throws
 * on Workers. Call this function at the top of your worker entrypoint.
 */
export function patchGlobalRequestObject() {
  const OriginalRequest = globalThis.Request;
  globalThis.Request = class PatchedRequest extends OriginalRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      if (init && "cache" in init) {
        const { cache: _, ...rest } = init;
        super(input, rest);
      } else {
        super(input, init);
      }
    }
  } as typeof Request;
}
