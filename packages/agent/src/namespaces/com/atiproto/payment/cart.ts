import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoPaymentCartNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  checkout(
    data: com.atiproto.payment.cart.checkout.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.cart.checkout.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.cart.checkout",
      undefined,
      data,
      opts,
    ) as any;
  }

  create(
    data: com.atiproto.payment.cart.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.cart.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.cart.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.payment.cart.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.cart.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.cart.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.payment.cart.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.cart.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.cart.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.payment.cart.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.cart.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.cart.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
