import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoFeedSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  cancel(
    data: com.atiproto.feed.subscription.cancel.$InputBody,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.feed.subscription.cancel",
      undefined,
      data,
      opts,
    );
  }

  create(
    data: com.atiproto.feed.subscription.create.$InputBody,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.feed.subscription.create",
      undefined,
      data,
      opts,
    );
  }

  get(params: com.atiproto.feed.subscription.get.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.subscription.get",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  list(
    params?: com.atiproto.feed.subscription.list.$Params,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.feed.subscription.list",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  put(data: com.atiproto.feed.subscription.put.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.subscription.put",
      undefined,
      data,
      opts,
    );
  }
}
