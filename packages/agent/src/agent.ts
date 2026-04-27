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

function createFetchHandler(client: XrpcClient): FetchHandler {
  if (client instanceof ApiAgent) {
    const proxied = client.withProxy(SERVICE_TYPE, SERVICE_DID);
    return (url, init) => proxied.fetchHandler(url, init);
  }

  return (url, init) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("atproto-proxy")) {
      headers.set("atproto-proxy", `${SERVICE_DID}#${SERVICE_TYPE}`);
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
}

/**
 * XRPC agent for atiproto endpoints.
 *
 * `Agent.call` transparently runs the workflow protocol: when a response
 * carries a `workflow` envelope, the agent executes the actions against the
 * user's PDS and calls back until the server returns a workflow-free result.
 * The `workflow` field is stripped from the data before returning to the
 * caller, so caller-facing values match the lexicon's native output shape.
 *
 * **Note on output types.** Orchestrating endpoints (the 9 workflow-capable
 * procedures — feed.tip.create/put, feed.subscription.*, account.cart.*,
 * account.profile.put) drop `required` from their output schemas so workflow
 * envelopes and native results both validate. As a result, generated
 * `$OutputBody` types mark all native fields optional (`tipUri?: string` etc).
 * The interpreter guarantees the native fields are populated on the value
 * callers receive, but TypeScript can't see that — callers will need a
 * runtime check or non-null assertion (`res.data.tipUri!`).
 */
export class Agent<TClient extends XrpcClient = ApiAgent> extends XrpcClient {
  com: ComNS & ComOf<TClient>;
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
    { maxWorkflowSteps = DEFAULT_MAX_WORKFLOW_STEPS }: AgentOptions = {},
  ) {
    const client =
      options instanceof XrpcClient ? options : new ApiAgent(options);

    super(createFetchHandler(client), schemas);

    this._maxWorkflowSteps = maxWorkflowSteps;
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
