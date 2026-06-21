import { describe, it, expect, vi } from "vitest";
import { p256 } from "@noble/curves/nist";
import { ed25519 } from "@noble/curves/ed25519";
import { formatDidKey } from "@atiproto/atproto-attestation";
import {
  createDidKeyResolver,
  createFetchKeyResolver,
  createCachedKeyResolver,
  extractKeyFromDidDoc,
} from "../src/index.js";

const PLC_DID = "did:plc:abc";
const FRAG = "atproto-signing";

function makeP256Did() {
  const priv = p256.utils.randomSecretKey();
  const pub = p256.getPublicKey(priv);
  const did = formatDidKey({ type: "p256", bytes: pub });
  return { pub, did, multibase: did.slice("did:key:".length) };
}

function fakeFetch(docs: Record<string, unknown>): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const body = docs[url];
    if (!body) {
      return new Response("not found", { status: 404 });
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;
}

describe("createDidKeyResolver", () => {
  it("parses did:key references locally", () => {
    const { did, pub } = makeP256Did();
    const resolve = createDidKeyResolver();
    const key = resolve(did) as { type: string; bytes: Uint8Array };
    expect(key.type).toBe("p256");
    expect(key.bytes).toEqual(pub);
  });

  it("rejects non-did:key references", () => {
    const resolve = createDidKeyResolver();
    expect(() => resolve("did:plc:abc#x")).toThrow(/did:key/);
  });
});

describe("createFetchKeyResolver", () => {
  it("parses bare did:key without a fetch", async () => {
    const { did, pub } = makeP256Did();
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const resolve = createFetchKeyResolver({ fetch: fetchImpl });
    const key = await resolve(did);
    expect(key.bytes).toEqual(pub);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fetches a did:plc document and extracts the key (publicKeyMultibase)", async () => {
    const { multibase, pub } = makeP256Did();
    const doc = {
      id: PLC_DID,
      verificationMethod: [
        {
          id: `${PLC_DID}#${FRAG}`,
          type: "Multikey",
          publicKeyMultibase: multibase,
        },
      ],
    };
    const resolve = createFetchKeyResolver({
      fetch: fakeFetch({ [`https://plc.directory/${PLC_DID}`]: doc }),
    });
    const key = await resolve(`${PLC_DID}#${FRAG}`);
    expect(key.type).toBe("p256");
    expect(key.bytes).toEqual(pub);
  });

  it("fetches a did:web document from .well-known", async () => {
    const { multibase, pub } = makeP256Did();
    const webDid = "did:web:appview.example";
    const doc = {
      verificationMethod: [
        {
          id: `${webDid}#${FRAG}`,
          publicKeyMultibase: multibase,
        },
      ],
    };
    const resolve = createFetchKeyResolver({
      fetch: fakeFetch({
        "https://appview.example/.well-known/did.json": doc,
      }),
    });
    const key = await resolve(`${webDid}#${FRAG}`);
    expect(key.bytes).toEqual(pub);
  });

  it("rejects unsupported DID methods", async () => {
    const resolve = createFetchKeyResolver();
    await expect(resolve("did:example:abc#x")).rejects.toThrow(
      /Unsupported DID method/,
    );
  });
});

describe("createCachedKeyResolver", () => {
  it("caches the DID document across resolves of the same DID", async () => {
    const { multibase } = makeP256Did();
    const doc = {
      verificationMethod: [
        { id: `${PLC_DID}#${FRAG}`, publicKeyMultibase: multibase },
        { id: `${PLC_DID}#second`, publicKeyMultibase: multibase },
      ],
    };
    const fetchImpl = vi.fn(
      fakeFetch({ [`https://plc.directory/${PLC_DID}`]: doc }) as unknown as (
        ...args: Parameters<typeof fetch>
      ) => ReturnType<typeof fetch>,
    ) as unknown as typeof fetch;
    const resolve = createCachedKeyResolver({ fetch: fetchImpl });

    await resolve(`${PLC_DID}#${FRAG}`);
    await resolve(`${PLC_DID}#second`);
    // Same DID, only one fetch even though we asked for two fragments.
    expect(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls,
    ).toHaveLength(1);
  });
});

describe("extractKeyFromDidDoc", () => {
  it("handles OKP JWK (Ed25519)", () => {
    const priv = ed25519.utils.randomSecretKey();
    const pub = ed25519.getPublicKey(priv);
    const x = Buffer.from(pub).toString("base64url");
    const doc = {
      verificationMethod: [
        {
          id: `${PLC_DID}#${FRAG}`,
          publicKeyJwk: { kty: "OKP", crv: "Ed25519", x },
        },
      ],
    };
    const key = extractKeyFromDidDoc(doc, PLC_DID, FRAG);
    expect(key.type).toBe("ed25519");
    expect(key.bytes).toEqual(pub);
  });

  it("throws when the verification method is missing", () => {
    expect(() =>
      extractKeyFromDidDoc({ verificationMethod: [] }, PLC_DID, FRAG),
    ).toThrow(/No verification method/);
  });
});
