import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoNS } from "./com/atiproto.js";

function hasComNS(client: XrpcClient): client is XrpcClient & { com: object } {
  return "com" in client && !!client.com && typeof client.com === "object";
}

export class ComNS {
  atiproto: ComAtiprotoNS;

  constructor(client: XrpcClient, underlying?: XrpcClient) {
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
}

export { ComAtiprotoNS };
