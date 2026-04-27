# Workflow interpreter for `@atiproto/agent`

## Context

Bluesky's `@atproto/pds@0.4.220` rejects service-auth JWTs on every write endpoint. atiproto.com (the XRPC server) cannot write to a user's Bluesky-hosted PDS using the service-auth approach we built. The detailed diagnosis and architectural alternatives are documented in the atiproto-server repo at:

```
../atiproto-server/plan/refactor-agent-pds-writes.md
```

Git tag `pre-agent-pds-refactor` marks the starting state in both repos.

**Decision**: we're implementing a workflow/actions protocol where the server emits declarative action lists and the agent executes them against the user's PDS. This preserves the lexicon surface unchanged across the service-auth era and the post-[#4877](https://github.com/bluesky-social/atproto/discussions/4877) era.

This document is the `@atiproto/agent` + `@atiproto/lexicons` side of the plan. The server-side plan covers the handler changes; this one covers the shared lexicon fragment and the agent's interpreter.

Read the server plan first for:
- The full protocol spec (request/response shapes, intent semantics, error flow)
- The server's authoring pattern with the worked `feed.tip.create` example
- Why Option 2 over Option 1 (progressive enhancement via #4877)

Below, "the spec" refers to that document. What follows here is the slice of work for this package.

---

## Scope

Two packages change:

- **`@atiproto/lexicons`** — add a new shared fragment `com.atiproto.actions`, and update every orchestrating endpoint's lexicon to reference its `inboundWorkflow`/`outboundWorkflow` wrapper.
- **`@atiproto/agent`** — add a workflow interpreter wired into `Agent.call()` itself, so **any** response carrying a `workflow` envelope is intercepted, the actions executed against the user's PDS, and the endpoint called back until the server returns a direct (non-workflow) result. No per-namespace-method wiring.

No changes needed to `@atiproto/edge-resolvers` or the OAuth packages.

### Design principle: extensible by default

Adding or enhancing a workflow-capable endpoint must be a **lexicon-only change**. When some future endpoint (say, `feed.tip.validate`) grows a workflow output, we want the agent to pick it up without touching `packages/agent/src/namespaces/**`. The interpreter therefore lives at the `call()` layer (see "Integrating with Agent" below), not in each hand-written namespace method.

---

## Lexicon: `com.atiproto.actions`

Path: `packages/lexicons/src/schemas/actions.json`

```json
{
  "lexicon": 1,
  "id": "com.atiproto.actions",
  "defs": {
    "action": {
      "type": "union",
      "refs": ["#create", "#update", "#delete", "#raise"]
    },
    "create": {
      "type": "object",
      "required": ["repo", "name", "collection", "rkey", "record"],
      "properties": {
        "repo":       { "type": "string", "format": "did" },
        "name":       { "type": "string", "maxLength": 64 },
        "collection": { "type": "string", "format": "nsid" },
        "rkey":       { "type": "string", "maxLength": 128 },
        "record":     { "type": "unknown" }
      }
    },
    "update": {
      "type": "object",
      "required": ["repo", "name", "collection", "rkey", "record"],
      "properties": {
        "repo":       { "type": "string", "format": "did" },
        "name":       { "type": "string", "maxLength": 64 },
        "collection": { "type": "string", "format": "nsid" },
        "rkey":       { "type": "string", "maxLength": 128 },
        "record":     { "type": "unknown" },
        "swapCommit": { "type": "string", "format": "cid" }
      }
    },
    "delete": {
      "type": "object",
      "required": ["repo", "name", "collection", "rkey"],
      "properties": {
        "repo":       { "type": "string", "format": "did" },
        "name":       { "type": "string", "maxLength": 64 },
        "collection": { "type": "string", "format": "nsid" },
        "rkey":       { "type": "string", "maxLength": 128 },
        "swapCommit": { "type": "string", "format": "cid" }
      }
    },
    "raise": {
      "type": "object",
      "required": ["message"],
      "properties": {
        "message": { "type": "string", "maxLength": 1024 },
        "code":    { "type": "string", "maxLength": 64 }
      }
    },
    "response": {
      "type": "object",
      "required": ["action", "name", "result"],
      "properties": {
        "action": { "type": "string", "knownValues": ["create", "update", "delete"] },
        "name":   { "type": "string", "maxLength": 64 },
        "result": { "type": "ref", "ref": "#recordResult" }
      }
    },
    "recordResult": {
      "type": "object",
      "required": ["uri"],
      "properties": {
        "uri": { "type": "string", "format": "at-uri" },
        "cid": { "type": "string", "format": "cid" }
      }
    },
    "error": {
      "type": "object",
      "required": ["action", "message"],
      "properties": {
        "action":  { "type": "string" },
        "name":    { "type": "string" },
        "message": { "type": "string", "maxLength": 1024 },
        "code":    { "type": "string", "maxLength": 64 }
      }
    },
    "inboundWorkflow": {
      "type": "object",
      "required": ["intent", "responses"],
      "properties": {
        "intent":    { "type": "string", "maxLength": 64 },
        "responses": { "type": "array", "items": { "ref": "#response" } },
        "error":     { "type": "ref", "ref": "#error" }
      }
    },
    "outboundWorkflow": {
      "type": "object",
      "required": ["intent", "actions"],
      "properties": {
        "intent":  { "type": "string", "maxLength": 64 },
        "actions": { "type": "array", "items": { "ref": "#action" } }
      }
    }
  }
}
```

Notes:

- **Union discriminator is `$type`, per atproto convention.** Each item in `outboundWorkflow.actions` is `{ "$type": "com.atiproto.actions#create", "name": ..., ... }` (or `#update` / `#delete` / `#raise`). The `@atproto/lexicon` validator (`validators/complex.js#validateOneOf`) requires `$type` on union members and rejects without it. Don't model the verb as a separate `const action` field — it would be redundant with `$type` and unreached during validation.
- `response` is **not** a union (it's emitted under a single `#response` ref), so it keeps a plain `action` string field with `knownValues: ["create", "update", "delete"]` for human/server-side discrimination. Same shape applies to `error.action`.
- **`repo` lives on each write action.** Server populates `repo` per action with the DID it intends the write to land in (typically the authed user's own DID). The agent passes it through to `com.atproto.repo.{create,put,delete}Record` verbatim; if the server gets it wrong (e.g. addresses an unowned repo), the PDS rejects with an auth error, which surfaces back via the `intent: "error"` callback. The agent does not resolve, validate, or substitute the DID.
- `rkey` is required on `create`. Records with fixed rkeys (e.g. `com.atiproto.profile` → `self`) are the server's responsibility to set; no agent-side magic.
- `response` is emitted for `create`, `update`, and `delete`. `delete` responses carry `{ uri }` only (no `cid`) — the record is gone.
- `intent` on the inbound side echoes what the server sent, except the agent overrides to `"error"` when an action fails.

### Endpoint updates

Every orchestrating endpoint (9 of them, listed in the server plan) needs the `workflow` property added as optional to both `input.schema` and `output.schema`:

```json
"workflow": { "type": "ref", "ref": "com.atiproto.actions#inboundWorkflow" }
```
on input, and
```json
"workflow": { "type": "ref", "ref": "com.atiproto.actions#outboundWorkflow" }
```
on output.

The `$` prefix mirrors atproto's existing convention for protocol-level metadata (`$type`) and reserves the field name across every endpoint that participates. **Verify during implementation** that `@atproto/lex` accepts `$`-prefixed property names — if it rejects them, fall back to plain `workflow`. The structural `isOutboundWorkflow` check guards against shape collisions either way.

Because `workflow` is optional everywhere, initial calls (no workflow) and direct-result responses (no workflow) both validate. The union is enforced at runtime by server + agent, not by the lexicon.

**Drop the existing `required` arrays from these endpoints' output schemas.** In workflow mode the server emits `workflow` *instead of* the native output fields (e.g. `tipUri`, `tip`); with the current `"required": ["tipUri", "tip"]` constraint in `feed/tip/create.json`, the workflow response fails lexicon validation. The server plan calls this out at line 227: *"Lexicon validation is loose (all fields optional on output) — the server controls at runtime whether it emits `workflow` or the native fields."* Apply the same to the other eight endpoints: keep all native output properties under `properties`, but no `required` array on `output.schema`.

Input schemas keep their existing `required` arrays — the native input fields stay required on initial calls and on every callback (the agent echoes the initial input on every round).

**TS-DX consequence.** With `required` removed from output, the generated `$OutputBody` types shift from `{ tipUri: string; tip: View }` to `{ tipUri?: string; tip?: View; workflow?: OutboundWorkflow }`. After the interpreter loop completes the agent guarantees the native fields are populated and `workflow` is stripped — but TypeScript can't see that, so callers will need a runtime check or non-null assertion (`res.data.tipUri!`). Acceptable for v0; if it becomes a pain we can add a narrow-result type wrapper later. Note this in the package README so it isn't surprising.

Endpoints to update in `packages/lexicons/src/schemas/`:

- `feed/tip/create.json`, `feed/tip/put.json`
- `feed/subscription/create.json`, `feed/subscription/put.json`, `feed/subscription/cancel.json`
- `account/cart/create.json`, `account/cart/put.json`, `account/cart/clone.json`
- `account/profile/put.json`

For each: add `workflow` (optional) to input + output `properties`, **remove the `required` array on `output.schema`** (input stays as-is). Don't touch the list/get endpoints — they stay read-only.

**Procedure-only.** All 9 endpoints are procedures with `input.schema` + `output.schema`. If a future query gets a workflow output, the recipe is different: queries have `parameters` instead of `input.schema`, so the inbound `workflow` would have to ride on the request body via a hybrid procedure conversion. Out of scope today — flag it when the case arises.

### Version bump + publish

- Bump `@atiproto/lexicons` to the next minor (0.8.0 seems right).
- Build: `npm run build:lexicons && npm run build` inside the package.
- Publish: the server side pins `@atiproto/lexicons@^0.8.0` as a prerequisite for the agent interpreter.

---

## Agent interpreter

Two new files:

- `packages/agent/src/workflow.ts` — the `runActions` helper + error classes. Pure logic, no references to the outer `Agent`.
- Edits in `packages/agent/src/agent.ts` — override `call()` and hold a reference to the underlying `pdsAgent` so the interpreter can issue record writes on its behalf.

### Why override `call()` instead of wrapping each namespace method

The namespace files under `src/namespaces/**` are hand-written. Every one of them ends with `this._client.call(nsid, params, data, opts)`. The `_client` they're handed is the `Agent` itself (see `ComNS(this, client)` in `src/agent.ts:50`). So if `Agent.call` is the seam that notices a `workflow` envelope and drives the interpreter loop, **every namespace method benefits automatically**:

- No per-method edits today for the nine orchestrating endpoints.
- No namespace edits when a tenth endpoint grows a workflow output later — only the lexicon changes.
- The interpreter is keyed on the **response shape** (`data.workflow.intent` + `data.workflow.actions` array), not a hardcoded NSID list. A shape-based check is tolerant of additive schema evolution.
- Non-workflow endpoints (queries, data lexicons, hybrids) simply don't have `data.workflow` in the response and pass straight through. Zero extra cost on the hot path.

The same approach handles recursion naturally: the server can chain any number of intent phases, the agent's while-loop keeps running until a workflow-free response arrives. Recursion was the other option — `executeWorkflow` calling itself — but a while-loop is flatter, stack-safe, and easier to cap with a max-depth guard.

### Operating on `XrpcClient`, not `ApiAgent`

Workflow `create`/`update`/`delete` actions hit `com.atproto.repo.{create,put,delete}Record`. The interpreter calls those NSIDs through `XrpcClient.call(...)` directly — no dependence on `@atproto/api`'s namespaced surface, no `instanceof ApiAgent` branching, no DID resolution.

- `runActions` is typed `(pds: XrpcClient, actions: ...)`. Plain `XrpcClient` works structurally; an `ApiAgent` (which extends `XrpcClient`) works because it has the bundled `com.atproto.*` lexicons loaded for validation.
- **`repo` rides on each action.** The server populates `action.repo` (typically the authed user's own DID, since OAuth scopes won't authorize anything else); the agent passes it verbatim to `com.atproto.repo.{create,put,delete}Record`. If the server addresses an unowned repo by mistake, the PDS rejects with an auth error → `WorkflowActionFailed` → `intent: "error"` callback. The agent does not need to know whose session this is.
- The agent therefore holds no DID-resolution code. No `assertDid` access, no session inspection, no fallback chain.

### Shape

```typescript
// packages/agent/src/workflow.ts

import type { XrpcClient } from "@atproto/xrpc";
import type { com } from "@atiproto/lexicons";

export type WorkflowError = {
  action: string;
  name?: string;
  message: string;
  code?: string;
};

export class WorkflowRaisedError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "WorkflowRaisedError";
    this.code = code;
  }
}

export class WorkflowActionFailed extends Error {
  constructor(
    public action: string,
    public name: string | undefined,
    public code: string | undefined,
    public partial: com.atiproto.actions.Response[],
    message: string,
  ) {
    super(message);
    this.name = "WorkflowActionFailed";
  }
}

const WORKFLOW_FIELD = "workflow";

function asRecord(x: unknown): Record<string, unknown> | undefined {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : undefined;
}

// Structural test — we deliberately don't check NSID, so any future endpoint
// whose output schema carries `com.atiproto.actions#outboundWorkflow` is
// handled without changes here.
export function isOutboundWorkflow(x: unknown): x is com.atiproto.actions.OutboundWorkflow {
  const o = asRecord(x);
  return !!o && typeof o.intent === "string" && Array.isArray(o.actions);
}

// Extract a workflow envelope from response data, or undefined if absent / malformed.
export function extractWorkflow(data: unknown): com.atiproto.actions.OutboundWorkflow | undefined {
  const o = asRecord(data);
  if (!o) return undefined;
  const w = o[WORKFLOW_FIELD];
  return isOutboundWorkflow(w) ? w : undefined;
}

// Action $type is always `com.atiproto.actions#<verb>`; pull the verb out.
function actionVerb(a: com.atiproto.actions.Action): string {
  return a.$type.split("#")[1] ?? "";
}

// `name` lives on Create/Update/Delete actions, not on Raise. Returns undefined
// for variants that don't carry one.
function actionName(a: com.atiproto.actions.Action): string | undefined {
  return "name" in a ? a.name : undefined;
}

// Narrow an unknown PDS write response to { uri, cid }. The PDS contract for
// createRecord/putRecord guarantees both; this just makes the narrowing
// explicit instead of casting through `as any`.
function repoWriteResult(data: unknown): { uri: string; cid: string } {
  const o = asRecord(data);
  if (!o || typeof o.uri !== "string" || typeof o.cid !== "string") {
    throw new Error("Unexpected response from PDS: expected { uri, cid }");
  }
  return { uri: o.uri, cid: o.cid };
}

function xrpcErrorCode(err: unknown): string | undefined {
  if (!(err instanceof Error)) return undefined;
  const candidate = (err as Error & { error?: unknown }).error;
  return typeof candidate === "string" ? candidate : undefined;
}

export async function runActions(
  pds: XrpcClient,
  actions: com.atiproto.actions.Action[],
): Promise<com.atiproto.actions.Response[]> {
  const responses: com.atiproto.actions.Response[] = [];
  for (const action of actions) {
    try {
      // The generated `Action` type is a discriminated union on `$type`.
      // Each case below narrows `action` to its specific variant.
      switch (action.$type) {
        case "com.atiproto.actions#create": {
          const res = await pds.call(
            "com.atproto.repo.createRecord",
            undefined,
            {
              repo: action.repo,
              collection: action.collection,
              rkey: action.rkey,
              record: action.record,
            },
          );
          responses.push({
            action: "create",
            name: action.name,
            result: repoWriteResult(res.data),
          });
          break;
        }
        case "com.atiproto.actions#update": {
          const res = await pds.call(
            "com.atproto.repo.putRecord",
            undefined,
            {
              repo: action.repo,
              collection: action.collection,
              rkey: action.rkey,
              record: action.record,
              swapCommit: action.swapCommit,
            },
          );
          responses.push({
            action: "update",
            name: action.name,
            result: repoWriteResult(res.data),
          });
          break;
        }
        case "com.atiproto.actions#delete": {
          const uri = `at://${action.repo}/${action.collection}/${action.rkey}`;
          await pds.call(
            "com.atproto.repo.deleteRecord",
            undefined,
            {
              repo: action.repo,
              collection: action.collection,
              rkey: action.rkey,
              swapCommit: action.swapCommit,
            },
          );
          responses.push({
            action: "delete",
            name: action.name,
            result: { uri },
          });
          break;
        }
        case "com.atiproto.actions#raise": {
          throw new WorkflowRaisedError(action.message, action.code);
        }
        default: {
          // Compile-time exhaustiveness check — fails if a new variant is
          // added to the union without a matching case here.
          const _exhaustive: never = action;
          throw new Error(
            `Unknown workflow action $type: ${actionVerb(_exhaustive)}`,
          );
        }
      }
    } catch (err) {
      if (err instanceof WorkflowRaisedError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new WorkflowActionFailed(
        actionVerb(action),
        actionName(action),
        xrpcErrorCode(err),
        responses,
        msg,
      );
    }
  }
  return responses;
}
```

### Integrating with `Agent`

Edit `packages/agent/src/agent.ts` to override `call()` with the interpreter loop. `client` already lives as a constructor-local — the existing Proxy at `agent.ts:54-59` captures it via closure to delegate unknown property access. We extend the same pattern: keep `client` as a constructor-local, capture it (plus a bound `super.call`) via partial application, and delegate to a private method that holds the actual logic. The constructor stays focused on wiring; the loop body lives in `_call` where it's easier to read and maintain.

```typescript
// Sketch — see src/agent.ts for the full current state.

export interface AgentOptions {
  /** Cap the workflow callback loop. Default 10. */
  maxWorkflowSteps?: number;
}

export class Agent<TClient extends XrpcClient = XrpcClient> extends XrpcClient {
  com: ComNS & ComOf<TClient>;
  private readonly _maxWorkflowSteps: number;

  // Assigned in the constructor (bound version of _call); declared here for the type.
  declare call: XrpcClient["call"];

  constructor(
    options: TClient | SessionManager | FetchHandler | FetchHandlerOptions,
    agentOpts: AgentOptions = {},
  ) {
    const client = options instanceof XrpcClient ? options : new ApiAgent(options);
    super(createFetchHandler(client), schemas);

    this._maxWorkflowSteps = agentOpts.maxWorkflowSteps ?? 10;
    this.com = new ComNS(this, client) as ComNS & ComOf<TClient>;

    // Bind the un-overridden parent call + the underlying client into _call.
    // Same closure-capture idea as the Proxy below; no instance field needed.
    const superCall = super.call.bind(this) as XrpcClient["call"];
    this.call = this._call.bind(this, superCall, client);

    return new Proxy(this, { /* unchanged */ });
  }

  private async _call(
    superCall: XrpcClient["call"],
    client: XrpcClient,
    nsid: string,
    params?: QueryParams,
    data?: unknown,
    opts?: CallOptions,
  ): Promise<XRPCResponse> {
    const baseInput = asRecord(data) ?? {};
    let nextData: unknown = data;
    let steps = 0;
    let res: XRPCResponse;
    let workflow: com.atiproto.actions.OutboundWorkflow | undefined;

    do {
      res = await superCall(nsid, params, nextData, opts);
      workflow = extractWorkflow(res.data);

      // Final response — no workflow, or workflow with no actions.
      if (!workflow || workflow.actions.length === 0) {
        workflow = undefined;
        break;
      }

      try {
        const responses = await runActions(client, workflow.actions);
        nextData = {
          ...baseInput,
          [WORKFLOW_FIELD]: { intent: workflow.intent, responses },
        };
      } catch (err) {
        if (err instanceof WorkflowRaisedError) throw err;
        if (err instanceof WorkflowActionFailed) {
          nextData = {
            ...baseInput,
            [WORKFLOW_FIELD]: {
              intent: "error",
              responses: err.partial,
              error: {
                action: err.action,
                name: err.name,
                message: err.message,
                code: err.code,
              },
            },
          };
          continue;
        }
        throw err;
      }
    } while (++steps < this._maxWorkflowSteps);

    // Loop exited via condition (not break) → workflow is still pending.
    if (workflow) {
      throw new Error(
        `Workflow exceeded max steps (${this._maxWorkflowSteps}) for ${nsid}`,
      );
    }

    // Strip workflow from the final data so callers see the clean native output.
    const finalData = asRecord(res.data);
    if (finalData && WORKFLOW_FIELD in finalData) {
      const { [WORKFLOW_FIELD]: _, ...clean } = finalData;
      return { ...res, data: clean };
    }
    return res;
  }
}
```

Notes on this approach:

- `XrpcClient` is the default type parameter (and the lower bound). `Agent` already extends `XrpcClient`, so anything callers pass in is at minimum an `XrpcClient`. Authors who want narrower typing of the underlying client (e.g. accessing ApiAgent-specific namespaces) can supply `Agent<ApiAgent>` explicitly.
- `superCall` retains all current XrpcClient behavior: proxy header, lexicon validation, etc. The interpreter only runs *after* a successful response.
- **`client` is closure-captured via `bind`**, matching the existing Proxy pattern at `agent.ts:54-59`. No new instance field — `client` lives in constructor scope and is reachable from both the Proxy's get handler and the bound `_call`. Constructor responsibility is wiring; `_call` holds the logic.
- **do-while + post-loop max-steps check.** With `_maxWorkflowSteps = N`, the agent executes at most N action batches before giving up. The condition `++steps < N` exits after the Nth iteration; the post-loop check throws iff `workflow` is still pending (i.e. the loop did not exit through the natural `break`). The `break` path also clears `workflow`, so the guard is a no-op on the happy path.
- **`repo` comes from the server, per action.** Each `create`/`update`/`delete` carries its own `repo` DID. The agent passes it to the PDS verbatim; if the server gets it wrong, the PDS auth check rejects and the failure surfaces via the error callback. The agent does no DID resolution.
- `data` passed in by namespace methods is spread into the callback payload, preserving the caller's original input on every round (the "initialInput echo" the server depends on).
- The `params` argument is kept across callbacks unchanged — matters only for hybrid endpoints (none of the 9 today, but correct by construction).
- The final response has `workflow` deleted so caller-facing types stay clean. Generated TypeScript still has `workflow?: OutboundWorkflow | undefined` as an optional field, but at runtime it's never present on the value the caller receives.

### Error handling

`WorkflowRaisedError` — thrown when the server emits a `raise` action. Caller of the agent method gets this error (with `message` and optional `code`). This is the "normal" error mode — a workflow server-rejected the operation.

`WorkflowActionFailed` — internal, caught inside `call()` and translated into an error callback to the server. Not exposed to the caller unless the server's error branch itself times out or misbehaves (in which case it escapes as a regular Error from XrpcClient on the next attempt).

Network errors bubble up as whatever the underlying `XrpcClient` throws. If the PDS rejects a write (e.g. 401 on createRecord), that becomes a `WorkflowActionFailed` → error intent → server decides what to do.

`maxWorkflowSteps` (default 10) caps the callback loop depth. A server bug that infinite-loops intents will surface as a clear error instead of hanging the client.

---

## Tests

Two test files, with clearly different scopes.

### Unit tests — `packages/agent/__tests__/workflow.test.ts` (new)

Cover `runActions`, `isOutboundWorkflow`, and the error classes in isolation. Fast, deterministic, no fetch involvement.

- `runActions` happy path for `create` / `update` / `delete` against a mocked `XrpcClient` whose `call` is a `vi.fn()` returning canned `{ uri, cid }`. Action fixtures carry both `$type: "com.atiproto.actions#<verb>"` and `repo: "did:plc:..."` — pins the discriminator contract and the per-action `repo` contract simultaneously.
- `runActions` aborts on first failure, throws `WorkflowActionFailed` carrying `partial` responses for everything that succeeded before the failure. The `action` field on the error reflects the verb extracted from `$type`.
- `runActions` throws `WorkflowRaisedError` immediately on a `raise` action; subsequent actions in the batch are skipped.
- `runActions` `delete` response carries `{ uri }` only (no `cid`).
- `runActions` rejects an action with an unknown or missing `$type` via the default branch.
- `isOutboundWorkflow` accepts/rejects shape variants: missing `intent`, missing `actions`, `actions: null`, plain object, etc.

### Integration tests — `packages/agent/__tests__/workflow.integration.test.ts` (new)

The integration tests exercise the full `Agent.call` → XrpcClient → fetch → interpreter → PDS write → callback chain. The goal is to catch any regression where the wiring (lexicon validation, header injection, callback payload shape, `workflow` strip) breaks even when each unit passes.

**Setup helpers** (top of file or in `__tests__/helpers/scripted-fetch.ts`):

```typescript
type Route = (req: Request) => Response | Promise<Response>;

function scriptedFetch(routes: Record<string, Route>) {
  return async (url: string, init: RequestInit) => {
    const u = new URL(url, "http://localhost");
    const route = routes[u.pathname];
    if (!route) return new Response(null, { status: 404 });
    return route(new Request(url, init));
  };
}

function authedApiAgent(did: string, fetch: typeof globalThis.fetch) {
  const apiAgent = new ApiAgent(fetch);
  // Stub the DID accessor so assertDid returns. The real session machinery is
  // tested elsewhere; we only need a value here.
  Object.defineProperty(apiAgent, "did", { value: did, configurable: true });
  return apiAgent;
}

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

**Why a scripted fetch over MSW or an in-process PDS.** Both alternatives buy realism we don't need. The fetchHandler interface is the documented integration point for `@atproto/api`, and the @atproto/lex output enforces validation on the way in/out — we already exercise the real validation pipeline by going through `Agent.call`. Lighter setup, no extra dependency.

**Scenarios:**

1. **Single round, single action.** Server emits one `create` → fetch handler asserts the PDS request (collection, rkey, repo) and returns a uri/cid → callback fetch handler asserts intent + responses[0].result.uri → server returns `{ tipUri, tip }`. Caller receives `data.tipUri` and `data` does **not** have `workflow`.

2. **Multi-round chain.** Server emits `intent: "createCart"` → callback → server emits `intent: "createTip"` with another `create` → callback → server emits final result. Verify intent echoed verbatim each round, and the right number of XRPC + PDS calls fire (3 XRPC, 2 PDS).

3. **Direct result, no workflow.** Server returns native output with no `workflow`. Caller receives data immediately. Zero PDS calls. (Post-#4877 happy path.)

4. **Empty actions array exits the loop.** Server returns `{ workflow: { intent: "x", actions: [] } }`. No PDS calls; `workflow` stripped from returned data.

5. **Action failure → error callback → raise.** Server emits `create` → PDS returns 401 → agent callbacks with `intent: "error"`, error payload populated → server emits `raise` → caller catches `WorkflowRaisedError` with the server's message and code.

6. **Compensating delete on failure (rollback path).** Server emits `[create, create]` → PDS scripted to succeed on the first, fail on the second → agent callbacks with `intent: "error"`, `responses: [first]` → server replies with `intent: "rollback"` and actions `[delete, raise]` → PDS sees the cleanup delete with the first record's rkey → agent processes the delete then throws `WorkflowRaisedError`. Mirrors the server-plan's `handleTipCreateError` example (server plan §Error flow).

7. **`raise` as terminal action.** Server emits an `actions` batch starting with `raise`. No PDS calls fire; `WorkflowRaisedError` thrown.

8. **Initial input preserved.** Server's callback handler asserts that every original input field (`subject`, `amount`, `currency`, ...) is present alongside `workflow` on the callback body.

9. **Extensibility — arbitrary NSID with a workflow.** Mock a `feed.tip.list` response that injects `workflow` even though today's lexicon doesn't include it. The interpreter must still run. This is the "any future endpoint just works" regression test — pin the shape-driven contract. (Verified against `@atproto/lexicon`'s `validators/complex.js#object` — it iterates declared properties and passes extra keys through unchanged, neither stripping nor rejecting. Test will exercise the agent layer end-to-end.)

10. **Max-steps guard.** Server replies with a workflow on every call. Construct `new Agent(client, { maxWorkflowSteps: 2 })`. Verify the agent throws `Workflow exceeded max steps (2)` and does not enter a third action batch.

11. **`workflow` strip on final data.** Two sub-cases:
    - Final response has no `workflow` at all → `data` matches the lexicon's native output exactly.
    - Final response has `workflow: { intent, actions: [] }` → loop exits via the empty-actions branch and `workflow` is removed before the return.

12. **Auth failure only when workflow arrives.** Use an unauthenticated `ApiAgent`. Calls to read-only endpoints work normally. A workflow-emitting endpoint with an authentic-failure on `assertDid` produces a clean `intent: "error"` callback; if the server then `raise`s, the caller sees a `WorkflowRaisedError` (not a raw `assertDid` throw).

13. **Proxy header still set.** Verify the XRPC fetch carries `atproto-proxy: did:web:atiproto.com#payments`. Existing test at `__tests__/agent.test.ts:62-78` covers the simple case; the integration variant proves it survives the workflow callback path too.

14. **Lexicon validation passes for the new `workflow` field.** Two layers:
    - **Agent-side** integration assertion: the fetch handler returns a payload with `workflow` populated; XrpcClient parses without throwing.
    - **Lexicons-package** assertion (`packages/lexicons/__tests__/actions.test.ts` or similar): import `schemas` from `@atiproto/lexicons`, assert `com.atiproto.actions` is in the array and that its `defs` include `inboundWorkflow`, `outboundWorkflow`, and the action union with `refs: ["#create", "#update", "#delete", "#raise"]`. Cheap snapshot — catches a build pipeline that drops the new schema or renames a def.

### Notes

- Don't pin specific CID strings in assertions — the agent forwards whatever the PDS returns, so use a regex (`/^bafy/`) or `expect.any(String)`.
- Use `vi.fn()` to wrap each scripted route so the test can assert call counts and inspect bodies after the fact.
- Tests should consume the **bundled** lexicons (`@atiproto/lexicons` types + schemas), not stub them. If the lexicon publishing pipeline doesn't include `workflow` in the output validation, the integration test will fail loud — exactly what we want.

---

## Release plan

1. **`@atiproto/lexicons` 0.8.0.**
   1. Add `com.atiproto.actions` schema (this doc's lexicon).
   2. Update the 9 endpoint schemas: add `workflow` to input + output, drop output `required` arrays.
   3. Run `npm run build:lexicons` to regenerate types — **this must complete before agent code can typecheck against `com.atiproto.actions.Action` etc.** Treat this as the implicit dependency between sub-steps.
   4. Run lexicons unit tests, including the new bundled-validator assertion (test list, scenario 14).
   5. Build, publish.

2. **`@atiproto/agent` 0.8.0.** Add the interpreter (workflow.ts + agent.ts edits). Bump lexicons dep to `^0.8.0`. Build, test, publish. Namespace files do not change.

3. **atiproto-server Phase 2.** Pin new agent/lexicons, implement `feed.tip.create` as the pilot server-side. Exercise end-to-end against a real Bluesky PDS.

4. **After pilot is green**, atiproto-server Phases 3–4 (port the other 8 endpoints, then service-auth cleanup).

---

## Hand-off points with atiproto-server

Server agent and this package need to agree on:

- **Lexicon NSIDs and field names.** `com.atiproto.actions` is the name. `inboundWorkflow` / `outboundWorkflow` are the wrapper refs. The envelope key on inputs and outputs is `workflow` (fall back to plain `workflow` if `@atproto/lex` rejects `$`-prefixed property names).
- **Output schema `required` arrays.** The 9 orchestrating endpoints drop their output `required` arrays so workflow responses validate alongside native responses. Server plan §Per-endpoint contract spells this out at line 227.
- **`repo` source.** Server populates `repo` on every `create`/`update`/`delete` action with the DID it intends the write to land in. Agent passes verbatim to the PDS; the PDS's auth check is the source of truth for whether the write is allowed. Note: this is a divergence from the server-side plan's pseudo-code (which currently shows actions without a `repo` field) — the server-side handler authoring pattern needs the same update.
- **`rkey` source.** Server generates (typically `TID.nextStr()`), includes on every `create` action. Agent does not generate rkeys.
- **Intent strings.** Server-defined per handler; agent only overrides to `"error"`. No shared enum. Server plan uses `"createTip"`, `"createCart"`, `"rollback"` as illustrative phase markers — the agent treats them all as opaque strings.
- **Error payload shape.** Agent constructs `error` with `action` (failed action verb), `name`, `message`, `code` (if extractable from XrpcError).
- **Initial-input echo.** Agent sends `{ ...initialInput, workflow: {...} }` on every callback. Server handlers can assume the initial fields are present on callbacks.
- **Orphan records on interruption.** V0 leaves orphans alone; reconciliation is offline (server plan §Orphan records). The agent does not retry, dedupe, or stamp idempotency keys.
- **`@atiproto/lexicons` minimum version.** Agent will import types from the new `com.atiproto.actions` namespace; server pins the same minimum.

If the server agent needs a schema change mid-flight (e.g., "we actually want an optional `metadata` field on `create`"), update this doc and the lexicon JSON, bump minor, and republish. The field can be added to `actions.json` additively without breaking existing callers.

---

## Resolved decisions

- **Field name.** `workflow`, prefixed to namespace it like `$type`. Verify `@atproto/lex` accepts `$`-prefixed property names during implementation; fall back to plain `workflow` if not.
- **`repo` is server-supplied per action.** Each `create`/`update`/`delete` carries `repo` as a required field. The agent passes it through to the PDS without inspection. PDS auth rejects writes to repos the OAuth scope doesn't cover — that natural failure surfaces via the error callback. No `assertDid` reads, no session inspection in the agent.
- **Constructor signature.** `new Agent(client, { maxWorkflowSteps?: number })`. Additive second argument, no breaking change. (Open to revisit if more options accumulate.)
- **Auth handling.** No precheck. PDS auth runs at write time — if the OAuth scope doesn't cover the requested `repo`, the PDS rejects, the rejection becomes a `WorkflowActionFailed`, and the error callback fires. Non-workflow calls are never affected.
- **Underlying client typed as `XrpcClient` throughout.** Helpers and `runActions` operate on `XrpcClient`, calling `pds.call("com.atproto.repo.createRecord", ...)` directly. No `instanceof ApiAgent`, no namespace-method dependency, no DID resolution.
- **`workflow` strip on return.** `Agent.call` removes `workflow` from the final response data so caller-facing values match the lexicon's native output type.
- **Loop, not recursion.** While-loop with a `maxWorkflowSteps` guard (default 10).
- **Interpreter location.** `Agent.call()` override, not per-namespace-method. Adding a workflow output to any future endpoint is a lexicon-only change.
- **Namespace files.** Hand-written, confirmed (see `packages/agent/src/namespaces/com/atiproto/feed/tip.ts`). No edits needed for this feature.

## Open questions

- **TID generation.** Server uses `TID.nextStr()` from `@atproto/common`. Server plan assumes that. Agent never generates rkeys. Confirm with the server-side plan.
- **Lexicon version number.** 0.8.0 (minor bump for additive schema). Server plan references the version; pick the same number.
- **Generated `$Input`/`$Output` type carries `workflow?`.** Callers using TS will see an optional `workflow` field on every orchestrating endpoint's input/output type. The `call()`-level strip removes it from runtime values, so callers can ignore it. Worth a one-liner in the package README so it's not surprising.
