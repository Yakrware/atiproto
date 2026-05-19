# Lexicon v2 Follow-ups

Things noticed while executing the lexicon-package portion of `lexicon-v2.md`. These all live outside `packages/lexicons` and were deferred per the branch scope ("only update the lexicon package").

## Agent package (`packages/agent`)

The agent's generated namespace tree and integration paths need significant rework after the v2 surface changes. Major items:

1. **Removed methods**. The following are gone from `com.atiproto.*` and will break any caller that still imports them:
   - `payment.cart.clone`
   - `payment.list`
   - `payment.item.validate` (replaced by `network.attested.verify`)
   - `payment.subscription.validate` (replaced by `network.attested.verify`)
   - `recipient.payment.item.validate`, `recipient.payment.subscription.validate`

   The following are **retained** from v1 with shape updates: `payment.cart.create`, `payment.cart.list`, `payment.item.create`, `payment.subscription.create`. Each now returns a signed record via the workflow envelope; the create endpoints no longer auto-create a cart or return a `checkoutUrl`. Use `payment.cart.checkout` for the all-in-one path or these standalone creates for manual cart construction.
2. **New method**. `payment.cart.checkout` replaces all of the per-record create flows. Input takes an array of inline line items (each tagged `com.atiproto.item` or `com.atiproto.subscription`) plus an optional `broker` did:web. Output: `{ cart, checkoutUrl?, payment? }`. The agent should run the standard outbound/inbound workflow loop when a broker is provided.
3. **Get endpoints simplified**. `payment.{cart,item,subscription}.get` and the recipient mirrors are now uri-only. Any caller passing `subject` / `itemUri` / `subscriptionUri` / `recordUri` needs to migrate to the corresponding `*.list` endpoint or look up the uri first.
4. **`payment.cart.put` accepts a `payment` strongRef**. The agent's `cart.put` typed call should expose this. PoS validates this field server-side; `com.atproto.repo.putRecord` cannot set it.
5. **`payment.cart.get` returns broker payment status**. The cart view now carries `paymentStatus` (server-derived live fetch from the broker via `network.attested.payment.status`). The agent's get path may want to surface this even without an explicit verify call.
6. **`subscription.cancel` is workflow-mediated end-to-end**. PoS-side cancel returns an outbound workflow telling the agent to call the same NSID on the broker. The agent should treat this identically to the existing PoS-side cancel flow, but with the broker as the destination of the action. The broker implements `com.atiproto.payment.subscription.cancel` (not a `network.attested.*` NSID) per `lexicon-v2.md`.
7. **`network.attested.*` namespace exposure**. `@atiproto/lexicons` now generates types under both `com` and `network` top-level namespaces (`network.attested.payment`, `network.attested.verify`, etc.). The agent's namespace-proxying classes only know about `com` today. Decide whether to expose `paymentAgent.network.attested.*` (and what proxy headers to use) or to keep `network.attested.*` as raw `XrpcClient` calls. The docs auto-generated `CodeExample` already skips its usage snippet for `network.attested.*` and prints a placeholder.
8. **Signatures**. `com.atiproto.cart`, `com.atiproto.item`, `com.atiproto.subscription` records now require a `signatures` array (PoS + recipient AppView co-signature per the badge.blue scheme). The agent does not currently produce or verify these. Server-side this is the PoS's job; agent only carries the values through. Confirm the agent doesn't validate the record against an old shape that lacked `signatures`.
9. **Stripped records on PDS**. Records written to the payer's PDS by default omit `subject` (and for `item`: `recordUri`). The agent's record-create/put paths should respect this default. The hydrated record stays on the PoS; the agent's read paths should call `network.attested.verify(hydrate=true)` when they need the full record.
10. **prepChatForReceipts**. Unaffected. Continues to target `chat.bsky.convo.*`.

## Documentation (`services/docs`)

