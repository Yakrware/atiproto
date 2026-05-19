import type { LexiconDoc } from "@atproto/lexicon";

import Actions from "./schemas/actions.json";
import AuthReadEntitlements from "./schemas/authReadEntitlements.json";
import AuthReadCart from "./schemas/authReadCart.json";
import AuthReadPayments from "./schemas/authReadPayments.json";
import AuthReadPublic from "./schemas/authReadPublic.json";
import AuthCreateCart from "./schemas/authCreateCart.json";
import AuthCreatePayment from "./schemas/authCreatePayment.json";
import AuthReadRecipient from "./schemas/authReadRecipient.json";
import AuthWriteProfile from "./schemas/authWriteProfile.json";
import Cart from "./schemas/cart.json";
import Item from "./schemas/item.json";
import Profile from "./schemas/profile.json";
import Subscription from "./schemas/subscription.json";

import PaymentCartCheckout from "./schemas/payment/cart/checkout.json";
import PaymentCartCreate from "./schemas/payment/cart/create.json";
import PaymentCartGet from "./schemas/payment/cart/get.json";
import PaymentCartList from "./schemas/payment/cart/list.json";
import PaymentCartPut from "./schemas/payment/cart/put.json";
import PaymentItemCreate from "./schemas/payment/item/create.json";
import PaymentItemGet from "./schemas/payment/item/get.json";
import PaymentItemList from "./schemas/payment/item/list.json";
import PaymentItemPut from "./schemas/payment/item/put.json";
import PaymentSubscriptionCancel from "./schemas/payment/subscription/cancel.json";
import PaymentSubscriptionCreate from "./schemas/payment/subscription/create.json";
import PaymentSubscriptionGet from "./schemas/payment/subscription/get.json";
import PaymentSubscriptionList from "./schemas/payment/subscription/list.json";
import PaymentSubscriptionPut from "./schemas/payment/subscription/put.json";

import RecipientProfileGet from "./schemas/recipient/profile/get.json";
import RecipientProfilePut from "./schemas/recipient/profile/put.json";
import RecipientPaymentCartGet from "./schemas/recipient/payment/cart/get.json";
import RecipientPaymentCartList from "./schemas/recipient/payment/cart/list.json";
import RecipientPaymentItemGet from "./schemas/recipient/payment/item/get.json";
import RecipientPaymentItemList from "./schemas/recipient/payment/item/list.json";
import RecipientPaymentSubscriptionGet from "./schemas/recipient/payment/subscription/get.json";
import RecipientPaymentSubscriptionList from "./schemas/recipient/payment/subscription/list.json";

import RepoItemCount from "./schemas/repo/item/count.json";
import RepoProfileGet from "./schemas/repo/profile/get.json";
import RepoSubscriptionCount from "./schemas/repo/subscription/count.json";

// `network.attested.*` is a shared cross-party protocol vocabulary defined
// upstream by attested.network. The JSON drafts in `associated-schemas/` are
// our proposed contributions; they ship in this package so the agent and docs
// can consume them, but the source of truth is upstream. The same folder
// vendors stock atproto schemas we depend on (e.g. `com.atproto.repo.strongRef`,
// pulled via `goat lex pull`) so the lex builder can resolve cross-authority
// refs without our schemas needing to inline them.
import AtprotoRepoStrongRef from "./associated-schemas/strongRef.json";
import NetworkAttestedSignature from "./associated-schemas/signature.json";
import NetworkAttestedProof from "./associated-schemas/proof.json";
import NetworkAttestedPayment from "./associated-schemas/payment.json";
import NetworkAttestedEntitlement from "./associated-schemas/entitlement.json";
import NetworkAttestedPaymentInitiate from "./associated-schemas/payment/initiate.json";
import NetworkAttestedPaymentStatus from "./associated-schemas/payment/status.json";
import NetworkAttestedVerify from "./associated-schemas/verify.json";

export const schemas: LexiconDoc[] = [
  Actions,
  AuthReadEntitlements,
  AuthReadCart,
  AuthReadPayments,
  AuthReadPublic,
  AuthCreateCart,
  AuthCreatePayment,
  AuthReadRecipient,
  AuthWriteProfile,
  Cart,
  Item,
  Profile,
  Subscription,

  PaymentCartCheckout,
  PaymentCartCreate,
  PaymentCartGet,
  PaymentCartList,
  PaymentCartPut,
  PaymentItemCreate,
  PaymentItemGet,
  PaymentItemList,
  PaymentItemPut,
  PaymentSubscriptionCancel,
  PaymentSubscriptionCreate,
  PaymentSubscriptionGet,
  PaymentSubscriptionList,
  PaymentSubscriptionPut,

  RecipientProfileGet,
  RecipientProfilePut,
  RecipientPaymentCartGet,
  RecipientPaymentCartList,
  RecipientPaymentItemGet,
  RecipientPaymentItemList,
  RecipientPaymentSubscriptionGet,
  RecipientPaymentSubscriptionList,

  RepoItemCount,
  RepoProfileGet,
  RepoSubscriptionCount,
] as LexiconDoc[];

// Associated `network.attested.*` schemas. Exported separately so consumers
// (docs, agent) can render them under their own authority section and so the
// build pipeline can treat them as upstream-owned rather than ours.
export const associatedSchemas: LexiconDoc[] = [
  AtprotoRepoStrongRef,
  NetworkAttestedSignature,
  NetworkAttestedProof,
  NetworkAttestedPayment,
  NetworkAttestedEntitlement,
  NetworkAttestedPaymentInitiate,
  NetworkAttestedPaymentStatus,
  NetworkAttestedVerify,
] as LexiconDoc[];

// `allSchemas` is the combined list used by validators and lex-generated
// types. Order matters for ref resolution: refs to `network.attested.*` from
// `com.atiproto.*` records need the target available at validation time.
export const allSchemas: LexiconDoc[] = [...associatedSchemas, ...schemas];
