import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoAccountSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.account.subscription.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.subscription.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.subscription.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.account.subscription.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.subscription.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.subscription.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  validate(
    params?: com.atiproto.account.subscription.validate.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.subscription.validate.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.subscription.validate",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
