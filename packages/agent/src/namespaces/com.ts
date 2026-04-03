import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoNS } from "./com/atiproto.js";

export class ComNS {
  _client: XrpcClient;
  atiproto: ComAtiprotoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.atiproto = new ComAtiprotoNS(client);
  }
}

export { ComAtiprotoNS };
