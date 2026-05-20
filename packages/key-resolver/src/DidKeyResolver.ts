import { parseDidKey } from "@atiproto/atproto-attestation";
import type { KeyData } from "./types.js";

/**
 * Resolves bare `did:key:` references by parsing the multibase encoding
 * locally. Does not perform any network I/O. This is the same behavior
 * as the default resolver baked into `verify`, exposed as an explicit
 * class so consumers can compose it with other resolvers.
 */
export class DidKeyResolver {
  resolve = (ref: string): KeyData => {
    if (!ref.startsWith("did:key:")) {
      throw new Error(`DidKeyResolver only handles did:key (got: ${ref})`);
    }
    return parseDidKey(ref);
  };
}
