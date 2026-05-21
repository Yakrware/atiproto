import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoNS } from "./com/atiproto.js";
import {
  appendBroker as runAppendBroker,
  type AppendBrokerOptions,
} from "./com/appendBroker.js";

function hasComNS(client: XrpcClient): client is XrpcClient & { com: object } {
  return "com" in client && !!client.com && typeof client.com === "object";
}

export class ComNS {
  atiproto: ComAtiprotoNS;
  private readonly _client: XrpcClient;

  constructor(client: XrpcClient, underlying?: XrpcClient) {
    this._client = client;
    this.atiproto = new ComAtiprotoNS(client);

    if (underlying && hasComNS(underlying)) {
      return new Proxy(this, {
        get(target, prop, receiver) {
          if (prop in target) return Reflect.get(target, prop, receiver);
          return Reflect.get(underlying.com, prop, receiver);
        },
      });
    }
  }

  /**
   * Append (or promote) a `PaymentBroker` service entry on the
   * authenticated user's DID document.
   *
   * The broker entry uses the W3C service shape:
   *
   *   { id: `${broker}#payment-broker`,
   *     type: "PaymentBroker",
   *     serviceEndpoint: "https://<host>" }
   *
   * `serviceEndpoint` is derived from the broker's did:web host (or
   * supplied via `options.serviceEndpoint`).
   *
   * Sort rules:
   * - If `broker` is new and no PaymentBroker entries exist yet, the
   *   new entry is appended to the end of the service array
   *   (regardless of `default`).
   * - If `broker` is new and `default` is true, the new entry is
   *   inserted just before the previous first PaymentBroker (other
   *   service entries that precede the broker block stay put).
   * - If `broker` is new and `default` is false, the new entry is
   *   appended just after the last PaymentBroker (keeping the broker
   *   block contiguous).
   * - If `broker` is already present and `default` is true, the entry
   *   is moved to the front of the broker block (no-op when it's
   *   already first).
   * - If `broker` is already present and `default` is false, no-op.
   *
   * Other services on the DID document are preserved untouched.
   *
   * Uses the standard atproto PLC flow: `resolveIdentity` ->
   * `signPlcOperation` -> `submitPlcOperation`. When the PDS requires
   * email confirmation, pass `options.token` from
   * `com.atproto.identity.requestPlcOperationSignature`.
   */
  appendBroker(broker: string, options?: AppendBrokerOptions): Promise<void> {
    return runAppendBroker(this._client, broker, options);
  }
}

export { ComAtiprotoNS };
export type { AppendBrokerOptions };
