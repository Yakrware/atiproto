import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoRepoSubscriptionNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  search(
    params: com.atiproto.repo.subscription.search.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.subscription.search.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.subscription.search",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  validate(
    params: com.atiproto.repo.subscription.validate.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.subscription.validate.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.subscription.validate",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
