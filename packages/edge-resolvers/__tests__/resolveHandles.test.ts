import { describe, it, expect, vi } from "vitest";
import { resolveHandles } from "../src/resolveHandles.js";
import { EdgeDidResolver } from "../src/EdgeDidResolver.js";

describe("resolveHandles", () => {
  it("resolves multiple DIDs to handles", async () => {
    const resolver = new EdgeDidResolver();
    vi.spyOn(resolver, "resolveHandle").mockImplementation(async (did) => {
      if (did === "did:plc:a") return "alice.bsky.social";
      if (did === "did:plc:b") return "bob.bsky.social";
      return did;
    });

    const result = await resolveHandles(["did:plc:a", "did:plc:b"], resolver);

    expect(result.get("did:plc:a")).toBe("alice.bsky.social");
    expect(result.get("did:plc:b")).toBe("bob.bsky.social");
  });

  it("deduplicates input DIDs", async () => {
    const resolver = new EdgeDidResolver();
    const spy = vi.spyOn(resolver, "resolveHandle").mockResolvedValue("handle");

    await resolveHandles(["did:plc:a", "did:plc:a", "did:plc:a"], resolver);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("falls back to DID string on resolution failure", async () => {
    const resolver = new EdgeDidResolver();
    vi.spyOn(resolver, "resolveHandle").mockRejectedValue(
      new Error("network error"),
    );

    const result = await resolveHandles(["did:plc:fail"], resolver);

    expect(result.get("did:plc:fail")).toBe("did:plc:fail");
  });

  it("handles mixed success and failure", async () => {
    const resolver = new EdgeDidResolver();
    vi.spyOn(resolver, "resolveHandle").mockImplementation(async (did) => {
      if (did === "did:plc:ok") return "alice.bsky.social";
      throw new Error("timeout");
    });

    const result = await resolveHandles(
      ["did:plc:ok", "did:plc:fail"],
      resolver,
    );

    expect(result.get("did:plc:ok")).toBe("alice.bsky.social");
    expect(result.get("did:plc:fail")).toBe("did:plc:fail");
  });

  it("returns empty map for empty input", async () => {
    const result = await resolveHandles([]);
    expect(result.size).toBe(0);
  });
});
