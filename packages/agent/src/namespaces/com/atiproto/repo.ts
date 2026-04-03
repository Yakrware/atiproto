import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoRepoProfileNS } from "./repo/profile.js";
import { ComAtiprotoRepoSubscriptionNS } from "./repo/subscription.js";
import { ComAtiprotoRepoTipNS } from "./repo/tip.js";

export class ComAtiprotoRepoNS {
  _client: XrpcClient;
  profile: ComAtiprotoRepoProfileNS;
  subscription: ComAtiprotoRepoSubscriptionNS;
  tip: ComAtiprotoRepoTipNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.profile = new ComAtiprotoRepoProfileNS(client);
    this.subscription = new ComAtiprotoRepoSubscriptionNS(client);
    this.tip = new ComAtiprotoRepoTipNS(client);
  }
}

export {
  ComAtiprotoRepoProfileNS,
  ComAtiprotoRepoSubscriptionNS,
  ComAtiprotoRepoTipNS,
};
