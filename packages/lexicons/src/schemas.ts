import type { LexiconDoc } from "@atproto/lexicon";

import Actions from "./schemas/actions.json";
import AuthEnhanced from "./schemas/authEnhanced.json";
import AuthGeneral from "./schemas/authGeneral.json";
import Cart from "./schemas/cart.json";
import Item from "./schemas/item.json";
import Profile from "./schemas/profile.json";
import Subscription from "./schemas/subscription.json";

import PaymentList from "./schemas/payment/list.json";
import PaymentCartClone from "./schemas/payment/cart/clone.json";
import PaymentCartCreate from "./schemas/payment/cart/create.json";
import PaymentCartGet from "./schemas/payment/cart/get.json";
import PaymentCartList from "./schemas/payment/cart/list.json";
import PaymentCartPut from "./schemas/payment/cart/put.json";
import PaymentItemCreate from "./schemas/payment/item/create.json";
import PaymentItemGet from "./schemas/payment/item/get.json";
import PaymentItemList from "./schemas/payment/item/list.json";
import PaymentItemPut from "./schemas/payment/item/put.json";
import PaymentItemValidate from "./schemas/payment/item/validate.json";
import PaymentSubscriptionCancel from "./schemas/payment/subscription/cancel.json";
import PaymentSubscriptionCreate from "./schemas/payment/subscription/create.json";
import PaymentSubscriptionGet from "./schemas/payment/subscription/get.json";
import PaymentSubscriptionList from "./schemas/payment/subscription/list.json";
import PaymentSubscriptionPut from "./schemas/payment/subscription/put.json";
import PaymentSubscriptionValidate from "./schemas/payment/subscription/validate.json";

import RecipientProfileGet from "./schemas/recipient/profile/get.json";
import RecipientProfilePut from "./schemas/recipient/profile/put.json";
import RecipientPaymentCartGet from "./schemas/recipient/payment/cart/get.json";
import RecipientPaymentCartList from "./schemas/recipient/payment/cart/list.json";
import RecipientPaymentItemGet from "./schemas/recipient/payment/item/get.json";
import RecipientPaymentItemList from "./schemas/recipient/payment/item/list.json";
import RecipientPaymentItemValidate from "./schemas/recipient/payment/item/validate.json";
import RecipientPaymentSubscriptionGet from "./schemas/recipient/payment/subscription/get.json";
import RecipientPaymentSubscriptionList from "./schemas/recipient/payment/subscription/list.json";
import RecipientPaymentSubscriptionValidate from "./schemas/recipient/payment/subscription/validate.json";

import RepoItemCount from "./schemas/repo/item/count.json";
import RepoProfileGet from "./schemas/repo/profile/get.json";
import RepoSubscriptionCount from "./schemas/repo/subscription/count.json";

export const schemas: LexiconDoc[] = [
  Actions,
  AuthEnhanced,
  AuthGeneral,
  Cart,
  Item,
  Profile,
  Subscription,

  PaymentList,
  PaymentCartClone,
  PaymentCartCreate,
  PaymentCartGet,
  PaymentCartList,
  PaymentCartPut,
  PaymentItemCreate,
  PaymentItemGet,
  PaymentItemList,
  PaymentItemPut,
  PaymentItemValidate,
  PaymentSubscriptionCancel,
  PaymentSubscriptionCreate,
  PaymentSubscriptionGet,
  PaymentSubscriptionList,
  PaymentSubscriptionPut,
  PaymentSubscriptionValidate,

  RecipientProfileGet,
  RecipientProfilePut,
  RecipientPaymentCartGet,
  RecipientPaymentCartList,
  RecipientPaymentItemGet,
  RecipientPaymentItemList,
  RecipientPaymentItemValidate,
  RecipientPaymentSubscriptionGet,
  RecipientPaymentSubscriptionList,
  RecipientPaymentSubscriptionValidate,

  RepoItemCount,
  RepoProfileGet,
  RepoSubscriptionCount,
] as LexiconDoc[];
