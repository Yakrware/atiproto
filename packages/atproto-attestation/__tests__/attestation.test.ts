import { describe, it, expect, vi } from "vitest";
import { p256 } from "@noble/curves/nist";
import { secp256k1 } from "@noble/curves/secp256k1";
import { ed25519 } from "@noble/curves/ed25519";
import {
  Attestation,
  verify,
  formatDidKey,
  formatPrivateMultibase,
  parseDidKey,
  type KeyData,
  type KeyType,
} from "../src/index.js";

function makeKeypair(type: KeyType): {
  priv: KeyData;
  pub: KeyData;
  did: string;
} {
  let privBytes: Uint8Array;
  let pubBytes: Uint8Array;
  switch (type) {
    case "p256":
      privBytes = p256.utils.randomSecretKey();
      pubBytes = p256.getPublicKey(privBytes);
      break;
    case "k256":
      privBytes = secp256k1.utils.randomSecretKey();
      pubBytes = secp256k1.getPublicKey(privBytes);
      break;
    case "ed25519":
      privBytes = ed25519.utils.randomSecretKey();
      pubBytes = ed25519.getPublicKey(privBytes);
      break;
    default:
      throw new Error(`unsupported in test: ${type}`);
  }
  const priv: KeyData = { type, bytes: privBytes };
  const pub: KeyData = { type, bytes: pubBytes };
  return { priv, pub, did: formatDidKey(pub) };
}

describe("did:key roundtrip", () => {
  for (const type of ["p256", "k256", "ed25519"] as const) {
    it(`parses what it formats (${type})`, () => {
      const { pub, did } = makeKeypair(type);
      const parsed = parseDidKey(did);
      expect(parsed.type).toBe(type);
      expect(parsed.bytes).toEqual(pub.bytes);
    });
  }
});

describe("Attestation.sign + verify roundtrip", () => {
  const repository = "did:web:atiproto.com";
  const record = {
    $type: "com.atiproto.cart",
    items: [],
    currency: "USD",
    status: "open",
  };

  for (const type of ["p256", "k256", "ed25519"] as const) {
    it(`signs and verifies with ${type}`, async () => {
      const { priv } = makeKeypair(type);
      const att = new Attestation({ privateKey: priv });
      const entry = await att.sign({ record, repository });
      expect(entry.$type).toBe("network.attested.signature");

      const result = await verify({
        record: { ...record, signatures: [entry] },
        repository,
      });
      expect(result.valid).toBe(true);
    });
  }

  it("fails verification when repository differs", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({ privateKey: priv });
    const entry = await att.sign({ record, repository });
    const result = await verify({
      record: { ...record, signatures: [entry] },
      repository: "did:web:other.example",
    });
    expect(result.valid).toBe(false);
  });

  it("fails verification when a signed field is mutated", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({ privateKey: priv });
    const entry = await att.sign({ record, repository });
    const result = await verify({
      record: { ...record, status: "completed", signatures: [entry] },
      repository,
    });
    expect(result.valid).toBe(false);
  });

  it("preserves metadata (issuer/issuedAt/role) on the entry", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({
      privateKey: priv,
      issuer: "did:web:appview.example",
      role: "appview",
    });
    const entry = await att.sign({
      record,
      repository,
      metadata: { issuedAt: "2026-05-19T12:00:00.000Z" },
    });
    expect(entry.$type).toBe("network.attested.signature");
    if (!("key" in entry)) throw new Error("expected inline attestation");
    expect(entry.issuer).toBe("did:web:appview.example");
    expect(entry.role).toBe("appview");
    expect(entry.issuedAt).toBe("2026-05-19T12:00:00.000Z");
  });

  it("role filter skips non-matching entries", async () => {
    const { priv: posPriv } = makeKeypair("p256");
    const { priv: avPriv } = makeKeypair("p256");
    const posAtt = new Attestation({ privateKey: posPriv, role: "pos" });
    const avAtt = new Attestation({ privateKey: avPriv, role: "appview" });

    const posEntry = await posAtt.sign({ record, repository });
    const avEntry = await avAtt.sign({ record, repository });

    const recordWithSigs = { ...record, signatures: [posEntry, avEntry] };

    const posOnly = await verify({
      record: recordWithSigs,
      repository,
      role: "pos",
    });
    expect(posOnly.entries).toHaveLength(1);
    expect(posOnly.entries[0].ok).toBe(true);

    const avOnly = await verify({
      record: recordWithSigs,
      repository,
      role: "appview",
    });
    expect(avOnly.entries).toHaveLength(1);
    expect(avOnly.entries[0].ok).toBe(true);

    const noneMatch = await verify({
      record: recordWithSigs,
      repository,
      role: "broker",
    });
    expect(noneMatch.valid).toBe(false);
  });
});

describe("fields-scoped signatures", () => {
  const repository = "did:web:atiproto.com";
  const baseRecord = {
    $type: "com.atiproto.cart",
    items: [],
    currency: "USD",
    status: "open",
    total: 0,
  };
  const fields = ["items", "currency", "status"] as const;

  it("only the listed fields are part of the signed payload", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({ privateKey: priv });
    const entry = await att.sign({ record: baseRecord, repository, fields });

    // Mutating a NON-signed field still verifies
    const okMutation = await verify({
      record: { ...baseRecord, total: 999, signatures: [entry] },
      repository,
      fields,
    });
    expect(okMutation.valid).toBe(true);

    // Mutating a signed field invalidates
    const failMutation = await verify({
      record: { ...baseRecord, currency: "EUR", signatures: [entry] },
      repository,
      fields,
    });
    expect(failMutation.valid).toBe(false);
  });

  it("verifier supplying different fields fails", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({ privateKey: priv });
    const entry = await att.sign({ record: baseRecord, repository, fields });
    const wrongFields = ["currency", "status"];
    const result = await verify({
      record: { ...baseRecord, signatures: [entry] },
      repository,
      fields: wrongFields,
    });
    expect(result.valid).toBe(false);
  });
});

