import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoPaymentNS } from "./atiproto/payment.js";
import { ComAtiprotoRecipientNS } from "./atiproto/recipient.js";
import { ComAtiprotoRepoNS } from "./atiproto/repo.js";

export class ComAtiprotoNS {
  _client: XrpcClient;
  payment: ComAtiprotoPaymentNS;
  recipient: ComAtiprotoRecipientNS;
  repo: ComAtiprotoRepoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.payment = new ComAtiprotoPaymentNS(client);
    this.recipient = new ComAtiprotoRecipientNS(client);
    this.repo = new ComAtiprotoRepoNS(client);
  }
}

export { ComAtiprotoPaymentNS, ComAtiprotoRecipientNS, ComAtiprotoRepoNS };
