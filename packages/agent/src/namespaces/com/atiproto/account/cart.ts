import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<XRPCResponse & { data: T }>;

export class ComAtiprotoAccountCartNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  clone(
    data: com.atiproto.account.cart.clone.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.cart.clone.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.cart.clone",
      undefined,
      data,
      opts,
    ) as any;
  }

  create(
    data: com.atiproto.account.cart.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.cart.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.cart.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.account.cart.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.cart.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.cart.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.account.cart.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.cart.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.cart.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.account.cart.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.cart.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.cart.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
