import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoPaymentSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  cancel(
    data: com.atiproto.payment.subscription.cancel.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.subscription.cancel.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.subscription.cancel",
      undefined,
      data,
      opts,
    ) as any;
  }

  create(
    data: com.atiproto.payment.subscription.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.subscription.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.subscription.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.payment.subscription.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.subscription.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.subscription.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.payment.subscription.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.subscription.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.subscription.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.payment.subscription.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.subscription.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.subscription.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
