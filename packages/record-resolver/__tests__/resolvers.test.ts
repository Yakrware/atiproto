import { describe, it, expect, vi } from "vitest";
import {
  FetchRecordResolver,
  AgentRecordResolver,
  EdgeRecordResolver,
  parseAtUri,
} from "../src/index.js";

const URI = "at://did:plc:attestor/network.attested.proof/3lab123abc456";
const PROOF_RECORD = {
  $type: "network.attested.proof",
  cid: "bafkreiproof",
  role: "appview",
};

describe("parseAtUri", () => {
  it("extracts repo / collection / rkey", () => {
    expect(parseAtUri(URI)).toEqual({
      repo: "did:plc:attestor",
      collection: "network.attested.proof",
      rkey: "3lab123abc456",
    });
  });

  it("rejects malformed URIs", () => {
    expect(() => parseAtUri("https://example.com")).toThrow();
    expect(() => parseAtUri("at://only-repo")).toThrow();
  });
});

describe("FetchRecordResolver", () => {
  it("calls com.atproto.repo.getRecord on the configured relay", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/xrpc/com.atproto.repo.getRecord");
      expect(url).toContain("repo=did%3Aplc%3Aattestor");
      expect(url).toContain("collection=network.attested.proof");
      expect(url).toContain("rkey=3lab123abc456");
      return new Response(JSON.stringify({ value: PROOF_RECORD }), {
        status: 200,
      });
    }) as unknown as typeof fetch;
    const resolver = new FetchRecordResolver({
      relay: "https://my-relay.example",
      fetch: fetchImpl,
    });
    const record = await resolver.resolve(URI);
    expect(record).toEqual(PROOF_RECORD);
  });

  it("throws when the relay returns a non-2xx", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("not found", { status: 404 }),
    ) as unknown as typeof fetch;
    const resolver = new FetchRecordResolver({ fetch: fetchImpl });
    await expect(resolver.resolve(URI)).rejects.toThrow(/404/);
  });
});

describe("AgentRecordResolver", () => {
  it("routes the call through the agent", async () => {
    const calls: Array<{ nsid: string; params: unknown }> = [];
    const agent = {
      call: vi.fn(async (nsid: string, params: unknown) => {
        calls.push({ nsid, params });
        return { data: { value: PROOF_RECORD } };
      }),
    };
    const resolver = new AgentRecordResolver(agent);
    const record = await resolver.resolve(URI);
    expect(record).toEqual(PROOF_RECORD);
    expect(calls[0].nsid).toBe("com.atproto.repo.getRecord");
    expect(calls[0].params).toEqual({
      repo: "did:plc:attestor",
      collection: "network.attested.proof",
      rkey: "3lab123abc456",
    });
  });
});

describe("EdgeRecordResolver", () => {
  it("caches resolved records by URI", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ value: PROOF_RECORD }), { status: 200 }),
    ) as unknown as typeof fetch;
    const resolver = new EdgeRecordResolver({ fetch: fetchImpl });
    await resolver.resolve(URI);
    await resolver.resolve(URI);
    expect(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls,
    ).toHaveLength(1);
  });
});
