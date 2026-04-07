import type { LexiconDoc } from "@atproto/lexicon";

import AccountCartClone from "./schemas/account/cart/clone.json";
import AccountCartCreate from "./schemas/account/cart/create.json";
import AccountCartGet from "./schemas/account/cart/get.json";
import AccountCartList from "./schemas/account/cart/list.json";
import AccountCartPut from "./schemas/account/cart/put.json";
import AccountProfileGet from "./schemas/account/profile/get.json";
import AccountProfilePut from "./schemas/account/profile/put.json";
import Cart from "./schemas/cart.json";
import FeedList from "./schemas/feed/list.json";
import FeedSubscriptionCancel from "./schemas/feed/subscription/cancel.json";
import FeedSubscriptionCreate from "./schemas/feed/subscription/create.json";
import FeedSubscriptionGet from "./schemas/feed/subscription/get.json";
import FeedSubscriptionList from "./schemas/feed/subscription/list.json";
import FeedSubscriptionPut from "./schemas/feed/subscription/put.json";
import FeedTipCreate from "./schemas/feed/tip/create.json";
import FeedTipGet from "./schemas/feed/tip/get.json";
import FeedTipList from "./schemas/feed/tip/list.json";
import FeedTipPut from "./schemas/feed/tip/put.json";
import Profile from "./schemas/profile.json";
import RepoProfileGet from "./schemas/repo/profile/get.json";
import RepoSubscriptionSearch from "./schemas/repo/subscription/search.json";
import RepoSubscriptionValidate from "./schemas/repo/subscription/validate.json";
import RepoTipSearch from "./schemas/repo/tip/search.json";
import RepoTipValidate from "./schemas/repo/tip/validate.json";
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
  Cart,
  FeedList,
  FeedSubscriptionCancel,
  FeedSubscriptionCreate,
  FeedSubscriptionGet,
  FeedSubscriptionList,
  FeedSubscriptionPut,
  FeedTipCreate,
  FeedTipGet,
  FeedTipList,
  FeedTipPut,
  Profile,
  RepoProfileGet,
  RepoSubscriptionSearch,
  RepoSubscriptionValidate,
  RepoTipSearch,
  RepoTipValidate,
  Subscription,
  Tip,
] as LexiconDoc[];
