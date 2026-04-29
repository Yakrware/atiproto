import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

type TypedResponse<T> = Promise<Omit<XRPCResponse, "data"> & { data: T }>;

export class ComAtiprotoRecipientProfileNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  get(
    params?: com.atiproto.recipient.profile.get.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.profile.get.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.profile.get",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }

  put(
    data: com.atiproto.recipient.profile.put.$InputBody,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.recipient.profile.put.$OutputBody> {
    return this._client.call(
      "com.atiproto.recipient.profile.put",
      undefined,
      data,
      opts,
    ) as any;
  }
}
