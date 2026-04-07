import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoAccountProfileNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.account.profile.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.profile.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.profile.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.account.profile.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.account.profile.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.account.profile.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
