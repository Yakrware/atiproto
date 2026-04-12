import { DidResolver, type DidResolverOpts } from "@atproto/identity";
import { EdgeDidPlcResolver } from "./EdgeDidPlcResolver.js";
import { EdgeDidWebResolver } from "./EdgeDidWebResolver.js";

/**
 * Edge-compatible DID resolver that handles both did:plc and did:web methods.
 * Uses the global fetch API, suitable for Cloudflare Workers and other edge runtimes.
 */
export class EdgeDidResolver extends DidResolver {
  constructor(opts: DidResolverOpts = {}) {
    super(opts);
    const { timeout = 3000, plcUrl = "https://plc.directory" } = opts;
    this.methods = new Map([
      ["plc", new EdgeDidPlcResolver(plcUrl, timeout)],
      ["web", new EdgeDidWebResolver(timeout)],
    ]);
  }

  /**
   * Resolve a DID to a handle by looking up the DID document's alsoKnownAs field.
   * Falls back to the DID string if resolution fails.
   */
  async resolveHandle(did: string): Promise<string> {
    try {
      const doc = await this.resolve(did);
      if (doc?.alsoKnownAs?.[0]) {
        const aka = doc.alsoKnownAs[0];
        if (aka.startsWith("at://")) {
          return aka.slice(5);
        }
      }
    } catch {
      // Fall back to DID
    }
    return did;
  }

  /**
   * Return an adapter satisfying the @atproto-labs/did-resolver DidResolver
   * interface, suitable for passing to OAuthClient as `didResolver`.
   */
  asOAuthResolver() {
    return {
      resolve: (did: string, options?: { noCache?: boolean }) =>
        this.resolve(did, options?.noCache ?? false) as any,
    };
  }
}
