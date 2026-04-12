import { describe, it, expect, vi, beforeEach } from "vitest";
import { KvSessionStore } from "../src/KvSessionStore.js";

function createMockKv() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
}

const mockDpopKey = {
  privateJwk: { kty: "EC", crv: "P-256", x: "x", y: "y", d: "d" },
};

vi.mock("@atproto/jwk-jose", () => ({
  JoseKey: {
    fromJWK: vi.fn(async (jwk: any) => ({ privateJwk: jwk, restored: true })),
  },
}));

describe("KvSessionStore", () => {
  let kv: ReturnType<typeof createMockKv>;

  beforeEach(() => {
    kv = createMockKv();
  });

  it("uses default prefix and TTL (7 days)", async () => {
    const store = new KvSessionStore(kv as any);
    await store.set("sess1", { dpopKey: mockDpopKey } as any);

    expect(kv.put).toHaveBeenCalledWith(
      "oauth_session:sess1",
      expect.any(String),
      { expirationTtl: 604800 },
    );
  });

  it("accepts custom prefix and TTL", async () => {
    const store = new KvSessionStore(kv as any, {
      prefix: "my_sess:",
      ttlSeconds: 3600,
    });
    await store.set("sess1", { dpopKey: mockDpopKey } as any);

    expect(kv.put).toHaveBeenCalledWith("my_sess:sess1", expect.any(String), {
      expirationTtl: 3600,
    });
  });

  it("returns undefined for missing key", async () => {
    const store = new KvSessionStore(kv as any);
    const result = await store.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("round-trips session data with dpopKey serialization", async () => {
    const store = new KvSessionStore(kv as any);
    await store.set("sess1", {
      dpopKey: mockDpopKey,
      tokenSet: { access_token: "abc" },
    } as any);

    const result = await store.get("sess1");
    expect(result).toBeDefined();
    expect((result as any).tokenSet.access_token).toBe("abc");
    expect((result as any).dpopKey.restored).toBe(true);
    expect((result as any).dpopJwk).toBeUndefined();
  });

  it("deletes a key with prefix", async () => {
    const store = new KvSessionStore(kv as any);
    await store.del("sess1");
    expect(kv.delete).toHaveBeenCalledWith("oauth_session:sess1");
  });
});
