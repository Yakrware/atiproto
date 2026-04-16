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

  count(
    params: com.atiproto.repo.subscription.count.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.repo.subscription.count.$OutputBody> {
    return this._client.call(
      "com.atiproto.repo.subscription.count",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}
