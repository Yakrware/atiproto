import {
  XrpcClient,
  type CallOptions,
  type QueryParams,
  XRPCResponse,
} from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";
import { ComAtiprotoFeedSubscriptionNS } from "./feed/subscription.js";
import { ComAtiprotoFeedTipNS } from "./feed/tip.js";

type TypedResponse<T> = Promise<XRPCResponse & { data: T }>;

export class ComAtiprotoFeedNS {
  _client: XrpcClient;
  subscription: ComAtiprotoFeedSubscriptionNS;
  tip: ComAtiprotoFeedTipNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.subscription = new ComAtiprotoFeedSubscriptionNS(client);
    this.tip = new ComAtiprotoFeedTipNS(client);
  }

  list(
    params?: com.atiproto.feed.list.$Params,
    opts?: CallOptions,
  ): TypedResponse<com.atiproto.feed.list.$OutputBody> {
    return this._client.call(
      "com.atiproto.feed.list",
      params as QueryParams,
      undefined,
      opts,
    ) as any;
  }
}

export { ComAtiprotoFeedSubscriptionNS, ComAtiprotoFeedTipNS };
