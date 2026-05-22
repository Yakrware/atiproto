import { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoPaymentCartNS } from "./payment/cart.js";
import { ComAtiprotoPaymentItemNS } from "./payment/item.js";
import { ComAtiprotoPaymentSubscriptionNS } from "./payment/subscription.js";

export class ComAtiprotoPaymentNS {
  _client: XrpcClient;
  cart: ComAtiprotoPaymentCartNS;
  item: ComAtiprotoPaymentItemNS;
  subscription: ComAtiprotoPaymentSubscriptionNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.cart = new ComAtiprotoPaymentCartNS(client);
    this.item = new ComAtiprotoPaymentItemNS(client);
    this.subscription = new ComAtiprotoPaymentSubscriptionNS(client);
  }
}

export {
  ComAtiprotoPaymentCartNS,
  ComAtiprotoPaymentItemNS,
  ComAtiprotoPaymentSubscriptionNS,
};
