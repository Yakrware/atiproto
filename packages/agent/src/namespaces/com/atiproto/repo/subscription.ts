import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoRepoSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  search(
    params: com.atiproto.repo.subscription.search.$Params,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.repo.subscription.search",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  validate(
    params: com.atiproto.repo.subscription.validate.$Params,
    opts?: CallOptions,
  ) {
    return this._client.call(
      "com.atiproto.repo.subscription.validate",
      params as QueryParams,
      undefined,
      opts,
    );
  }
}
