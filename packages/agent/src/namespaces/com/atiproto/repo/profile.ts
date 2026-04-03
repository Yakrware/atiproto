import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoRepoProfileNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(params: com.atiproto.repo.profile.get.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.repo.profile.get",
      params as QueryParams,
      undefined,
      opts,
    );
  }
}
