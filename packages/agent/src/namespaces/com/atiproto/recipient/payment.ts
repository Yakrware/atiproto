import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoRecipientPaymentCartNS } from "./payment/cart.js";
import { ComAtiprotoRecipientPaymentItemNS } from "./payment/item.js";
import { ComAtiprotoRecipientPaymentSubscriptionNS } from "./payment/subscription.js";

export class ComAtiprotoRecipientPaymentNS {
  _client: XrpcClient;
  cart: ComAtiprotoRecipientPaymentCartNS;
  item: ComAtiprotoRecipientPaymentItemNS;
  subscription: ComAtiprotoRecipientPaymentSubscriptionNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.cart = new ComAtiprotoRecipientPaymentCartNS(client);
    this.item = new ComAtiprotoRecipientPaymentItemNS(client);
    this.subscription = new ComAtiprotoRecipientPaymentSubscriptionNS(client);
  }
}

export {
  ComAtiprotoRecipientPaymentCartNS,
  ComAtiprotoRecipientPaymentItemNS,
  ComAtiprotoRecipientPaymentSubscriptionNS,
};
