import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoAccountCartNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  clone(data: com.atiproto.account.cart.clone.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.cart.clone",
      undefined,
      data,
      opts,
    );
  }

  create(
    data: com.atiproto.account.cart.create.$InputBody,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.account.cart.create",
      undefined,
      data,
      opts,
    );
  }

  get(params: com.atiproto.account.cart.get.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.cart.get",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  list(params?: com.atiproto.account.cart.list.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.cart.list",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  put(data: com.atiproto.account.cart.put.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.cart.put",
      undefined,
      data,
      opts,
    );
  }
}
