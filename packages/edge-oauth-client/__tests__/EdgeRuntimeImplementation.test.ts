import { describe, it, expect, vi } from "vitest";
import { EdgeRuntimeImplementation } from "../src/EdgeRuntimeImplementation.js";

vi.mock("@atproto/jwk-jose", () => ({
  JoseKey: {
    generate: vi.fn(async (algs: string[]) => ({ algs, generated: true })),
  },
}));

describe("EdgeRuntimeImplementation", () => {
  describe("getRandomValues", () => {
    it("returns a Uint8Array of the requested length", () => {
      const runtime = new EdgeRuntimeImplementation();
      const result = runtime.getRandomValues(32);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });
  });

  describe("createKey", () => {
    it("delegates to JoseKey.generate", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const key = await runtime.createKey(["ES256"]);
      expect((key as any).generated).toBe(true);
      expect((key as any).algs).toEqual(["ES256"]);
    });
  });

  describe("digest", () => {
    it("computes SHA-256 digest", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const data = new TextEncoder().encode("hello");
      const result = await runtime.digest(data, { name: "sha256" });
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32); // SHA-256 = 32 bytes
    });

    it("computes SHA-384 digest", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const data = new TextEncoder().encode("hello");
      const result = await runtime.digest(data, { name: "sha384" });
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(48); // SHA-384 = 48 bytes
    });

    it("computes SHA-512 digest", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const data = new TextEncoder().encode("hello");
      const result = await runtime.digest(data, { name: "sha512" });
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(64); // SHA-512 = 64 bytes
    });
  });

  describe("requestLock", () => {
    it("executes the function and returns its result", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const result = await runtime.requestLock("test", () => 42);
      expect(result).toBe(42);
    });

    it("executes async functions", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const result = await runtime.requestLock(
        "test",
        async () => "async-result",
      );
      expect(result).toBe("async-result");
    });

    it("serializes concurrent calls with the same lock name", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const order: number[] = [];

      const p1 = runtime.requestLock("lock-a", async () => {
        await new Promise((r) => setTimeout(r, 50));
        order.push(1);
        return "first";
      });

      const p2 = runtime.requestLock("lock-a", async () => {
        order.push(2);
        return "second";
      });

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toBe("first");
      expect(r2).toBe("second");
      expect(order).toEqual([1, 2]);
    });

    it("allows concurrent execution for different lock names", async () => {
      const runtime = new EdgeRuntimeImplementation();
      const order: string[] = [];

      const p1 = runtime.requestLock("lock-a", async () => {
        await new Promise((r) => setTimeout(r, 50));
        order.push("a");
      });

      const p2 = runtime.requestLock("lock-b", async () => {
        order.push("b");
      });

      await Promise.all([p1, p2]);
      expect(order).toEqual(["b", "a"]);
    });

    it("releases the lock even if the function throws", async () => {
      const runtime = new EdgeRuntimeImplementation();

      await expect(
        runtime.requestLock("lock-a", async () => {
          throw new Error("fail");
        }),
      ).rejects.toThrow("fail");

      // Lock should be released — next call should work immediately
      const result = await runtime.requestLock("lock-a", () => "recovered");
      expect(result).toBe("recovered");
    });
  });
});
