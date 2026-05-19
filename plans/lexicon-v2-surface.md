# Lexicon v2: Surface Reference

Two namespaces with very different ownership:

- **`network.attested.*`** is a shared cross-party protocol vocabulary (defined by attested.network). Both the broker and the PoS implement subsets of it.
- **`com.atiproto.*`** is our PoS authority. Name may change; kept stable through v2 development.

PoS↔broker traffic always flows through the agent workflow layer (the PoS responds with an outbound workflow telling the agent to call the broker on the payer's behalf). See `lexicon-v2.md`.

---

## `network.attested.*` (shared protocol)

Proposed contributions to attested.network. Drafts will live in `packages/lexicons/src/associated-schemas/`.

### Records

| NSID | Type | Implemented by | Description |
| --- | --- | --- | --- |
| `network.attested.payment` | record | broker | Wholly-defined payment: subject, line items (type/description/amount/currency/ref + subscription fields), status, broker DID, signatures. |
| `network.attested.entitlement` | record | PoS (issuer) | Lexicon-agnostic entitlement: subject, entitlements strongRef array, issuedFor (payment uri), signatures. Created by the PoS post-checkout. |

### Endpoints

| NSID | Type | Implemented by | Description |
| --- | --- | --- | --- |
| `network.attested.payment.initiate` | procedure | broker | Sole broker checkout primitive. Called by the agent on behalf of the payer; returns checkout_url and creates the pending payment record. |
| `network.attested.payment.status` | query | broker | Broker-authoritative status lookup by payment uri. |
| `network.attested.verify` | query | broker and PoS | Open to any caller for signature-only verification. Accepts a `hydrate` parameter; hydrated private fields returned only to signing parties. Cross-layer checks routed via workflow. |

---

## `com.atiproto.*` (PoS authority, name unsettled)

A compliant PoS must implement everything in "required" below. Optional rows are nice-to-have; clients fall back to root atproto calls plus our `get`.

### Required records

| NSID | Type | Description |
| --- | --- | --- |
| `com.atiproto.profile` | record | Per-user payment settings: brokers list, accepts-flags. |
| `com.atiproto.cart` | record | Shopping cart of items / subscriptions, payable in one checkout. Private by default. |
| `com.atiproto.item` | record | One-time payment line item. Private by default. |
| `com.atiproto.subscription` | record | Recurring payment line item. Private by default. |

### Required endpoints (`com.atiproto.payment.*`)

| NSID | Type | Description |
| --- | --- | --- |
| `payment.cart.checkout` | procedure | Finalize cart, sign records. Accepts optional `broker` (single did:web). Response: `{ cart, checkoutUrl?, payment? }`. With broker: `checkoutUrl` and `payment` populated (workflow-mediated today, direct in the future). Without broker: caller routes to a broker themselves and uses `cart.put` to attach the payment ref. |
| `payment.cart.get` | query | Hydrate a cart by uri. Live-fetches broker payment status when a payment ref is attached. |
| `payment.item.get` | query | Hydrate an item by uri. |
| `payment.subscription.get` | query | Hydrate a subscription by uri. |
| `payment.subscription.cancel` | procedure | Cancel a recurring subscription. PoS marks intent, then workflows the agent to call the same NSID on the broker, which terminates billing at the processor. |

### Required endpoints (`com.atiproto.recipient.*`)

| NSID | Type | Description |
| --- | --- | --- |
| `recipient.payment.cart.get` | query | Hydrate an incoming cart by uri. |
| `recipient.payment.item.get` | query | Hydrate an incoming item by uri. |
| `recipient.payment.subscription.get` | query | Hydrate an incoming subscription by uri. |
| `recipient.profile.get` | query | Authed user fetches their own profile + payment-readiness flags. |

### Required endpoints (`com.atiproto.repo.*`)

| NSID | Type | Description |
| --- | --- | --- |
| `repo.profile.get` | query | Public profile lookup by DID. |

### Required auth permission-sets

| NSID | Type | Description |
| --- | --- | --- |
| `com.atiproto.actions` | permission-set | Bundles the procedure scopes a typical client needs. |
| `com.atiproto.authGeneral` | permission-set | General-access read scopes. |
| `com.atiproto.authEnhanced` | permission-set | Elevated scopes for trusted clients. |

### Optional endpoints

| NSID | Type | Description |
| --- | --- | --- |
| `payment.cart.put` | procedure | Update a cart record. Accepts a `payment` strongRef so a caller that ran the broker call themselves can attach the resulting `network.attested.payment` to the cart (this field is not writeable via `repo.putRecord` because only the PoS can validate it). |
| `payment.item.put` | procedure | Update an item record. Fallback: `repo.putRecord`. |
| `payment.subscription.put` | procedure | Update a subscription record. Fallback: `repo.putRecord`. |
| `payment.item.list` | query | List items sent by authed user, filtered by `subject` / `recordUri`. Fallback: `repo.listRecords` + per-record `get`. |
| `payment.subscription.list` | query | List subscriptions sent by authed user, filtered by `subject`. Fallback: `repo.listRecords` + per-record `get`. |
| `recipient.payment.cart.list` | query | List incoming carts. *No PDS fallback* (recipient-list gap; see lexicon-v2.md). |
| `recipient.payment.item.list` | query | List incoming items, filtered by `sender` / `recordUri`. *No PDS fallback.* |
| `recipient.payment.subscription.list` | query | List incoming subscriptions, filtered by `sender`. *No PDS fallback.* |
| `recipient.profile.put` | procedure | Update authed user's profile. Implementations that do server-side provisioning (e.g. Stripe Connect) implement it; others rely on `repo.putRecord`. |
| `repo.item.count` | query | Count completed items, optionally filtered by `recordUri` / `subject` / date window. |
| `repo.subscription.count` | query | Count active subscriptions, similar filters. |

---

## Notes

- **PoS↔broker auth.** All cross-party calls go through the agent workflow layer; neither side authenticates as the other. Outbound workflow returned by the PoS instructs the agent to call the broker on the payer's behalf; agent callbacks the PoS with the result.
- **Privacy.** By default, records written to the payer's PDS are stripped of identifying marks (subject DID, recordUri, entitlement refs). The PDS copy attests "a record of this kind exists, signed by these parties." Full records are retained by the issuing service. Post-spaces, full records live in a space provisioned for {payer, recipient, PoS, broker}.
- **Signatures.** Every signed record carries a `signatures` array using the badge.blue scheme.
  - `com.atiproto.cart` / `item` / `subscription`: PoS + recipient AppView.
  - `network.attested.payment`: broker only.
  - `network.attested.entitlement`: PoS only.
- **Verify.** `network.attested.verify` is open to any caller. Signature-only by default; `hydrate=true` returns private fields only to signing parties. Cross-layer checks route through workflow.
- **Entitlements.** PoS issues entitlements as a post-checkout completion step. Stripped copy written to the payer's PDS; full record retained by the PoS (and migrates to the shared space when available).
