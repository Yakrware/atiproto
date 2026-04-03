import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoFeedTipNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  create(data: com.atiproto.feed.tip.create.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.tip.create",
      undefined,
      data,
      opts,
    );
  }

  get(params: com.atiproto.feed.tip.get.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.tip.get",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  list(params?: com.atiproto.feed.tip.list.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.tip.list",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  put(data: com.atiproto.feed.tip.put.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.tip.put",
      undefined,
      data,
      opts,
    );
  }
}
