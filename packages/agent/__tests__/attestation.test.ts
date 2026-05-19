import { describe, it, expect, vi } from "vitest";
import { p256 } from "@noble/curves/nist";
import {
  Attestation,
  verify,
  formatDidKey,
} from "@atiproto/atproto-attestation";
import { runActions } from "../src/workflow.js";
import { signature_scope_collections } from "../src/signature-scopes.js";

const REPO = "did:plc:user";

function makeAttestation(role?: string) {
  const priv = p256.utils.randomSecretKey();
  const pub = p256.getPublicKey(priv);
  const publicDid = formatDidKey({ type: "p256", bytes: pub });
  return {
    attestation: new Attestation({
      privateKey: { type: "p256", bytes: priv },
      publicKey: publicDid,
      role,
    }),
    publicDid,
  };
}

function mockPds(): { client: any; calls: Array<{ nsid: string; data: any }> } {
  const calls: Array<{ nsid: string; data: any }> = [];
  return {
    calls,
    client: {
      call: vi.fn(async (nsid: string, _params: unknown, data: any) => {
        calls.push({ nsid, data });
        return {
          data: {
            uri: `at://${REPO}/${data.collection}/${data.rkey}`,
            cid: "bafyfake",
          },
          headers: {},
          success: true,
        };
      }),
    },
  };
}

describe("runActions + attestation", () => {
  it("signs create-record on a signed collection (fields-scoped)", async () => {
    const { attestation } = makeAttestation("appview");
    const { client, calls } = mockPds();

    await runActions(
      client,
      [
        {
          $type: "com.atiproto.actions#create",
          repo: REPO,
          collection: "com.atiproto.cart",
          rkey: "abc",
          record: { items: [], currency: "USD", status: "open" },
        } as any,
      ],
      attestation,
    );

    expect(calls).toHaveLength(1);
    const sent = calls[0].data.record;
    expect(sent.signatures).toHaveLength(1);
    expect(sent.signatures[0].role).toBe("appview");
    expect(sent.signatures[0].$type).toBe("network.attested.signature");

    const result = await verify({
      record: sent,
      repository: REPO,
      fields: signature_scope_collections["com.atiproto.cart"],
    });
    expect(result.valid).toBe(true);
  });

  it("leaves records on unrecognized collections untouched", async () => {
    const { attestation } = makeAttestation();
    const { client, calls } = mockPds();

    await runActions(
      client,
      [
        {
          $type: "com.atiproto.actions#create",
          repo: REPO,
          collection: "com.atiproto.profile",
          rkey: "self",
          record: { acceptsItems: true },
        } as any,
      ],
      attestation,
    );

    expect(calls[0].data.record).toEqual({ acceptsItems: true });
  });

  it("no-op when attestation is not provided", async () => {
    const { client, calls } = mockPds();

    await runActions(client, [
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        collection: "com.atiproto.cart",
        rkey: "abc",
        record: { items: [], currency: "USD", status: "open" },
      } as any,
    ]);

    expect(calls[0].data.record).toEqual({
      items: [],
      currency: "USD",
      status: "open",
    });
  });
});
