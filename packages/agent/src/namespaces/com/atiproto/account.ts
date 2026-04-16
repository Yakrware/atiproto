import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoAccountCartNS } from "./account/cart.js";
import { ComAtiprotoAccountProfileNS } from "./account/profile.js";
import { ComAtiprotoAccountSubscriptionNS } from "./account/subscription.js";
import { ComAtiprotoAccountTipNS } from "./account/tip.js";

export class ComAtiprotoAccountNS {
  _client: XrpcClient;
  cart: ComAtiprotoAccountCartNS;
  profile: ComAtiprotoAccountProfileNS;
  subscription: ComAtiprotoAccountSubscriptionNS;
  tip: ComAtiprotoAccountTipNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.cart = new ComAtiprotoAccountCartNS(client);
    this.profile = new ComAtiprotoAccountProfileNS(client);
    this.subscription = new ComAtiprotoAccountSubscriptionNS(client);
    this.tip = new ComAtiprotoAccountTipNS(client);
  }
}

export {
  ComAtiprotoAccountCartNS,
  ComAtiprotoAccountProfileNS,
  ComAtiprotoAccountSubscriptionNS,
  ComAtiprotoAccountTipNS,
};
