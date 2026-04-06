import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<XRPCResponse & { data: T }>;

export class ComAtiprotoFeedTipNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  create(
    data: com.atiproto.feed.tip.create.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.tip.create.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.tip.create",
      undefined,
      data,
      opts,
    ) as any;
  }

  get(
    params: com.atiproto.feed.tip.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.tip.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.tip.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  list(
    params?: com.atiproto.feed.tip.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.tip.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.tip.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.feed.tip.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.tip.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.tip.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
