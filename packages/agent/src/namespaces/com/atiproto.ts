import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoAccountNS } from "./atiproto/account.js";
import { ComAtiprotoFeedNS } from "./atiproto/feed.js";
import { ComAtiprotoRepoNS } from "./atiproto/repo.js";

export class ComAtiprotoNS {
  _client: XrpcClient;
  account: ComAtiprotoAccountNS;
  feed: ComAtiprotoFeedNS;
  repo: ComAtiprotoRepoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.account = new ComAtiprotoAccountNS(client);
    this.feed = new ComAtiprotoFeedNS(client);
    this.repo = new ComAtiprotoRepoNS(client);
  }
}

export { ComAtiprotoAccountNS, ComAtiprotoFeedNS, ComAtiprotoRepoNS };
