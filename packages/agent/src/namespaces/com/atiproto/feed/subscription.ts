import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoFeedSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  cancel(
    data: com.atiproto.feed.subscription.cancel.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.subscription.cancel.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.subscription.cancel",
      undefined,
      data,
      opts,
    ) as any;
  }

  create(
    data: com.atiproto.feed.subscription.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.subscription.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.subscription.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.feed.subscription.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.subscription.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.subscription.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.feed.subscription.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.subscription.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.subscription.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.feed.subscription.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.subscription.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.subscription.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
