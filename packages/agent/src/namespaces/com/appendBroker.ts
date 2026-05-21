import type { XrpcClient } from "@atproto/xrpc";

export const BROKER_SERVICE_TYPE = "PaymentBroker";
export const BROKER_SERVICE_FRAGMENT = "#payment-broker";

export interface AppendBrokerOptions {
  /**
   * Promote the broker to the front of the broker block. If no
   * brokers exist yet, this flag has no effect: the broker is simply
   * appended to the end of the service array. When other brokers
   * exist, the new entry is inserted just before the previous first
   * PaymentBroker, leaving any non-broker services (e.g. atproto_pds)
   * in place at the head of the array.
   */
  default?: boolean;
  /**
   * Token from `com.atproto.identity.requestPlcOperationSignature`.
   * Pass undefined when the PDS does not gate PLC operations on an
   * emailed token.
   */
  token?: string;
  /**
   * Override the `serviceEndpoint` URL on the new entry. Defaults to
   * the broker's did:web host as `https://${host}`. Required when
   * `broker` is not a did:web (the function throws otherwise).
   */
  serviceEndpoint?: string;
}

interface ServiceEntry {
  id: string;
  type: string | string[];
  serviceEndpoint: unknown;
}

function defaultEndpointFor(broker: string): string {
  if (!broker.startsWith("did:web:")) {
    throw new Error(
      `Cannot derive serviceEndpoint from ${broker}; pass options.serviceEndpoint`,
    );
  }
  const tail = broker.slice("did:web:".length);
  return `https://${decodeURIComponent(tail)}`;
}

function brokerServiceId(broker: string): string {
  return `${broker}${BROKER_SERVICE_FRAGMENT}`;
}

function isBrokerEntry(entry: ServiceEntry | undefined): boolean {
  return !!entry && entry.type === BROKER_SERVICE_TYPE;
}

/**
 * Build the `services` map that `com.atproto.identity.signPlcOperation`
 * expects, given a W3C service array. Keys are the entry's full `id`,
 * which keeps each entry unique even when multiple brokers share the
 * `#payment-broker` fragment.
 */
function toPlcServices(service: ServiceEntry[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const entry of service) {
    if (!entry?.id) continue;
    out[entry.id] = {
      type: entry.type,
      endpoint: entry.serviceEndpoint,
    };
  }
  return out;
}

/**
 * Append (or promote) a PaymentBroker entry on the authenticated
 * user's DID document. See the comment on `ComNS.appendBroker` for
 * the full behavior.
 */
export async function appendBroker(
  client: XrpcClient,
  broker: string,
  options: AppendBrokerOptions = {},
): Promise<void> {
  const isDefault = options.default ?? false;
  const endpoint = options.serviceEndpoint ?? defaultEndpointFor(broker);
  const newEntry: ServiceEntry = {
    id: brokerServiceId(broker),
    type: BROKER_SERVICE_TYPE,
    serviceEndpoint: endpoint,
  };

  const sessionRes = await client.call("com.atproto.server.getSession");
  const sessionData = sessionRes.data as { did?: string } | undefined;
  const did = sessionData?.did;
  if (typeof did !== "string" || did.length === 0) {
    throw new Error("appendBroker requires an authenticated session");
  }

  const identityRes = await client.call(
    "com.atproto.identity.resolveIdentity",
    { identifier: did },
  );
  const identity = identityRes.data as
    | { didDoc?: { service?: ServiceEntry[] } }
    | undefined;
  const current = Array.isArray(identity?.didDoc?.service)
    ? [...(identity.didDoc.service as ServiceEntry[])]
    : [];

  const existingIdx = current.findIndex((e) => e?.id === newEntry.id);
  const brokerIndices: number[] = [];
  for (let i = 0; i < current.length; i++) {
    if (isBrokerEntry(current[i])) brokerIndices.push(i);
  }
  const firstBrokerIdx = brokerIndices[0] ?? -1;
  const lastBrokerIdx = brokerIndices[brokerIndices.length - 1] ?? -1;

  let next: ServiceEntry[];
  if (existingIdx === -1) {
    // New broker.
    if (firstBrokerIdx === -1) {
      next = [...current, newEntry];
    } else if (isDefault) {
      next = [
        ...current.slice(0, firstBrokerIdx),
        newEntry,
        ...current.slice(firstBrokerIdx),
      ];
    } else {
      next = [
        ...current.slice(0, lastBrokerIdx + 1),
        newEntry,
        ...current.slice(lastBrokerIdx + 1),
      ];
    }
  } else {
    // Broker already present.
    if (!isDefault) return;
    if (existingIdx === firstBrokerIdx) return;
    const without = current.filter((_, i) => i !== existingIdx);
    const newFirst = without.findIndex(isBrokerEntry);
    const insertAt = newFirst === -1 ? without.length : newFirst;
    next = [
      ...without.slice(0, insertAt),
      newEntry,
      ...without.slice(insertAt),
    ];
  }

  const services = toPlcServices(next);

  const signRes = await client.call(
    "com.atproto.identity.signPlcOperation",
    undefined,
    { token: options.token, services },
  );
  const signData = signRes.data as
    | { operation?: Record<string, unknown> }
    | undefined;
  const operation = signData?.operation;
  if (!operation || typeof operation !== "object") {
    throw new Error("signPlcOperation did not return a signed operation");
  }

  await client.call("com.atproto.identity.submitPlcOperation", undefined, {
    operation,
  });
}
