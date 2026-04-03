import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoAccountCartNS } from "./account/cart.js";
import { ComAtiprotoAccountProfileNS } from "./account/profile.js";

export class ComAtiprotoAccountNS {
  _client: XrpcClient;
  cart: ComAtiprotoAccountCartNS;
  profile: ComAtiprotoAccountProfileNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.cart = new ComAtiprotoAccountCartNS(client);
    this.profile = new ComAtiprotoAccountProfileNS(client);
  }
}

export { ComAtiprotoAccountCartNS, ComAtiprotoAccountProfileNS };
