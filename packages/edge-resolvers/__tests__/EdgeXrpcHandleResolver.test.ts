import { describe, it, expect, vi, beforeEach } from "vitest";
import { EdgeXrpcHandleResolver } from "../src/EdgeXrpcHandleResolver.js";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("EdgeXrpcHandleResolver", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses default service URL", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ did: "did:plc:abc" }), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    await resolver.resolve("alice.bsky.social");

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.origin).toBe("https://public.api.bsky.app");
    expect(calledUrl.pathname).toBe("/xrpc/com.atproto.identity.resolveHandle");
    expect(calledUrl.searchParams.get("handle")).toBe("alice.bsky.social");
  });

  it("accepts a custom service URL", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ did: "did:plc:abc" }), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver("https://custom.api.example");
    await resolver.resolve("alice.bsky.social");

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.origin).toBe("https://custom.api.example");
  });

  it("returns the DID on success", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ did: "did:plc:abc123" }), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    const result = await resolver.resolve("alice.bsky.social");
    expect(result).toBe("did:plc:abc123");
  });

  it("returns null on 400 (invalid handle)", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 400 }));

    const resolver = new EdgeXrpcHandleResolver();
    const result = await resolver.resolve("not-a-handle");
    expect(result).toBeNull();
  });

  it("throws on non-ok, non-400 response", async () => {
    fetchMock.mockResolvedValue(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    await expect(resolver.resolve("alice.bsky.social")).rejects.toThrow(
      "Failed to resolve handle: 500 Internal Server Error",
    );
  });

  it("returns null when response has no did field", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    const result = await resolver.resolve("alice.bsky.social");
    expect(result).toBeNull();
  });

  it("returns null when did does not start with 'did:'", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ did: "not-a-did" }), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    const result = await resolver.resolve("alice.bsky.social");
    expect(result).toBeNull();
  });

  it("returns null when did is not a string", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ did: 123 }), { status: 200 }),
    );

    const resolver = new EdgeXrpcHandleResolver();
    const result = await resolver.resolve("alice.bsky.social");
    expect(result).toBeNull();
  });
});
