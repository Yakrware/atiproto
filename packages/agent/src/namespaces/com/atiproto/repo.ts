import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoRepoItemNS } from "./repo/item.js";
import { ComAtiprotoRepoProfileNS } from "./repo/profile.js";
import { ComAtiprotoRepoSubscriptionNS } from "./repo/subscription.js";

export class ComAtiprotoRepoNS {
  _client: XrpcClient;
  item: ComAtiprotoRepoItemNS;
  profile: ComAtiprotoRepoProfileNS;
  subscription: ComAtiprotoRepoSubscriptionNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.item = new ComAtiprotoRepoItemNS(client);
    this.profile = new ComAtiprotoRepoProfileNS(client);
    this.subscription = new ComAtiprotoRepoSubscriptionNS(client);
  }
}

export {
  ComAtiprotoRepoItemNS,
  ComAtiprotoRepoProfileNS,
  ComAtiprotoRepoSubscriptionNS,
};
