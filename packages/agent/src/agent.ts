import { Agent as ApiAgent } from "@atproto/api";
import {
  XrpcClient,
  type CallOptions,
  type FetchHandler,
  type FetchHandlerObject,
  type FetchHandlerOptions,
  type QueryParams,
  type XRPCResponse,
} from "@atproto/xrpc";
import { schemas } from "@atiproto/lexicons";
import {
  Attestation,
  type AttestationOptions,
} from "@atiproto/atproto-attestation";
import { ComNS } from "./namespaces/com.js";
import {
  WORKFLOW_FIELD,
  WorkflowActionFailed,
  WorkflowRaisedError,
  extractWorkflow,
  runActions,
} from "./workflow.js";

// Mirrors @atproto/api's SessionManager interface; declared locally to avoid
// importing from @atproto/api's internal dist directory.
interface SessionManager extends FetchHandlerObject {
  readonly did?: string;
}

const SERVICE_DID = "did:web:atiproto.com";
const SERVICE_TYPE = "payments";

const DEFAULT_MAX_WORKFLOW_STEPS = 10;

/**
 * Build a FetchHandler that routes requests to a given audience via the
 * `atproto-proxy` header. When the underlying client is an `@atproto/api`
 * Agent we use its `withProxy` clone (so labelers + auth headers compose
 * correctly); otherwise we inject the header by hand.
 *
 * Exported so other packages can build audience-pinned handlers from any
 * `XrpcClient`.
 */
export function createFetchHandler(
  client: XrpcClient,
  serviceType: string,
  serviceDid: string,
): FetchHandler {
  if (client instanceof ApiAgent) {
    const proxied = client.withProxy(serviceType, serviceDid);
    return (url, init) => proxied.fetchHandler(url, init);
  }

  return (url, init) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("atproto-proxy")) {
      headers.set("atproto-proxy", `${serviceDid}#${serviceType}`);
    }
    return client.fetchHandler(url, { ...init, headers });
  };
}

type ComOf<T> = T extends { com: infer C extends object } ? C : {};

export interface AgentOptions {
  /**
   * Cap the workflow callback loop. Default 10.
   *
   * One "step" = one action batch the agent executes between server calls.
   * A typical workflow today is 1–3 steps (e.g. tip-with-cart is two:
   * createTip → createCart). The default 10 is generous; lowering it makes
   * sense in environments where you'd rather fail fast than tolerate a
   * misbehaving server emitting an unbounded chain. Raising it past ~15 is
   * a smell — investigate the workflow shape first.
   *
   * When exceeded, `Agent.call` throws `Error("Workflow exceeded max
   * steps (N) for <nsid>")`.
   */
  maxWorkflowSteps?: number;

  /**
   * Optional attestation used to sign records the agent writes on the
   * user's behalf. Accept either a pre-built `Attestation` or the options
   * to construct one. When set, create / update workflow actions targeting
   * collections in `SIGNED_RECORD_COLLECTIONS` get an inline signature
   * appended to `signatures[]` before being sent to the PDS.
   */
  attestation?: Attestation | AttestationOptions;
}

/**
 * XRPC agent for atiproto endpoints.
 *
 * `Agent.call` transparently runs the workflow protocol: when a response
 * carries a `workflow` envelope, the agent executes the actions against the
 * user's PDS. The `workflow` field is stripped from the data before returning
 * to the caller, so caller-facing values match the lexicon's native output.
 *
 * Procedures and queries differ in callback shape:
 * - **Procedures** loop: server's first response is workflow-only; the agent
 *   runs actions and calls back with `inboundWorkflow`. Iterates until the
 *   server returns a workflow-free result.
 * - **Queries** are single-shot: the server returns the native result *and*
 *   an optional workflow side-effect on the same response. The agent runs
 *   the actions for their side effects, strips the envelope, and returns —
 *   no callback (queries can't carry a request body).
 *
 * **Note on output types.** Orchestrating procedures drop `required` from
 * their output schemas so workflow-only and native-result responses both
 * validate. As a result, generated `$OutputBody` types mark all native fields
 * optional (`itemUri?: string` etc). The interpreter guarantees they are
 * populated on the value callers receive, but TypeScript can't see that —
 * callers will need a runtime check or non-null assertion. Queries keep
 * `required`: the native fields are always present alongside the workflow.
 */
class AgentImpl<TClient extends XrpcClient = ApiAgent> extends XrpcClient {
  com: ComNS & ComOf<TClient>;
  readonly attestation?: Attestation;
  private readonly _maxWorkflowSteps: number;

