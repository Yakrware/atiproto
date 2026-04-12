import type { Session } from "@atproto/oauth-client";
import type { Jwk } from "@atproto/jwk";
import { JoseKey } from "@atproto/jwk-jose";

type SavedSession = Omit<Session, "dpopKey"> & { dpopJwk: Jwk };

export interface KvSessionStoreOptions {
  prefix?: string;
  ttlSeconds?: number;
}

/**
 * Cloudflare KV-backed session store for @atproto/oauth-client.
 * Stores OAuth sessions with DPoP keys serialized as JWK.
 */
export class KvSessionStore {
  private kv: KVNamespace;
  private prefix: string;
  private ttlSeconds: number;

  constructor(kv: KVNamespace, options: KvSessionStoreOptions = {}) {
    this.kv = kv;
    this.prefix = options.prefix ?? "oauth_session:";
    this.ttlSeconds = options.ttlSeconds ?? 7 * 24 * 60 * 60; // 7 days
  }

  async get(key: string): Promise<Session | undefined> {
    const raw = await this.kv.get(`${this.prefix}${key}`);
    if (!raw) return undefined;
    const { dpopJwk, ...rest } = JSON.parse(raw) as SavedSession;
    return { ...rest, dpopKey: await JoseKey.fromJWK(dpopJwk) };
  }

  async set(key: string, value: Session) {
    const { dpopKey, ...rest } = value;
    const saved: SavedSession = { ...rest, dpopJwk: dpopKey.privateJwk! };
    await this.kv.put(`${this.prefix}${key}`, JSON.stringify(saved), {
      expirationTtl: this.ttlSeconds,
    });
  }

  async del(key: string) {
    await this.kv.delete(`${this.prefix}${key}`);
  }
}
