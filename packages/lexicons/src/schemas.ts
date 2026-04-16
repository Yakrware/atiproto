import type { LexiconDoc } from "@atproto/lexicon";

import AccountCartClone from "./schemas/account/cart/clone.json";
import AccountCartCreate from "./schemas/account/cart/create.json";
import AccountCartGet from "./schemas/account/cart/get.json";
import AccountCartList from "./schemas/account/cart/list.json";
import AccountCartPut from "./schemas/account/cart/put.json";
import AccountProfileGet from "./schemas/account/profile/get.json";
import AccountProfilePut from "./schemas/account/profile/put.json";
import AccountSubscriptionGet from "./schemas/account/subscription/get.json";
import AccountSubscriptionList from "./schemas/account/subscription/list.json";
import AccountSubscriptionValidate from "./schemas/account/subscription/validate.json";
import AccountTipGet from "./schemas/account/tip/get.json";
import AccountTipList from "./schemas/account/tip/list.json";
import AccountTipValidate from "./schemas/account/tip/validate.json";
import Cart from "./schemas/cart.json";
import FeedList from "./schemas/feed/list.json";
import FeedSubscriptionCancel from "./schemas/feed/subscription/cancel.json";
import FeedSubscriptionCreate from "./schemas/feed/subscription/create.json";
import FeedSubscriptionGet from "./schemas/feed/subscription/get.json";
import FeedSubscriptionList from "./schemas/feed/subscription/list.json";
import FeedSubscriptionPut from "./schemas/feed/subscription/put.json";
import FeedSubscriptionValidate from "./schemas/feed/subscription/validate.json";
import FeedTipCreate from "./schemas/feed/tip/create.json";
import FeedTipGet from "./schemas/feed/tip/get.json";
import FeedTipList from "./schemas/feed/tip/list.json";
import FeedTipPut from "./schemas/feed/tip/put.json";
import FeedTipValidate from "./schemas/feed/tip/validate.json";
import Profile from "./schemas/profile.json";
import RepoProfileGet from "./schemas/repo/profile/get.json";
import RepoSubscriptionCount from "./schemas/repo/subscription/count.json";
import RepoTipCount from "./schemas/repo/tip/count.json";
import AuthEnhanced from "./schemas/authEnhanced.json";
import AuthGeneral from "./schemas/authGeneral.json";
import Subscription from "./schemas/subscription.json";
import Tip from "./schemas/tip.json";

export const schemas: LexiconDoc[] = [
  AccountCartClone,
  AccountCartCreate,
  AccountCartGet,
  AccountCartList,
  AccountCartPut,
  AccountProfileGet,
  AccountProfilePut,
  AccountSubscriptionGet,
  AccountSubscriptionList,
  AccountSubscriptionValidate,
  AccountTipGet,
  AccountTipList,
  AccountTipValidate,
  Cart,
  FeedList,
  FeedSubscriptionCancel,
  FeedSubscriptionCreate,
  FeedSubscriptionGet,
  FeedSubscriptionList,
  FeedSubscriptionPut,
  FeedSubscriptionValidate,
  FeedTipCreate,
  FeedTipGet,
  FeedTipList,
  FeedTipPut,
  FeedTipValidate,
  Profile,
  RepoProfileGet,
  RepoSubscriptionCount,
  RepoTipCount,
  AuthEnhanced,
  AuthGeneral,
  Subscription,
  Tip,
] as LexiconDoc[];