  // The override is assigned in the constructor (bound version of _call);
  // this declaration just tells TS the public surface still matches XrpcClient.
  declare call: XrpcClient["call"];

  constructor(options: TClient, agentOpts?: AgentOptions);
  constructor(
    options: SessionManager | FetchHandler | FetchHandlerOptions,
    agentOpts?: AgentOptions,
  );
  constructor(
    options: SessionManager | XrpcClient | FetchHandler | FetchHandlerOptions,
    {
      maxWorkflowSteps = DEFAULT_MAX_WORKFLOW_STEPS,
      attestation,
    }: AgentOptions = {},
  ) {
    const client =
      options instanceof XrpcClient ? options : new ApiAgent(options);

    super(createFetchHandler(client, SERVICE_TYPE, SERVICE_DID), schemas);

    this._maxWorkflowSteps = maxWorkflowSteps;
    this.attestation =
      attestation instanceof Attestation
        ? attestation
        : attestation && new Attestation(attestation);
    this.com = new ComNS(this, client) as ComNS & ComOf<TClient>;

    // Same closure-capture pattern as the Proxy below — keep `client` and
    // `superCall` in scope without promoting them to instance fields.
    const superCall = super.call.bind(this) as XrpcClient["call"];
    this.call = this._call.bind(this, superCall, client);

    // Root proxy: our own properties take priority, everything else falls
    // through to the underlying client.
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        return Reflect.get(client, prop, receiver);
      },
    });
  }

  private async _call(
    superCall: XrpcClient["call"],
    client: XrpcClient,
    nsid: string,
    params?: QueryParams,
    data?: unknown,
    opts?: CallOptions,
  ): Promise<XRPCResponse> {
    const isQuery = this.lex.getDef(nsid)?.type === "query";

    const baseInput =
      data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    let nextData: unknown = data;
    let steps = 0;
    let res: XRPCResponse;
    let workflow: ReturnType<typeof extractWorkflow>;

    do {
      res = await superCall(nsid, params, nextData, opts);
      workflow = extractWorkflow(res.data);

      // Final response — workflow absent or actions empty.
      if (!workflow || workflow.actions.length === 0) {
        workflow = undefined;
        break;
      }

      try {
        const responses = await runActions(
          client,
          workflow.actions,
          this.attestation,
        );
        if (isQuery) {
          workflow = undefined;
          break;
        }
        nextData = {
          ...baseInput,
          [WORKFLOW_FIELD]: { intent: workflow.intent, responses },
        };
      } catch (err) {
        if (err instanceof WorkflowRaisedError) throw err;
        if (isQuery) throw err;
        if (err instanceof WorkflowActionFailed) {
          nextData = {
            ...baseInput,
            [WORKFLOW_FIELD]: {
              intent: "error",
              responses: err.partial,
              error: {
                action: err.action,
                name: err.actionName,
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

    // Loop exited via while-condition (not break) → workflow is still pending.
    if (workflow) {
      throw new Error(
        `Workflow exceeded max steps (${this._maxWorkflowSteps}) for ${nsid}`,
      );
    }

    // Strip workflow from the final data so callers see the clean native output.
    const finalData =
      res.data && typeof res.data === "object"
        ? (res.data as Record<string, unknown>)
        : undefined;
    if (finalData && WORKFLOW_FIELD in finalData) {
      const { [WORKFLOW_FIELD]: _strip, ...clean } = finalData;
      return { ...res, data: clean };
    }
    return res;
  }
}

/**
 * Public instance type. The constructor returns a Proxy that falls through
 * to the underlying `TClient`, so structurally an `Agent<TClient>` *is* a
 * `TClient` too — `agent.withProxy(...)`, `agent.chat.bsky.*`, etc. all
 * work at runtime. The intersection here lets TypeScript accept an
 * `Agent<ApiAgent>` wherever an `ApiAgent` is required.
 */
export type Agent<TClient extends XrpcClient = ApiAgent> = AgentImpl<TClient> &
  TClient;

interface AgentConstructor {
  new <TClient extends XrpcClient = ApiAgent>(
    options: TClient,
    agentOpts?: AgentOptions,
  ): Agent<TClient>;
  new (
    options: SessionManager | FetchHandler | FetchHandlerOptions,
    agentOpts?: AgentOptions,
  ): Agent<ApiAgent>;
  readonly prototype: AgentImpl;
}

// The runtime value is the implementation class, retyped so callers see
// `Agent<TClient> & TClient` as the constructed instance type. `instanceof
// Agent` still works since `Agent === AgentImpl` at runtime.
export const Agent: AgentConstructor = AgentImpl as unknown as AgentConstructor;
