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

  /**
   * Append (or promote) a `PaymentBroker` service entry on the
   * authenticated user's DID document. See `appendBroker` in
   * `./com/appendBroker.ts` for the full behavior.
   *
   * Bound as an instance property (rather than a class method) so that
   * `ComNS` carries no private fields. The agent's `com` is a structural
   * intersection of this class with the underlying client's `com`
   * namespace; a private `_client` here would collide with the public
   * `_client` on `@atproto/api`'s ComNS and collapse the intersection
   * to `never`.
   */
  appendBroker: (
    broker: string,
    options?: AppendBrokerOptions,
  ) => Promise<void>;

  constructor(client: XrpcClient, underlying?: XrpcClient) {
    this.atiproto = new ComAtiprotoNS(client);
    this.appendBroker = (broker, options) =>
      runAppendBroker(client, broker, options);

    if (underlying && hasComNS(underlying)) {
      return new Proxy(this, {
        get(target, prop, receiver) {
          if (prop in target) return Reflect.get(target, prop, receiver);
          return Reflect.get(underlying.com, prop, receiver);
        },
      });
    }
  }
}

export { ComAtiprotoNS };
export type { AppendBrokerOptions };
