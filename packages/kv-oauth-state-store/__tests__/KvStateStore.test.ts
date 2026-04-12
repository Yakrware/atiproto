import { describe, it, expect, vi, beforeEach } from "vitest";
import { KvStateStore } from "../src/KvStateStore.js";

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

describe("KvStateStore", () => {
  let kv: ReturnType<typeof createMockKv>;

  beforeEach(() => {
    kv = createMockKv();
  });

  it("uses default prefix and TTL", async () => {
    const store = new KvStateStore(kv as any);
    await store.set("key1", { dpopKey: mockDpopKey, foo: "bar" } as any);

    expect(kv.put).toHaveBeenCalledWith(
      "oauth_state:key1",
      expect.any(String),
      { expirationTtl: 600 },
    );
  });

  it("accepts custom prefix and TTL", async () => {
    const store = new KvStateStore(kv as any, {
      prefix: "custom:",
      ttlSeconds: 120,
    });
    await store.set("key1", { dpopKey: mockDpopKey } as any);

    expect(kv.put).toHaveBeenCalledWith("custom:key1", expect.any(String), {
      expirationTtl: 120,
    });
  });

  it("returns undefined for missing key", async () => {
    const store = new KvStateStore(kv as any);
    const result = await store.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("serializes dpopKey as dpopJwk on set and restores on get", async () => {
    const store = new KvStateStore(kv as any);
    const state = { dpopKey: mockDpopKey, extra: "data" } as any;

    await store.set("key1", state);

    // Verify stored JSON has dpopJwk, not dpopKey
    const storedJson = JSON.parse((kv.put as any).mock.calls[0][1] as string);
    expect(storedJson.dpopJwk).toEqual(mockDpopKey.privateJwk);
    expect(storedJson.dpopKey).toBeUndefined();
    expect(storedJson.extra).toBe("data");

    // Verify get restores dpopKey from dpopJwk
    const result = await store.get("key1");
    expect(result).toBeDefined();
    expect((result as any).extra).toBe("data");
    expect((result as any).dpopKey.restored).toBe(true);
  });

  it("deletes a key with prefix", async () => {
    const store = new KvStateStore(kv as any);
    await store.del("key1");
    expect(kv.delete).toHaveBeenCalledWith("oauth_state:key1");
  });
});