Already updated:
- `lexicons.server.ts` and `routes/lexicon/_index.tsx` consume `allSchemas` and segment by authority (`com.atiproto` vs `network.attested`). A new top-level nav section renders the network.attested surface.
- `CodeExample.tsx` short-circuits for `network.attested.*` NSIDs and shows a placeholder note (since the agent doesn't expose those endpoints as namespaced methods yet; see agent item 7).

Still needed:
1. **Guide pages**. The following hand-written guides reference the old API surface and need rewrites:
   - `docs/get-started`: uses `cart.create` + `item.create`. Move to the `cart.checkout` flow.
   - `docs/checkout`: rewrite around the 4-party architecture, workflow-mediated PoS↔broker handoff, and the optional `broker` pre-seed parameter.
   - `docs/stripe-connect`: re-frame around brokers in general; Stripe Connect is one implementation.
   - `docs/permission-sets`: scope listings are stale (mentions removed lxm values).
2. **`network.attested.*` callouts**. Lexicon detail pages render uniformly today. Consider banner-style copy at the top of `network.attested.*` pages explaining the upstream authority and that we ship drafts pending coordination with attested.network.
3. **CodeExample for `network.attested`**. When the agent decides on the integration shape (item 7 above), update the placeholder in `CodeExample.tsx` to render real usage.

## Record shape changes worth surfacing for the agent

- **`com.atiproto.item.subject`** is no longer a `did` field paired with a separate `recordUri`. It's a `union` of `com.atproto.repo.strongRef` (for record refs, full uri+cid) and `com.atiproto.item#userRef` (`{ uri }` only, where uri is a user repo like `at://did:plc:...`). Consumers set `$type` to discriminate. Agent inputs that previously sent `{ subject, recordUri }` must collapse to one tagged `subject` ref.
- **`com.atiproto.subscription.subject`** is the same union (reuses `com.atiproto.item#userRef` for the user side). Subscriptions can target records (e.g. paid feeds, posts) in addition to users.
- **`com.atiproto.cart.subject`** stays a `did`. The cart's subject is the money recipient; only line items can target records.
- **`network.attested.payment` is minimal**. The record no longer carries `items` (those live only in the `payment.initiate` input now and are retained by the broker internally), nor a `view` def, nor a back-ref to anything on the PoS. Records that need to associate with a payment ref it forward (cart's `payment` strongRef, entitlement's `issuedFor` uri).
- **`subject` is private by default** on `network.attested.payment`. The record's `subject` field is optional and absent unless the issuer opts in to publishing it.
- **Line item types split**. The `network.attested.payment.initiate` input's `items` array is now a union of `#oneTime` (amount + currency + description) and `#recurring` (amount + currency + interval + billingStartDate, plus description). Both require `description`. Each carries `$type` for discrimination. Line items no longer carry a `ref` back to the PoS record (carts/entitlements reference payments, not the other way around).
- **Interval is a union**. `#recurring.interval` is a union of `#namedInterval` (`weekly` / `monthly` / `yearly`) and `#customInterval` (`{ days: integer >= 1 }`). Callers tag with `$type` to pick.
- **No `view` defs on `network.attested.*`**. The associated-schemas now only define root types. Callers that previously consumed `network.attested.payment#view` or `network.attested.entitlement#view` should hydrate via PoS endpoints or `verify(hydrate=true)`.
- **Signatures are now a union of inline + remote attestations** per the badge.blue scheme. Every record's `signatures` field accepts entries of two kinds: an inline `network.attested.signature` (signature bytes embedded) or a `com.atproto.repo.strongRef` pointing at a remote `network.attested.proof` record (signature implicit via the attestor's PDS commit). Agents verifying or writing signatures must handle both shapes. `network.attested.proof` is a new record type added in this branch.
- **`network.attested.signature` shape change**. Required fields are now `key`, `cid`, `signature` (matching badge.blue inline attestation). `issuer`, `issuedAt`, and `purpose` are optional.
- **`hydrate` parameter removed from `network.attested.verify`**. The `hydrated` output field is gone too. To retrieve hydrated payment details, callers use `network.attested.payment.status`, which returns a `network.attested.payment#view` (auto-filled when the caller is a signing party).
- **Payment view lives on `network.attested.payment.status#view`**, not on the record schema. Sibling sub-NSID cross-refs work in the lex CLI (`payment.status` ref'ing `payment.initiate#oneTime`/`#recurring` generates correct paths), but parent-record refs (`payment.status` ref'ing `payment#view`) do not. Putting the view on the status schema avoids the bug without duplication. Shape: `subject`, `items` (union of `payment.initiate#oneTime` + `payment.initiate#recurring`), `total`, `currency`, plus uri/cid/status/broker/dates/signatures. Private fields auto-filled when the caller is authorized; otherwise omitted.
- **`com.atiproto.item.quantity`** is new. Integer, default 1, minimum 1, unbounded above. `amount` is per-unit; the line total is `amount × quantity`. The broker's `network.attested.payment#lineItem.amount` is the already-multiplied line total (broker doesn't track quantity).
- **Privacy mode** on creates: `payment.item.create` and `payment.subscription.create` now accept `private: boolean` on input. When true, the issued record omits `subject`. Replaces the old `isPrivate` field.

