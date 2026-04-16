import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoAccountTipNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.account.tip.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.tip.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.tip.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.account.tip.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.tip.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.tip.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  validate(
    params?: com.atiproto.account.tip.validate.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.tip.validate.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.tip.validate",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