describe("re-sign detection (signAndAppend)", () => {
  const repository = "did:web:atiproto.com";
  const record = {
    $type: "com.atiproto.cart",
    items: [],
    currency: "USD",
    status: "open",
  };

  it("replaces our own inline signature in place", async () => {
    const { priv } = makeKeypair("p256");
    const att = new Attestation({ privateKey: priv, role: "appview" });
    const v1 = await att.signAndAppend({ record, repository });
    expect(v1.signatures).toHaveLength(1);

    const v2 = await att.signAndAppend({
      record: { ...record, status: "completed", signatures: v1.signatures },
      repository,
    });
    expect(v2.signatures).toHaveLength(1);
  });

  it("appends alongside a different signer's signature", async () => {
    const { priv: a } = makeKeypair("p256");
    const { priv: b } = makeKeypair("p256");
    const attA = new Attestation({ privateKey: a, role: "pos" });
    const attB = new Attestation({ privateKey: b, role: "appview" });

    const step1 = await attA.signAndAppend({ record, repository });
    const step2 = await attB.signAndAppend({
      ...step1,
      record: step1,
      repository,
    });
    expect(step2.signatures).toHaveLength(2);
  });
});

describe("remote proof path (agent supplied)", () => {
  const repository = "did:web:atiproto.com";
  const record = {
    $type: "com.atiproto.cart",
    items: [],
    currency: "USD",
    status: "open",
  };

  it("writes a proof record and returns a strongRef", async () => {
    const { priv } = makeKeypair("p256");
    const calls: Array<{ nsid: string; data: any }> = [];
    const agent = {
      did: "did:plc:attestor",
      call: vi.fn(async (nsid: string, _p: any, data: any) => {
        calls.push({ nsid, data });
        return {
          data: {
            uri: `at://did:plc:attestor/${data.collection}/abc123`,
            cid: "bafkreiproof",
          },
        };
      }),
    };
    const att = new Attestation({
      privateKey: priv,
      role: "appview",
      issuer: "did:plc:attestor",
      agent,
    });

    const entry = await att.sign({ record, repository });
    expect(entry.$type).toBe("com.atproto.repo.strongRef");
    if (entry.$type !== "com.atproto.repo.strongRef") throw new Error("type");
    expect(entry.uri).toMatch(/^at:\/\/did:plc:attestor\//);
    expect(entry.cid).toBe("bafkreiproof");

    expect(calls).toHaveLength(1);
    expect(calls[0].nsid).toBe("com.atproto.repo.createRecord");
    expect(calls[0].data.collection).toBe("network.attested.proof");
    const proof = calls[0].data.record;
    expect(proof.$type).toBe("network.attested.proof");
    expect(typeof proof.cid).toBe("string");
    expect(proof.role).toBe("appview");
    expect(proof.issuer).toBe("did:plc:attestor");
  });

  it("re-signing with an agent replaces the strongRef without deleting the prior proof", async () => {
    const { priv } = makeKeypair("p256");
    let writes = 0;
    const agent = {
      did: "did:plc:attestor",
      call: vi.fn(async (nsid: string, _p: any, data: any) => {
        if (nsid === "com.atproto.repo.createRecord") {
          writes++;
          return {
            data: {
              uri: `at://did:plc:attestor/${data.collection}/rkey${writes}`,
              cid: `bafkreiproof${writes}`,
            },
          };
        }
        throw new Error(`unmocked nsid ${nsid}`);
      }),
    };
    const att = new Attestation({ privateKey: priv, role: "appview", agent });

    const r1 = await att.signAndAppend({ record, repository });
    expect(r1.signatures).toHaveLength(1);
    const first = r1.signatures[0] as any;

    const r2 = await att.signAndAppend({
      record: { ...record, status: "completed", signatures: r1.signatures },
      repository,
    });
    expect(r2.signatures).toHaveLength(1);
    const second = r2.signatures[0] as any;
    expect(second.uri).not.toBe(first.uri);

    // Prior proof record is left in place — strongRefs are version-dependent
    // and we want the old reference to keep resolving.
    const deletes = (agent.call as any).mock.calls.filter(
      (c: any[]) => c[0] === "com.atproto.repo.deleteRecord",
    );
    expect(deletes).toHaveLength(0);
  });

  it("verifies via a remote proof using recordResolver", async () => {
    const { priv } = makeKeypair("p256");
    const stored: Record<string, any> = {};
    const agent = {
      did: "did:plc:attestor",
      call: vi.fn(async (_nsid: string, _p: any, data: any) => {
        const uri = `at://did:plc:attestor/${data.collection}/abc`;
        stored[uri] = data.record;
        return { data: { uri, cid: "bafkreiproof" } };
      }),
    };
    const att = new Attestation({ privateKey: priv, role: "appview", agent });
    const strongRef = await att.sign({ record, repository });

    const result = await verify({
      record: { ...record, signatures: [strongRef] },
      repository,
      recordResolver: (uri: string) => stored[uri],
    });
    expect(result.valid).toBe(true);
  });
});

describe("multibase private key", () => {
  it("round-trips private key data through multibase", () => {
    const { priv } = makeKeypair("p256");
    const mb = formatPrivateMultibase(priv);
    const att = new Attestation({ privateKey: mb });
    expect(att.privateKey.type).toBe("p256");
    expect(att.privateKey.bytes).toEqual(priv.bytes);
  });
});
