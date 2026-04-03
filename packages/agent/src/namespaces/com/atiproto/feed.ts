import { XrpcClient, type CallOptions, type QueryParams } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";
import { ComAtiprotoFeedSubscriptionNS } from "./feed/subscription.js";
import { ComAtiprotoFeedTipNS } from "./feed/tip.js";

export class ComAtiprotoFeedNS {
  _client: XrpcClient;
  subscription: ComAtiprotoFeedSubscriptionNS;
  tip: ComAtiprotoFeedTipNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.subscription = new ComAtiprotoFeedSubscriptionNS(client);
    this.tip = new ComAtiprotoFeedTipNS(client);
  }

  list(params?: com.atiproto.feed.list.$Params, opts?: CallOptions) {
    return this._client.call(
      "com.atiproto.feed.list",
      params as QueryParams,
      undefined,
      opts,
    );
  }
}

export { ComAtiprotoFeedSubscriptionNS, ComAtiprotoFeedTipNS };
