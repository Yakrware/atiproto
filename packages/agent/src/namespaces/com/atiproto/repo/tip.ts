import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoRepoTipNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  search(params: com.atiproto.repo.tip.search.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.repo.tip.search",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  validate(params: com.atiproto.repo.tip.validate.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.repo.tip.validate",
      params as QueryParams,
      undefined,
      opts,
    );
  }
}
