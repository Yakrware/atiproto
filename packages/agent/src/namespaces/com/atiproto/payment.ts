import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";
import { ComAtiprotoPaymentCartNS } from "./payment/cart.js";
import { ComAtiprotoPaymentItemNS } from "./payment/item.js";
import { ComAtiprotoPaymentSubscriptionNS } from "./payment/subscription.js";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

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

  list(
    params?: com.atiproto.payment.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}

export {
  ComAtiprotoPaymentCartNS,
  ComAtiprotoPaymentItemNS,
  ComAtiprotoPaymentSubscriptionNS,
};
