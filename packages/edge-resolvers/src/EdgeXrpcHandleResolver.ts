/**
 * Edge-compatible XRPC handle resolver for Cloudflare Workers.
 * Calls com.atproto.identity.resolveHandle via fetch to resolve a handle to a DID.
 */
export class EdgeXrpcHandleResolver {
  private serviceUrl: URL;

  constructor(service: string | URL = "https://public.api.bsky.app") {
    this.serviceUrl = new URL(service.toString());
  }

  async resolve(
    handle: string,
    options?: { signal?: AbortSignal; noCache?: boolean },
  ) {
    const url = new URL(
      "/xrpc/com.atproto.identity.resolveHandle",
      this.serviceUrl,
    );
    url.searchParams.set("handle", handle);

    const response = await fetch(url, {
      signal: options?.signal,
      redirect: "follow",
    });

    if (response.status === 400) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to resolve handle: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as { did?: string };
    const did = payload?.did;

    if (typeof did !== "string" || !did.startsWith("did:")) {
      return null;
    }

    return did as `did:plc:${string}` | `did:web:${string}`;
  }
}
