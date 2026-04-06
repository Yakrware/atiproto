import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<XRPCResponse & { data: T }>;

export class ComAtiprotoRepoTipNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  search(
    params: com.atiproto.repo.tip.search.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.tip.search.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.tip.search",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  validate(
    params: com.atiproto.repo.tip.validate.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.tip.validate.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.tip.validate",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
