import { describe, it, expect, vi, beforeEach } from "vitest";
import { TieredSimpleStore } from "../src/TieredSimpleStore.js";

function createMockStore() {
  const data = new Map<string, any>();
  return {
    get: vi.fn(async (key: string) => data.get(key)),
    set: vi.fn(async (key: string, value: any) => { data.set(key, value); }),
    del: vi.fn(async (key: string) => { data.delete(key); }),
    clear: vi.fn(() => { data.clear(); }),
    _data: data,
  };
}

describe("TieredSimpleStore", () => {
  let l1: ReturnType<typeof createMockStore>;
  let l2: ReturnType<typeof createMockStore>;
  let tiered: TieredSimpleStore<string, any>;

  beforeEach(() => {
    l1 = createMockStore();
    l2 = createMockStore();
    tiered = new TieredSimpleStore(l1, l2);
  });

  it("returns undefined when both tiers miss", async () => {
    expect(await tiered.get("missing")).toBeUndefined();
    expect(l1.get).toHaveBeenCalledWith("missing", undefined);
    expect(l2.get).toHaveBeenCalledWith("missing", undefined);
  });

  it("returns L1 value without checking L2", async () => {
    l1._data.set("key", "from-l1");
    const result = await tiered.get("key");
    expect(result).toBe("from-l1");
    expect(l2.get).not.toHaveBeenCalled();
  });

  it("falls through to L2 on L1 miss and populates L1", async () => {
    l2._data.set("key", "from-l2");
    const result = await tiered.get("key");
    expect(result).toBe("from-l2");
    // Wait for the fire-and-forget L1 population
    await new Promise((r) => setTimeout(r, 10));
    expect(l1.set).toHaveBeenCalledWith("key", "from-l2");
  });

  it("writes to both tiers on set", async () => {
    await tiered.set("key", "value");
    expect(l1.set).toHaveBeenCalledWith("key", "value");
    expect(l2.set).toHaveBeenCalledWith("key", "value");
  });

  it("deletes from both tiers", async () => {
    await tiered.del("key");
    expect(l1.del).toHaveBeenCalledWith("key");
    expect(l2.del).toHaveBeenCalledWith("key");
  });

  it("clear only clears L1", () => {
    tiered.clear();
    expect(l1.clear).toHaveBeenCalled();
    expect(l2.clear).not.toHaveBeenCalled();
  });
});