## Lexicon package internals (handled, but worth surfacing)

These are notes about decisions taken during execution that might want revisiting.

1. **Vendored stock atproto schemas**. We pull `com.atproto.repo.strongRef` into `src/associated-schemas/` via `goat lex pull` so the lex builder can resolve refs to it without us inlining. The publish script only touches `src/schemas/`, so the vendored copy isn't republished. Docs filter out `com.atproto.*` so the strongRef doesn't show in the nav.
2. **Lex CLI sub-NSID ref bug** (narrowed). When a procedure or query at `network.attested.payment.X` cross-refs the parent record's defs (e.g. `network.attested.payment#anything`), lex generates a broken relative import (`./.defs.js`). Sibling sub-NSID cross-refs (`payment.status` ref'ing `payment.initiate#oneTime`) work correctly. Self-references inside a single schema also work. The only workaround needed today is to keep types that sub-NSIDs want to reference off of the parent record file: e.g. the payment view lives on `network.attested.payment.status#view` rather than `network.attested.payment#view`. Filing upstream would be cleaner.
3. **Two-source build pipeline**. `packages/lexicons/scripts/build-lexicons.mjs` copies `src/schemas` and `src/associated-schemas` into a temp `.lex-build/` directory, runs `lex build` once, and removes the temp dir. This keeps the source-tree separation the plan requires while letting cross-namespace refs resolve in a single build pass. The schemas are exported as three named lists from `@atiproto/lexicons`:
   - `schemas`: only `com.atiproto.*`
   - `associatedSchemas`: only `network.attested.*`
   - `allSchemas`: combined (what the docs render)
4. **Stripped form encoding**. The current schemas mark identity fields (`subject`, `recordUri`, line item refs, entitlement refs) as optional so the same lexicon validates both the hydrated and stripped forms. Consumers can't tell apart a stripped record from one that happens to lack those fields. If we need that distinction at the protocol level (rather than via context, e.g. "PDS storage = stripped"), add a `stripped: boolean` flag.
5. **`acceptingPayments` on profile view**. The view def carries this server-derived boolean; the record def does not. PoS implementations need to populate it on read. For v2, simple rule: `acceptingPayments = brokers.length > 0`.

## Open questions surfaced during execution

- **Cancel NSID disambiguation**. Both PoS and broker implement `com.atiproto.payment.subscription.cancel`, distinguished by audience. Confirm that's how scopes / OAuth `aud` should be expressed and that the agent can route appropriately.
- **`network.attested.verify`'s `hydrated` field**. Typed as `unknown` since the hydrated payload's shape depends on the target record's lexicon. Could be a discriminated union, but enumerating every signable record makes the schema brittle. Open: stick with `unknown`, or type as union of known record `view` defs?
- **`network.attested.payment.status` and entitlement record location**. The status query returns just signature-verifiable fields. The plan says hydration goes through `verify`. Decide whether `status` should also gate on signing-party check or remain wide-open.

## Branch summary

What landed in `packages/lexicons`:
- `src/schemas/` rewritten to v2: dropped 6 obsolete schemas (`payment.cart.clone`, `payment.list`, both `*.validate` pairs and their recipient mirrors), modified the 4 records (added `signatures` array, brokers, payment ref, stripped-by-default identifying fields), added `payment.cart.checkout`, retained and reshaped `payment.{cart,item,subscription}.create` plus `payment.cart.list` and the existing `*.list` endpoints, simplified `*.get` endpoints to uri-only, updated `payment.cart.put` for the payment ref, refreshed both auth permission-sets.
- `src/associated-schemas/` added with 6 `network.attested.*` JSON drafts: `signature`, `payment` (with `lineItem` + `strongRef` defs), `entitlements`, `verify`, plus `payment.initiate` and `payment.status` procedures/queries.
- Build pipeline switched to `scripts/build-lexicons.mjs` for the combined two-source build.
- Top-level exports: `schemas`, `associatedSchemas`, `allSchemas` plus the generated `com.*` and `network.*` type trees.

What landed in `services/docs`:
- `lexicons.server.ts` and `routes/lexicon/_index.tsx` now segment by authority and render a dedicated `network.attested` section.
- `CodeExample.tsx` short-circuits for `network.attested.*` NSIDs.
