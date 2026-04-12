import { describe, it, expect, vi, beforeEach } from "vitest";
import { EdgeDidWebResolver } from "../src/EdgeDidWebResolver.js";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("EdgeDidWebResolver", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("resolves a did:web document", async () => {
    const doc = { id: "did:web:example.com" };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(doc), { status: 200 }),
    );

    const resolver = new EdgeDidWebResolver(3000);
    const result = await resolver.resolveNoCheck("did:web:example.com");

    expect(result).toEqual(doc);
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.href).toBe("https://example.com/.well-known/did.json");
  });

  it("uses http for localhost", async () => {
    const doc = { id: "did:web:localhost" };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(doc), { status: 200 }),
    );

    const resolver = new EdgeDidWebResolver(3000);
    await resolver.resolveNoCheck("did:web:localhost");

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.protocol).toBe("http:");
  });

  it("returns null on non-ok response", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 404 }));

    const resolver = new EdgeDidWebResolver(3000);
    const result = await resolver.resolveNoCheck("did:web:example.com");

    expect(result).toBeNull();
  });

  it("throws PoorlyFormattedDidError for empty DID parts", async () => {
    const resolver = new EdgeDidWebResolver(3000);
    await expect(resolver.resolveNoCheck("did:web:")).rejects.toThrow();
  });

  it("throws UnsupportedDidWebPathError for path-based did:web", async () => {
    const resolver = new EdgeDidWebResolver(3000);
    await expect(
      resolver.resolveNoCheck("did:web:example.com:path:subpath"),
    ).rejects.toThrow();
  });
});
