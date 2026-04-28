import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoRecipientPaymentSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.recipient.payment.subscription.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.subscription.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.subscription.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.recipient.payment.subscription.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.subscription.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.subscription.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  validate(
    params?: com.atiproto.recipient.payment.subscription.validate.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.payment.subscription.validate.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.payment.subscription.validate",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
