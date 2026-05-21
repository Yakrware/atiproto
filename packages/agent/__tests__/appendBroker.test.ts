import { describe, it, expect, vi } from "vitest";
import { ComNS } from "../src/namespaces/com.js";

const USER_DID = "did:plc:user";

const PDS_SERVICE = {
  id: `${USER_DID}#atproto_pds`,
  type: "AtprotoPersonalDataServer",
  serviceEndpoint: "https://pds.test",
};

function brokerService(brokerDid: string, endpoint?: string) {
  return {
    id: `${brokerDid}#payment-broker`,
    type: "PaymentBroker",
    serviceEndpoint:
      endpoint ?? `https://${brokerDid.slice("did:web:".length)}`,
  };
}

function mockClient(scripted: {
  service?: Array<{ id: string; type: string; serviceEndpoint: unknown }>;
}): {
  client: any;
  calls: Array<{ nsid: string; params: unknown; data: unknown }>;
} {
  const service = scripted.service ?? [];
  const calls: Array<{ nsid: string; params: unknown; data: unknown }> = [];
  const client = {
    call: vi.fn(async (nsid: string, params?: unknown, data?: unknown) => {
      calls.push({ nsid, params, data });
      switch (nsid) {
        case "com.atproto.server.getSession":
          return { data: { did: USER_DID, handle: "alice.test" } };
        case "com.atproto.identity.resolveIdentity":
          return {
            data: {
              did: USER_DID,
              handle: "alice.test",
              didDoc: { id: USER_DID, service },
            },
          };
        case "com.atproto.identity.signPlcOperation":
          return {
            data: { operation: { sig: "fake", ...((data as any) ?? {}) } },
          };
        case "com.atproto.identity.submitPlcOperation":
          return { data: { success: true } };
        default:
          throw new Error(`unmocked: ${nsid}`);
      }
    }),
  };
  return { client, calls };
}

function makeComNS(client: any): ComNS {
  return new ComNS(client);
}

function lastSignServices(
  calls: Array<{ nsid: string; data: unknown }>,
): Record<string, unknown> | undefined {
  const c = calls.find(
    (c) => c.nsid === "com.atproto.identity.signPlcOperation",
  );
  return (c?.data as { services?: Record<string, unknown> })?.services;
}

function submitted(calls: Array<{ nsid: string }>): boolean {
  return calls.some((c) => c.nsid === "com.atproto.identity.submitPlcOperation");
}

describe("ComNS.appendBroker", () => {
  it("appends to the end of the service array when no brokers exist", async () => {
    const { client, calls } = mockClient({ service: [PDS_SERVICE] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b1.example");

    const services = lastSignServices(calls)!;
    // Both services present, keyed by full id.
    expect(services[PDS_SERVICE.id]).toEqual({
      type: "AtprotoPersonalDataServer",
      endpoint: "https://pds.test",
    });
    expect(services["did:web:b1.example#payment-broker"]).toEqual({
      type: "PaymentBroker",
      endpoint: "https://b1.example",
    });
    expect(submitted(calls)).toBe(true);
  });

  it("default has no effect when no brokers exist (still appends to end)", async () => {
    const { client, calls } = mockClient({ service: [PDS_SERVICE] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b1.example", { default: true });

    const services = lastSignServices(calls)!;
    expect(services[PDS_SERVICE.id]).toBeDefined();
    expect(services["did:web:b1.example#payment-broker"]).toBeDefined();
    expect(submitted(calls)).toBe(true);
  });

  it("appends after the last broker when default=false and brokers exist", async () => {
    const b1 = brokerService("did:web:b1.example");
    const b2 = brokerService("did:web:b2.example");
    const { client, calls } = mockClient({ service: [PDS_SERVICE, b1, b2] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b3.example");

    const services = lastSignServices(calls)!;
    expect(Object.keys(services)).toEqual([
      PDS_SERVICE.id,
      b1.id,
      b2.id,
      "did:web:b3.example#payment-broker",
    ]);
  });

  it("inserts just before the previous first broker when default=true and brokers exist", async () => {
    const b1 = brokerService("did:web:b1.example");
    const b2 = brokerService("did:web:b2.example");
    const { client, calls } = mockClient({ service: [PDS_SERVICE, b1, b2] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b3.example", { default: true });

    const services = lastSignServices(calls)!;
    expect(Object.keys(services)).toEqual([
      PDS_SERVICE.id, // non-broker stays at index 0
      "did:web:b3.example#payment-broker", // new entry takes the "first broker" slot
      b1.id,
      b2.id,
    ]);
  });

  it("no-op when broker is already present and default=false", async () => {
    const b1 = brokerService("did:web:b1.example");
    const b2 = brokerService("did:web:b2.example");
    const { client, calls } = mockClient({ service: [PDS_SERVICE, b1, b2] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b2.example");

    expect(
      calls.some((c) => c.nsid === "com.atproto.identity.signPlcOperation"),
    ).toBe(false);
    expect(submitted(calls)).toBe(false);
  });

  it("moves broker to the front of the broker block when default=true", async () => {
    const b1 = brokerService("did:web:b1.example");
    const b2 = brokerService("did:web:b2.example");
    const b3 = brokerService("did:web:b3.example");
    const { client, calls } = mockClient({
      service: [PDS_SERVICE, b1, b2, b3],
    });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b3.example", { default: true });

    const services = lastSignServices(calls)!;
    expect(Object.keys(services)).toEqual([
      PDS_SERVICE.id,
      b3.id, // promoted into the first-broker slot
      b1.id,
      b2.id,
    ]);
  });

  it("no-op when broker is already at the front of the broker block and default=true", async () => {
    const b1 = brokerService("did:web:b1.example");
    const b2 = brokerService("did:web:b2.example");
    const { client, calls } = mockClient({ service: [PDS_SERVICE, b1, b2] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b1.example", { default: true });

    expect(
      calls.some((c) => c.nsid === "com.atproto.identity.signPlcOperation"),
    ).toBe(false);
  });

  it("forwards token to signPlcOperation", async () => {
    const { client, calls } = mockClient({ service: [] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b1.example", { token: "abc-123" });

    const signCall = calls.find(
      (c) => c.nsid === "com.atproto.identity.signPlcOperation",
    );
    expect((signCall?.data as any)?.token).toBe("abc-123");
  });

  it("accepts an explicit serviceEndpoint override", async () => {
    const { client, calls } = mockClient({ service: [] });
    const com = makeComNS(client);
    await com.appendBroker("did:web:b1.example", {
      serviceEndpoint: "https://override.example/broker",
    });

    const services = lastSignServices(calls)!;
    expect(services["did:web:b1.example#payment-broker"]).toEqual({
      type: "PaymentBroker",
      endpoint: "https://override.example/broker",
    });
  });

  it("throws for non-did:web broker without an explicit serviceEndpoint", async () => {
    const { client } = mockClient({ service: [] });
    const com = makeComNS(client);
    await expect(com.appendBroker("did:plc:broker-abc")).rejects.toThrow(
      /Cannot derive serviceEndpoint/,
    );
  });
});
