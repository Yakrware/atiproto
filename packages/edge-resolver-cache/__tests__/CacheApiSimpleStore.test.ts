import { describe, it, expect, vi, beforeEach } from "vitest";
import { CacheApiSimpleStore } from "../src/CacheApiSimpleStore.js";

function createMockCache() {
  const store = new Map<string, Response>();
  return {
    match: vi.fn(async (url: string) => {
      const resp = store.get(url);
      if (!resp) return undefined;
      // Clone so body can be consumed again
      return resp.clone();
    }),
    put: vi.fn(async (url: string, response: Response) => {
      store.set(url, response.clone());
    }),
    delete: vi.fn(async (url: string) => {
      return store.delete(url);
    }),
  };
}

// Mock globalThis.caches
const mockCache = createMockCache();
vi.stubGlobal("caches", {
  open: vi.fn(async () => mockCache),
});

describe("CacheApiSimpleStore", () => {
  beforeEach(() => {
    mockCache.match.mockClear();
    mockCache.put.mockClear();
    mockCache.delete.mockClear();
  });

  it("returns undefined for missing keys", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 3600 });
    const result = await store.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("stores and retrieves a value", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 3600, prefix: "test:" });
    await store.set("key1", { foo: "bar" });
    const result = await store.get("key1");
    expect(result).toEqual({ foo: "bar" });
  });

  it("stores null values correctly", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 3600 });
    await store.set("key1", null);
    const result = await store.get("key1");
    expect(result).toBeNull();
  });

  it("uses correct Cache-Control header for TTL", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 7200, prefix: "did:" });
    await store.set("test-did", { id: "did:plc:test" });

    const putCall = mockCache.put.mock.calls[0];
    const response = putCall[1] as Response;
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=7200");
  });

  it("constructs correct URL with prefix and encoding", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 3600, prefix: "did:" });
    await store.get("did:plc:test123");

    expect(mockCache.match).toHaveBeenCalledWith(
      "https://cache.internal/did:did%3Aplc%3Atest123"
    );
  });

  it("deletes a key", async () => {
    const store = new CacheApiSimpleStore({ ttlSeconds: 3600, prefix: "x:" });
    await store.set("key1", "value");
    await store.del("key1");
    expect(mockCache.delete).toHaveBeenCalledWith(
      "https://cache.internal/x:key1"
    );
  });

  it("opens a named cache", async () => {
    const _store = new CacheApiSimpleStore({ cacheName: "my-cache", ttlSeconds: 60 });
    // Trigger the cache promise
    await _store.get("anything");
    expect((caches.open as any)).toHaveBeenCalledWith("my-cache");
  });
});
