import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<XRPCResponse & { data: T }>;

export class ComAtiprotoRepoProfileNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params: com.atiproto.repo.profile.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.profile.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.profile.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
