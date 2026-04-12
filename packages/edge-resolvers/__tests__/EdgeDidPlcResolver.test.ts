import { describe, it, expect, vi, beforeEach } from "vitest";
import { EdgeDidPlcResolver } from "../src/EdgeDidPlcResolver.js";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("EdgeDidPlcResolver", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("resolves a DID document on success", async () => {
    const doc = {
      id: "did:plc:abc123",
      alsoKnownAs: ["at://user.bsky.social"],
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(doc), { status: 200 }),
    );

    const resolver = new EdgeDidPlcResolver("https://plc.directory", 3000);
    const result = await resolver.resolveNoCheck("did:plc:abc123");

    expect(result).toEqual(doc);
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe("/did%3Aplc%3Aabc123");
  });

  it("returns null on 404", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 404 }));

    const resolver = new EdgeDidPlcResolver("https://plc.directory", 3000);
    const result = await resolver.resolveNoCheck("did:plc:missing");

    expect(result).toBeNull();
  });

  it("throws on non-ok, non-404 responses", async () => {
    fetchMock.mockResolvedValue(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    );

    const resolver = new EdgeDidPlcResolver("https://plc.directory", 3000);
    await expect(resolver.resolveNoCheck("did:plc:abc123")).rejects.toThrow(
      "Internal Server Error",
    );
  });
});
