import { parseDidKey } from "@atiproto/atproto-attestation";
import type { KeyResolver } from "./types.js";

/**
 * Builds a KeyResolver that parses bare `did:key:` references locally
 * and rejects everything else. No network I/O. Matches the behavior of
 * the default resolver baked into `verify`.
 */
export function createDidKeyResolver(): KeyResolver {
  return (ref) => {
    if (!ref.startsWith("did:key:")) {
      throw new Error(
        `createDidKeyResolver only handles did:key (got: ${ref})`,
      );
    }
    return parseDidKey(ref);
  };
}
