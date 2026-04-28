import type { XrpcClient } from "@atproto/xrpc";
import { ComAtiprotoRecipientPaymentNS } from "./recipient/payment.js";
import { ComAtiprotoRecipientProfileNS } from "./recipient/profile.js";

export class ComAtiprotoRecipientNS {
  _client: XrpcClient;
  payment: ComAtiprotoRecipientPaymentNS;
  profile: ComAtiprotoRecipientProfileNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.payment = new ComAtiprotoRecipientPaymentNS(client);
    this.profile = new ComAtiprotoRecipientProfileNS(client);
  }
}

export { ComAtiprotoRecipientPaymentNS, ComAtiprotoRecipientProfileNS };
