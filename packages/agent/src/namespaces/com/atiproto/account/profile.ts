import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export class ComAtiprotoAccountProfileNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(params?: com.atiproto.account.profile.get.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.profile.get",
      params as QueryParams,
      undefined,
      opts,
    );
  }

  put(data: com.atiproto.account.profile.put.$InputBody, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.account.profile.put",
      undefined,
      data,
      opts,
    );
  }
}
