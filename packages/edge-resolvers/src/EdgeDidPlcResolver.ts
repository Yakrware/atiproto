import { DidPlcResolver } from "@atproto/identity";
import { timed } from "./timed.js";

/**
 * Edge-compatible PLC DID resolver that uses the global fetch API
 * instead of Node.js HTTP, making it suitable for Cloudflare Workers.
 */
export class EdgeDidPlcResolver extends DidPlcResolver {
  async resolveNoCheck(did: string) {
    return timed(this.timeout, async (signal) => {
      const url = new URL(`/${encodeURIComponent(did)}`, this.plcUrl);
      const res = await fetch(url, {
        redirect: "follow",
        headers: { accept: "application/did+ld+json,application/json" },
        signal,
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        throw Object.assign(new Error(res.statusText), { status: res.status });
      }
      return res.json();
    });
  }
}
