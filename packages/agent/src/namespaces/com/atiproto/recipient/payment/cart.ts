import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoRecipientPaymentCartNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.recipient.payment.cart.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.cart.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.cart.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.recipient.payment.cart.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.cart.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.cart.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
