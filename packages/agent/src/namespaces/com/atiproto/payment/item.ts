import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoPaymentItemNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  create(
    data: com.atiproto.payment.item.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.item.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.item.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.payment.item.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.item.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.item.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.payment.item.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.item.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.item.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.payment.item.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.payment.item.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.payment.item.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
