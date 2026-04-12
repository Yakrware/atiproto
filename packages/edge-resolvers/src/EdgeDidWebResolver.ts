import {
  DidWebResolver,
  PoorlyFormattedDidError,
  UnsupportedDidWebPathError,
} from "@atproto/identity";
import { timed } from "./timed.js";

const DOC_PATH = "/.well-known/did.json";

/**
 * Edge-compatible Web DID resolver that uses the global fetch API
 * instead of Node.js HTTP, making it suitable for Cloudflare Workers.
 */
export class EdgeDidWebResolver extends DidWebResolver {
  async resolveNoCheck(did: string) {
    const parsedId = did.split(":").slice(2).join(":");
    const parts = parsedId.split(":").map(decodeURIComponent);
    let path: string;
    if (parts.length < 1) {
      throw new PoorlyFormattedDidError(did);
    } else if (parts.length === 1) {
      path = parts[0] + DOC_PATH;
    } else {
      throw new UnsupportedDidWebPathError(did);
    }
    const url = new URL(`https://${path}`);
    if (url.hostname === "localhost") {
      url.protocol = "http";
    }
    return timed(this.timeout, async (signal) => {
      const res = await fetch(url, {
        signal,
        redirect: "follow",
        headers: { accept: "application/did+ld+json,application/json" },
      });
      if (!res.ok) return null;
      return res.json();
    });
  }
}
