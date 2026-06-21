import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoRecipientPaymentItemNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.recipient.payment.item.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.item.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.item.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.recipient.payment.item.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.item.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.item.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
