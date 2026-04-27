# Service-write workaround: a workflow protocol between XRPC server and agent

## Problem

A headless ATProto XRPC service (think: an API-only app that receives proxied calls from the user's PDS) cannot write to the user's PDS. The PDS accepts only its own OAuth-issued access tokens on write endpoints; service-auth JWTs signed by the XRPC service are routed to the OAuth-token verifier and rejected. Even with the user's permission grant in place, there's no path for the service to make the write directly.

Until that changes (see discussion [#4877](https://github.com/bluesky-social/atproto/discussions/4877)), services that need to coordinate PDS writes with their own server-side state (DB, Stripe, etc.) need a workaround. The following is what we landed on.

## Protocol sketch

The XRPC server and the client's agent library agree on a small shared lexicon that lets responses carry either a final result or a set of instructions for the client to execute:

- **Initial call.** The client calls the XRPC endpoint normally (e.g. "create a tip for $5").
- **Server response, case A — direct result.** If the server has nothing for the client to do, it returns the native lexicon output (the same shape it would return after #4877 ships).
- **Server response, case B — workflow.** Otherwise the response includes a `workflow` envelope with:
  - an `intent` string (server-defined phase marker — e.g. `"createTip"`, `"createCart"`)
  - an `actions` array describing CRUD operations against the user's repo (`create`/`update`/`delete` on specific collections + rkeys, plus a `raise` verb for server-directed error propagation)
- **Client executes actions.** The agent runs each action through the user's OAuth-authed `@atproto/api` Agent (`createRecord` / `putRecord` / `deleteRecord`). It collects the results (uri + cid per action).
- **Callback.** The agent calls the same XRPC endpoint again with the original input plus the `workflow` envelope — this time containing the server's intent echoed verbatim, plus a `responses` array listing the results of the actions it just ran.
- **Server processes the callback.** The handler branches on `workflow.intent` (not on responses shape — the intent is the phase marker). It may:
  - Emit more actions and a new intent (another callback round)
  - Return a direct result (workflow complete)
- **Loop** until the server returns a direct result.

On failure — any action the agent tried to run fails — the agent overrides the intent to `"error"`, includes the partial responses, and includes an `error` payload describing which action failed and why. The server's error branch can emit compensating `delete` actions followed by a `raise` action carrying the final error message; the agent executes the deletes and then throws.

## Assumptions and costs

- **The client must use the matching agent library.** Third-party clients that don't implement the interpreter can't call these endpoints. This is the main reason a PDS-side fix is preferable: lexicon-consuming clients should be universally interoperable.
- **Business logic splits across handler branches.** A single user-facing operation becomes a state machine keyed on intent. Readable, but noisier than a single in-line handler.
- **Each user action = N HTTP round trips.** Latency grows linearly with chain depth. A tip-with-cart flow takes three calls where one would do.
- **Orphan records on interruption.** If the client crashes or times out after running an action but before calling back, the record is in the user's PDS with no corresponding server state. V0 leaves these alone and relies on offline reconciliation; idempotency keys can be bolted on later.
- **Server retains authority.** All orchestration decisions happen on the server. The client follows instructions; it doesn't decide on its own when to create a cart or charge a card. OAuth scopes cap what the agent will actually execute against the PDS, limiting the blast radius.
- **Forward-compatible with a PDS-side fix.** Once the PDS can verify service-signed tokens against the user's OAuth scopes, the server simply stops emitting `workflow` and returns direct results on the initial call. Clients with the interpreter still work — they treat the no-workflow response as the final result branch of the union. No lexicon change, no client update required.

---

The complexity of the protocol — dragging what should be one HTTP call into a multi-round server-controlled conversation — is evidence that the write path is missing from the auth model. The workaround is tractable, but it's not a substitute for a proper solution.
