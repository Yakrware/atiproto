import type { InternalStateData } from "@atproto/oauth-client";
import type { Jwk } from "@atproto/jwk";
import { JoseKey } from "@atproto/jwk-jose";

type SavedState = Omit<InternalStateData, "dpopKey"> & { dpopJwk: Jwk };

export interface KvStateStoreOptions {
  prefix?: string;
  ttlSeconds?: number;
}

/**
 * Cloudflare KV-backed state store for @atproto/oauth-client.
 * Stores OAuth authorization state with DPoP keys serialized as JWK.
 */
export class KvStateStore {
  private kv: KVNamespace;
  private prefix: string;
  private ttlSeconds: number;

  constructor(kv: KVNamespace, options: KvStateStoreOptions = {}) {
    this.kv = kv;
    this.prefix = options.prefix ?? "oauth_state:";
    this.ttlSeconds = options.ttlSeconds ?? 600; // 10 minutes
  }

  async get(key: string): Promise<InternalStateData | undefined> {
    const raw = await this.kv.get(`${this.prefix}${key}`);
    if (!raw) return undefined;
    const { dpopJwk, ...rest } = JSON.parse(raw) as SavedState;
    return { ...rest, dpopKey: await JoseKey.fromJWK(dpopJwk) };
  }

  async set(key: string, value: InternalStateData) {
    const { dpopKey, ...rest } = value;
    const saved: SavedState = { ...rest, dpopJwk: dpopKey.privateJwk! };
    await this.kv.put(`${this.prefix}${key}`, JSON.stringify(saved), {
      expirationTtl: this.ttlSeconds,
    });
  }

  async del(key: string) {
    await this.kv.delete(`${this.prefix}${key}`);
  }
}
