import { describe, it, expect, vi, beforeEach } from "vitest";
import { EdgeDidResolver } from "../src/EdgeDidResolver.js";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("EdgeDidResolver", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses default opts", () => {
    const resolver = new EdgeDidResolver();
    expect(resolver.methods.has("plc")).toBe(true);
    expect(resolver.methods.has("web")).toBe(true);
  });

  describe("resolveHandle", () => {
    it("extracts handle from alsoKnownAs at:// URI", async () => {
      const doc = {
        id: "did:plc:abc",
        alsoKnownAs: ["at://alice.bsky.social"],
      };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(doc), { status: 200 }),
      );

      const resolver = new EdgeDidResolver();
      const handle = await resolver.resolveHandle("did:plc:abc");
      expect(handle).toBe("alice.bsky.social");
    });

    it("falls back to DID when alsoKnownAs is missing", async () => {
      const doc = { id: "did:plc:abc" };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(doc), { status: 200 }),
      );

      const resolver = new EdgeDidResolver();
      const handle = await resolver.resolveHandle("did:plc:abc");
      expect(handle).toBe("did:plc:abc");
    });

    it("falls back to DID when alsoKnownAs is empty", async () => {
      const doc = { id: "did:plc:abc", alsoKnownAs: [] };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(doc), { status: 200 }),
      );

      const resolver = new EdgeDidResolver();
      const handle = await resolver.resolveHandle("did:plc:abc");
      expect(handle).toBe("did:plc:abc");
    });

    it("falls back to DID when alsoKnownAs has non-at:// URI", async () => {
      const doc = {
        id: "did:plc:abc",
        alsoKnownAs: ["https://example.com"],
      };
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(doc), { status: 200 }),
      );

      const resolver = new EdgeDidResolver();
      const handle = await resolver.resolveHandle("did:plc:abc");
      expect(handle).toBe("did:plc:abc");
    });

    it("falls back to DID on resolution error", async () => {
      fetchMock.mockRejectedValue(new Error("network error"));

      const resolver = new EdgeDidResolver();
      const handle = await resolver.resolveHandle("did:plc:abc");
      expect(handle).toBe("did:plc:abc");
    });
  });

  describe("asOAuthResolver", () => {
    it("returns an object with a resolve method", () => {
      const resolver = new EdgeDidResolver();
      const oauthResolver = resolver.asOAuthResolver();
      expect(typeof oauthResolver.resolve).toBe("function");
    });

    it("passes noCache option as forceRefresh", async () => {
      const resolver = new EdgeDidResolver();
      const resolveSpy = vi.spyOn(resolver, "resolve").mockResolvedValue(null);

      const oauthResolver = resolver.asOAuthResolver();
      await oauthResolver.resolve("did:plc:abc", { noCache: true });

      expect(resolveSpy).toHaveBeenCalledWith("did:plc:abc", true);
    });

    it("defaults noCache to false", async () => {
      const resolver = new EdgeDidResolver();
      const resolveSpy = vi.spyOn(resolver, "resolve").mockResolvedValue(null);

      const oauthResolver = resolver.asOAuthResolver();
      await oauthResolver.resolve("did:plc:abc");

      expect(resolveSpy).toHaveBeenCalledWith("did:plc:abc", false);
    });
  });
});
