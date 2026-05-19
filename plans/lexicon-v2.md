# Lexicon v2 Plan

**Status:** drafting
**Started:** 2026-05-06
**Updated:** 2026-05-14
**Scope:** restructure into a 4-party architecture; adopt `network.attested.*` as a shared cross-party protocol vocabulary; keep our PoS schemas under `com.atiproto.*` until a new name is settled.

## Background

This plan replaces the earlier "single namespace, broker does everything" v2 draft. The pivot is based on the discussion in [discourse thread 841](https://discourse.atprotocol.community/t/did-a-bit-of-parallel-development-first-second-impressions/841): Option 2's streamlined broker, and the follow-up alignment meeting with @ngerakines.me (the network.attested creator). Key agreements from that meeting:

1. Separation of entitlement and payment, with a streamlined payment record.
2. Clear separation of concerns between the broker and the point-of-sale/payment service.
3. Spaces is the future for multi-party attestation; until spaces is fully rolled out, `network.attested.verify` covers PoS and broker verification.
4. Indexing of space-private data is a future concern, possibly handled by attested.network or another trusted 3rd party.

## Driving principles

1. **`network.attested` is a shared protocol, not an authority.** Both the PoS and the broker speak `network.attested.*`. The broker implements the payment-side endpoints; the PoS may implement the verify-side endpoints (over its own records). Neither party owns the namespace; we contribute proposed schemas upstream.
2. **PoS-broker communication is workflow-mediated.** Inter-service auth in ATProto today does not let a PoS sign requests as the payer to a broker. The agent (running with the payer's auth) intermediates: PoS responds with an outbound workflow telling the agent to call the broker; the agent callbacks the PoS with the result. This works with existing OAuth and avoids long-lived service tokens.
3. **Broker is self-sufficient.** The broker's payment record is wholly defined: subject (recipient), an array of line items (type, description, amount, currency, ref, subscription fields when applicable), plus broker DID and signatures. Everything needed to build a checkout cart at the payment processor, without callbacks to the PoS.
4. **Privacy by stripping identifying marks.** Records that touch a personal PDS are written with subject/recordUri/identifying refs removed by default. What remains is "this kind of record exists; these parties signed it." The full record lives in the issuing service's storage today; in a permissioned space provisioned for {payer, recipient, PoS, broker} post-spaces.
5. **Verify spans both layers.** `network.attested.verify` answers both "is the broker payment complete and signed?" and "is the PoS record's signature chain intact?" Implemented by each party for the records it issues.
6. **Account-idempotent profile.** Broker list lives in the user's PoS profile; any deployment can resolve "who handles payments for this user."
7. **Spaces-ready.** Records that want cross-user or 3rd-party storage are designed to migrate to spaces when the spaces API ships. Until then, broker-held + returned-by-verify is the fallback.

## Architecture (4-party)

| Party | Role | Speaks |
| --- | --- | --- |
| **Payer PDS** | Stores the payer's PoS records (cart, item, subscription) and, optionally, public entitlement records. | `com.atproto.repo.*` |
| **PoS service** | Manages cart hydration, line items, recipient lookup, subscription lifecycle, receipts UI. Forwards checkout to brokers via the workflow layer. Signs its own records. | Implements `com.atiproto.*` and the verify side of `network.attested.*` over its own records. Consumes `network.attested.*` payment endpoints via agent workflow. |
| **Broker** | Owns payment processor integration (Stripe, etc.), payment status, payment & entitlement record issuance with signatures. Stateless about *what* was bought. | Implements `network.attested.payment.*`, `network.attested.verify` over its own records. Sees PoS requests only through agent-driven calls. |
| **Recipient AppView** | Indexes payments + entitlements received by a user. Used by recipients to enumerate and verify incoming activity. | Consumes both namespaces; firehose-driven indexing of public records. |

```
       payer (with agent)
        |          \
        |           \-- outbound workflow --> Broker (network.attested.*)
        |                                       |
        |  <-- inbound workflow (broker result)-/
        v
   PoS service (com.atiproto.* + network.attested.verify)
```

A single deployment (like ours) may operate as both PoS and broker, but the lexicon enforces the separation: the two roles are independently implementable, and PoS-to-broker traffic always flows through the agent workflow even when colocated.

## Namespace allocation

### `network.attested.*` (shared cross-party protocol)

Defined by attested.network. We contribute proposed schemas via the `associated-schemas/` folder (see "Folder layout" below) and coordinate upstream.

| NSID | Type | Implemented by | Description |
| --- | --- | --- | --- |
| `network.attested.payment` | record | broker | Wholly-defined payment record: subject (recipient), array of line items (type, description, amount, currency, ref, subscription fields), status, broker DID, signatures. Contains everything a broker needs to build a checkout cart standalone. |
| `network.attested.entitlemententitlement` | record | PoS (issuer) | Lexicon-agnostic entitlement: subject, entitlements strongRef array (may point at any record type), issuedFor (payment uri), signatures. Created by the PoS, optionally written to PDS in stripped form. |
| `network.attested.payment.initiate` | procedure | broker | Sole broker checkout primitive. Called by the agent (on behalf of the payer) with an itemized payload. Returns checkout_url and creates the pending payment record. |
| `network.attested.payment.status` | query | broker | Broker-authoritative status lookup by payment uri. |
| `network.attested.verify` | query | broker and PoS | Each party verifies the records *it issued*: broker verifies `network.attested.payment`/`entitlements`; PoS verifies its own `com.atiproto.*` records. Verifiers call each side as needed (typically via workflow). |

Note: subscription cancellation is *not* in `network.attested.*`. It's a consumer-protection flow owned by the PoS, which workflows through the broker for the actual billing termination (mechanism TBD; see open questions).

### `com.atiproto.*` (our PoS authority, name unsettled)

Keep the existing namespace through v2 development. Rename when a final domain is settled.

**Records:**

| NSID | Type | Description |
| --- | --- | --- |
| `com.atiproto.profile` | record | User payment settings: `brokers[]` (ordered did:web list), `acceptsItems`, `acceptsSubscriptions`, `disableReceiptNotifications`, timestamps. |
| `com.atiproto.cart` | record | Shopping cart of line items (refs to `item` / `subscription` records). Status, currency, total, expiration. |
| `com.atiproto.item` | record | One-time payment line item: `subject`, `recordUri`, `amount`, `currency`, optional `message`. |
| `com.atiproto.subscription` | record | Recurring payment line item: `subject`, `amount`, `currency`, `interval`, status, billing dates. |

**Sender endpoints (`com.atiproto.payment.*`):**

| NSID | Type | Description | Required? |
| --- | --- | --- | --- |
| `payment.cart.checkout` | procedure | Finalize the cart, sign records, return `{ cart, checkoutUrl?, payment? }`. Accepts an optional `broker` (single did:web). When provided, response includes `checkoutUrl` and `payment` strongRef (sourced from a workflow callback today; from a direct PoS-to-broker call in the future). When omitted, response is the same shape minus those two fields; caller routes to a broker themselves and uses `cart.put` to attach the payment ref. | required |
| `payment.cart.get` | query | Hydrate a cart by uri (includes line item refs + recipient view). Live-fetches payment status from the broker via the cart's payment ref when one is attached. | required |
| `payment.item.get` | query | Hydrate an item by uri. | required |
| `payment.subscription.get` | query | Hydrate a subscription by uri. | required |
| `payment.subscription.cancel` | procedure | Cancel a recurring subscription. PoS-owned; workflows through the broker (same NSID) to terminate billing. | required |
| `payment.cart.put` | procedure | Update a cart record. Accepts a `payment` strongRef (to a `network.attested.payment` uri) so a caller that ran the broker call themselves can attach the resulting payment to the cart. Only the PoS can validate the payment ref, so this is not replaceable by `com.atproto.repo.putRecord` for that field. | optional (fallback for non-payment fields: `com.atproto.repo.putRecord`) |
| `payment.item.put` | procedure | Update an item record. | optional |
| `payment.subscription.put` | procedure | Update a subscription record. | optional |
| `payment.item.list` | query | List items sent by authed user, filtered by `subject` / `recordUri`. | optional |
| `payment.subscription.list` | query | List subscriptions sent by authed user, filtered by `subject`. | optional |

**Recipient endpoints (`com.atiproto.recipient.*`):**

| NSID | Type | Description | Required? |
| --- | --- | --- | --- |
| `recipient.payment.cart.get` | query | Hydrate an incoming cart by uri. | required |
| `recipient.payment.item.get` | query | Hydrate an incoming item by uri. | required |
| `recipient.payment.subscription.get` | query | Hydrate an incoming subscription by uri. | required |
| `recipient.profile.get` | query | Authed user's own profile + readiness. | required |
| `recipient.payment.cart.list` | query | List incoming carts. | optional (recipient-list gap: no PDS fallback) |
| `recipient.payment.item.list` | query | List incoming items, filtered by `sender` / `recordUri`. | optional (no PDS fallback) |
| `recipient.payment.subscription.list` | query | List incoming subscriptions, filtered by `sender`. | optional (no PDS fallback) |
| `recipient.profile.put` | procedure | Update authed user's profile. PoS implementations that do server-side provisioning (e.g. Stripe Connect onboarding) implement this. | optional |

**Public endpoints (`com.atiproto.repo.*`):**

| NSID | Type | Description | Required? |
| --- | --- | --- | --- |
| `repo.profile.get` | query | Public profile lookup by DID. | required |
| `repo.item.count` | query | Count completed items, filtered by `recordUri` / `subject` / date window. | optional |
| `repo.subscription.count` | query | Count active subscriptions, similar filters. | optional |

**Permission-sets:** carry `actions`, `authEnhanced`, `authGeneral` over to the next authority. Stick with explicit `rpc:`/`repo:` scopes per the docs convention; permission-sets demoted to legacy.

## Record shapes

### `network.attested.payment` (proposed)

Wholly defined so the broker can operate with no callbacks to the PoS for checkout context.

```jsonc
{
  "$type": "network.attested.payment",
  "subject": "did:plc:...",                          // recipient DID
  "items": [
    {
      "type": "oneTime" | "recurring",
      "description": "Pro plan, monthly",
      "amount": 999,                                 // smallest currency unit
      "currency": "USD",
      "ref": { "uri": "at://...", "cid": "bafy..." }, // strongRef to PoS line item (cart/item/subscription)
      "interval": "monthly",                          // recurring only
      "billingStartDate": "..."                       // recurring only
    }
  ],
  "status": "pending" | "completed" | "failed" | "refunded" | "cancelled",
  "broker": "did:web:...",
  "createdAt": "...",
  "completedAt": "...",
  "signatures": [ /* badge.blue signature entries */ ]
}
```

### `network.attested.entitlemententitlement` (proposed)

```jsonc
{
  "$type": "network.attested.entitlemententitlement",
  "subject": "did:plc:...",                                   // the entitled party
  "entitlements": [                                           // strongRefs to entitled-thing records
    { "uri": "at://...", "cid": "bafy..." }
  ],
  "issuedFor": "at://.../network.attested.payment/...",       // payment that granted it
  "createdAt": "...",
  "signatures": [ /* badge.blue signature entries */ ]
}
```

Lexicon-agnostic: `entitlements[]` strongRefs may point at any record type the PoS chooses to grant. Issued by the PoS as a post-checkout step (the recipient AppView calls into the PoS when checkout completes; the PoS creates the entitlement, links to the broker payment, and updates status). For private payments, the entitlement is written to the payer's PDS in stripped form (subject and entitlement refs removed) so only "an entitlement exists, these parties signed it" is visible.

### `com.atiproto.cart`

Holds line items, currency, total, status, expiration. Inherits the v1 cart shape minus the line-item identity strip done for privacy.

### `com.atiproto.{item,subscription}`

Inherit the v1 shapes (subject, amount, currency, status, etc.). Add a `signatures` array so the PoS can attest the canonical record and the payer's PDS can't silently mutate fields.

### `com.atiproto.profile`

- `brokers`: ordered array of did:web entries (preferred brokers in priority order).
- Record-level: `acceptsItems`, `acceptsSubscriptions`, `disableReceiptNotifications`, timestamps.
- View-level (server-derived, not on record): `acceptingPayments`, true when at least one broker reports readiness.

Default `brokers` at record creation: a single did:web pointing at the home PoS authority, so the system is account-idempotent.

## Workflow mediation

Because PoS and broker cannot directly authenticate as the payer to each other, every cross-party call goes through the agent workflow layer.

### Checkout

`cart.checkout` accepts an optional `broker` parameter (single did:web). The response shape is the same in both cases except `checkoutUrl` and `payment` are present only when a broker was provided. This lets the lexicon match a future state where the PoS calls `network.attested.payment.initiate` on the broker directly and returns synchronously.

**With pre-seeded broker** (today: workflow-mediated):

1. Agent calls `com.atiproto.payment.cart.checkout` on the PoS with `broker: did:web:...`.
2. PoS finalizes the cart, signs the cart/item/subscription records, and builds the `network.attested.payment.initiate` payload from cart contents.
3. PoS responds with an **outbound workflow** instructing the agent to call `payment.initiate` on the named broker, payload included.
4. Agent calls broker's `payment.initiate`. Broker creates the signed `network.attested.payment` record (status: pending) and returns its uri plus `checkout_url`.
5. Agent calls back the PoS via inbound workflow with the broker response. The `cart.checkout` response resolves to `{ cart, checkoutUrl, payment }`.

**With pre-seeded broker** (future: direct PoS-to-broker):

When inter-service auth supports it, the PoS calls `network.attested.payment.initiate` on the broker directly during step 2 and returns `{ cart, checkoutUrl, payment }` synchronously. Same response shape; no workflow round-trip.

**Without pre-seed**:

1. Agent calls `com.atiproto.payment.cart.checkout` without a `broker` parameter.
2. PoS finalizes the cart, signs the records, returns `{ cart }` (no `checkoutUrl`, no `payment`).
3. Caller routes to a broker themselves, calls `network.attested.payment.initiate`, gets back the payment ref + checkout_url.
4. Caller invokes `com.atiproto.payment.cart.put` with the cart uri and `payment` strongRef to associate the broker payment with the cart on the PoS.

**Post-checkout completion**: no new endpoint. The PoS triggers entitlement issuance through one of the two existing paths:

- **Via the checkout workflow**: when checkout runs with a broker pre-seed, the same inbound workflow that delivers the broker response carries (or polls for) completion. The PoS issues the entitlement and updates statuses inside the workflow's tail.
- **Via `cart.put` with payment ref**: when the caller attaches a payment ref after the fact (no-pre-seed path, or a delayed reconciliation), the PoS sees a payment uri on the cart, fetches its status from the broker, and on `completed` issues the entitlement and updates the cart/item/subscription statuses.

In both paths the PoS writes a stripped entitlement to the payer's PDS (same lexicon shape; subject and entitlement refs absent). The hydrated copy stays on the PoS until spaces ship.

### Subscription cancel

For now, the broker respects `com.atiproto.payment.subscription.cancel` directly. It's not part of `network.attested.*`, but the broker implements this specific PoS-namespace endpoint so the agent can call into both PoS and broker with the same NSID:

1. Agent calls `com.atiproto.payment.subscription.cancel` on the PoS. PoS marks intent-to-cancel on its subscription record, signs the update.
2. PoS responds with an outbound workflow to call `com.atiproto.payment.subscription.cancel` on the broker.
3. Agent executes; broker terminates billing at the processor and signs an updated `network.attested.payment` record (status: cancelled).
4. Agent callbacks PoS with the broker result; PoS finalizes the subscription record.

### Verify

`network.attested.verify` is open to any caller. Signature-chain checks return without auth. Hydration of private fields (subject, line items, refs) is gated.

1. Agent or 3rd party calls `network.attested.verify` with a record uri and an optional `hydrate` parameter.
2. The implementing party (PoS for PoS records, broker for the payment record) verifies signatures.
3. If `hydrate=true` and the caller is one of the signing parties, the response includes the hydrated record fields. Otherwise the response is signature-only.
4. If verification needs the other party's view (e.g. PoS verifying a cart wants the broker's payment status), it returns a workflow telling the agent to call the other party.
5. Final result combines both sides plus the signed entitlement record if applicable.

## Record signatures (badge.blue scheme)

Each signed record (`network.attested.payment`, `network.attested.entitlemententitlement`, `com.atiproto.cart`, `com.atiproto.item`, `com.atiproto.subscription`) carries a `signatures` array.

### Signing payload

1. Strip `signatures` from the record.
2. Strip `cid` / `signature` from any metadata.
3. Add the repository DID as a `repository` field on `$sig` metadata.
4. Encode as DAG-CBOR (deterministic).
5. SHA-256, wrap as CIDv1 with DAG-CBOR codec.
6. ECDSA-sign the CID with the issuer's signing key (P-256 / P-384 / K-256).

Repository-DID binding prevents replay across repos: copying a signed record into a different sender's PDS changes the CID and invalidates the signature.

### Signature entry shape

```jsonc
{
  "$type": "network.attested.signature",
  "key": "did:key:z...",
  "cid": "bafy...",
  "signature": { "$bytes": "..." },
  "issuer": "did:web:...",                // broker or PoS
  "issuedAt": "...",
  "purpose": "broker-attestation" | "pos-attestation" | "co-signer"
}
```

### Who signs what

- **`com.atiproto.cart` / `item` / `subscription`**: signed by the PoS issuer and the recipient AppView. Both parties attest that the record matches their view of the transaction.
- **`network.attested.payment`**: signed by the broker only.
- **`network.attested.entitlemententitlement`**: signed by the PoS only. Brokers don't issue entitlements; the PoS does that as a post-checkout completion step.

A signature array means a record can collect attestations from multiple parties without re-versioning the lexicon. The PoS + recipient AppView co-signature on PoS records is the primary use today; future co-signers (auditors, escrow attesters) slot in without breaking changes.

## Privacy model

Everything on-protocol today is designed for a user's personal PDS. Permissioned spaces will eventually hold the full record in a space provisioned for {payer, recipient, PoS, broker}. Until then, we keep identifying marks (subject DID, recordUri, entitlement refs) off the public PDS-stored copy by default.

- **`com.atiproto.cart` / `item` / `subscription`**: written to the payer's PDS with identifying marks stripped by default. The PoS retains the full signed record server-side. The PDS copy attests "a cart/item/subscription of this currency and amount exists, signed by these parties."
- **`network.attested.entitlemententitlement`**: same pattern. The PoS retains the hydrated record. The PDS-stored copy is stripped to "an entitlement exists, signed by these parties."
- **`network.attested.payment`**: held by the broker. Not written to the payer's PDS today; the broker exposes it via `network.attested.verify` and `payment.status`.
- **Hydrated access**: callers who are signing parties (PoS, recipient AppView, broker) can request hydration via `verify(hydrate=true)`. Everyone else gets the signature-only view.

This is a compromise. Once spaces are available, the full record lives in the shared space and stripping is no longer necessary.

## Spaces migration

The end state: every signed record in this lexicon (`cart`, `item`, `subscription`, `payment`, `entitlements`) lives in a permissioned space provisioned for {payer, recipient, PoS, broker}. All four parties have read access; writes are gated to the issuing party. There is no PDS write of stripped copies, no broker-only storage; the space is the canonical home.

Until spaces are available, the protocol writes records to the payer's personal PDS with identifying marks stripped (see "Privacy model"). Issuing services retain the hydrated record for `verify(hydrate=true)` requests by signing parties.

Indexing space-private data is a future concern: it may be handled by a trusted indexing service (attested.network or another 3rd party), or we may keep a public index of stripped/private records. Either way, the on-protocol shape stays the same when spaces ship; only the storage location changes.

## Folder layout

We separate our own schemas from proposed contributions to other authorities:

```
packages/lexicons/src/
  schemas/                          # our authority: com.atiproto.* (rename later)
    profile.json
    cart.json
    item.json
    subscription.json
    payment/
      cart/{checkout,get,put}.json
      item/{get,put,list}.json
      subscription/{cancel,get,put,list}.json
    recipient/
      payment/...
      profile/{get,put}.json
    repo/
      profile/get.json
      item/count.json
      subscription/count.json
  associated-schemas/               # proposed contributions: network.attested.*
    payment.json                    # the wholly-defined payment record (record def)
    entitlements.json               # the entitlements record (record def)
    payment/
      initiate.json                 # procedure (broker)
      status.json                   # query (broker)
    verify.json                     # query (broker and PoS)
```

- `schemas/` is what we publish under our authority and what the lex-cli generates types for.
- `associated-schemas/` is a holding area for upstream proposals. We use it as the working draft for what we'd suggest to attested.network. Likely consumed by the dev/preview docs but not published under our authority.
- Build / publish scripts should treat `associated-schemas/` as read-only-to-the-spec; type generation should optionally include them so our agent can call against them in integration tests.

## Resolved decisions

Carried over from the original open-questions list, with the resolution recorded for reference.

- **Final PoS namespace**: keep `com.atiproto.*` for now. Decide before official publish.
- **Migration window**: not relevant. Current lexicons aren't published as a stable surface.
- **Payment record shape**: wholly defined on the broker, with subject, line items (type/description/amount/currency/ref, plus subscription fields), status, signatures. No external dependency to operate.
- **Subscription cancel topology**: broker respects `com.atiproto.payment.subscription.cancel` directly. It's not a `network.attested.*` endpoint, but the broker implements that specific PoS-namespace endpoint so the PoS workflow can hit it.
- **Verify auth model**: open to any caller for signature-only verification. Hydration of private fields is gated to signing parties via a `hydrate` parameter.
- **Entitlement strongRefs**: stay lexicon-agnostic. Entitlement refs can point at any record type.
- **Issuance trigger**: PoS issues the entitlement as a post-checkout completion step (recipient AppView calls into the PoS). The signed copy (likely stripped) gets written to PDS so verification doesn't depend on broker round-trip.
- **Recipient list endpoints**: optional but recommended for any PoS that serves recipients.
- **Curve choice**: support all curve types badge.blue accepts (P-256, P-384, K-256).
- **Auth scope for brokers list**: public.
- **`acceptingPayments` aggregation**: for now, mere presence of a broker on a user's profile = accepting payments.
- **Multi-broker fan-out**: out of scope for the lexicon. PoS / Recipient AppView decides routing. `cart.checkout` accepts an optional single-`broker` did:web; the response shape is identical with and without it except `checkoutUrl` and `payment` are present only when a broker was provided.
- **Stripped record encoding**: same lexicon shape as the hydrated record, with subject DID and record refs absent. No separate "stripped" lexicon.
- **Hydrated record verification**: accepted tradeoff. We sign only the stripped form; a hydrated copy returned via `verify(hydrate=true)` is not independently re-verifiable from its signature alone, the caller trusts the issuing service for hydration.
- **Pre-seed parameter on `cart.checkout`**: single did:web. Response shape differs only by presence of `checkoutUrl` and `payment`.
- **Post-checkout completion**: no new endpoint. Entitlement issuance and status updates happen either inside the `cart.checkout` workflow tail (broker-pre-seed path) or in response to a `cart.put` with a payment ref (no-pre-seed path).

## Open questions

(None outstanding at the lexicon level. The next gate is drafting the `network.attested.*` schemas in `associated-schemas/` and the `com.atiproto.payment.cart.checkout` schema with the agreed response shape.)

## Deferred (not lexicon concerns)

- **AppView signing key registration.** Where the recipient AppView keeps its signing key and binds it to the recipient DID is an agent / infra concern. Revisit in a follow-up after the lexicon stabilizes.
