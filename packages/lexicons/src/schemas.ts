import type { LexiconDoc } from "@atproto/lexicon";

import AccountCartClone from "../../../lexicons/com/atiproto/account/cart/clone.json";
import AccountCartCreate from "../../../lexicons/com/atiproto/account/cart/create.json";
import AccountCartGet from "../../../lexicons/com/atiproto/account/cart/get.json";
import AccountCartList from "../../../lexicons/com/atiproto/account/cart/list.json";
import AccountCartPut from "../../../lexicons/com/atiproto/account/cart/put.json";
import AccountProfileGet from "../../../lexicons/com/atiproto/account/profile/get.json";
import AccountProfilePut from "../../../lexicons/com/atiproto/account/profile/put.json";
import Cart from "../../../lexicons/com/atiproto/cart.json";
import FeedList from "../../../lexicons/com/atiproto/feed/list.json";
import FeedSubscriptionCancel from "../../../lexicons/com/atiproto/feed/subscription/cancel.json";
import FeedSubscriptionCreate from "../../../lexicons/com/atiproto/feed/subscription/create.json";
import FeedSubscriptionGet from "../../../lexicons/com/atiproto/feed/subscription/get.json";
import FeedSubscriptionList from "../../../lexicons/com/atiproto/feed/subscription/list.json";
import FeedSubscriptionPut from "../../../lexicons/com/atiproto/feed/subscription/put.json";
import FeedTipCreate from "../../../lexicons/com/atiproto/feed/tip/create.json";
import FeedTipGet from "../../../lexicons/com/atiproto/feed/tip/get.json";
import FeedTipList from "../../../lexicons/com/atiproto/feed/tip/list.json";
import FeedTipPut from "../../../lexicons/com/atiproto/feed/tip/put.json";
import Profile from "../../../lexicons/com/atiproto/profile.json";
import RepoProfileGet from "../../../lexicons/com/atiproto/repo/profile/get.json";
import RepoSubscriptionSearch from "../../../lexicons/com/atiproto/repo/subscription/search.json";
import RepoSubscriptionValidate from "../../../lexicons/com/atiproto/repo/subscription/validate.json";
import RepoTipSearch from "../../../lexicons/com/atiproto/repo/tip/search.json";
import RepoTipValidate from "../../../lexicons/com/atiproto/repo/tip/validate.json";
import Subscription from "../../../lexicons/com/atiproto/subscription.json";
import Tip from "../../../lexicons/com/atiproto/tip.json";

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
