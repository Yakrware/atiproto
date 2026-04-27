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
    public actionName: string | undefined,
    public code: string | undefined,
    public partial: com.atiproto.actions.Response[],
    message: string,
  ) {
    super(message);
    this.name = "WorkflowActionFailed";
  }
}

export const WORKFLOW_FIELD = "$workflow";

export type WorkflowAction =
  com.atiproto.actions.OutboundWorkflow["actions"][number];

function asRecord(x: unknown): Record<string, unknown> | undefined {
  return x && typeof x === "object"
    ? (x as Record<string, unknown>)
    : undefined;
}

export function isOutboundWorkflow(
  x: unknown,
): x is com.atiproto.actions.OutboundWorkflow {
  const o = asRecord(x);
  return !!o && typeof o.intent === "string" && Array.isArray(o.actions);
}

export function extractWorkflow(
  data: unknown,
): com.atiproto.actions.OutboundWorkflow | undefined {
  const o = asRecord(data);
  if (!o) return undefined;
  const w = o[WORKFLOW_FIELD];
  return isOutboundWorkflow(w) ? w : undefined;
}

function actionVerb(a: WorkflowAction): string {
  const t = a.$type;
  return typeof t === "string" ? (t.split("#")[1] ?? "") : "";
}

function actionName(a: WorkflowAction): string | undefined {
  return "name" in a && typeof a.name === "string" ? a.name : undefined;
}

// `com.atproto.repo.createRecord` and `putRecord` are specified to return
// both `uri` and `cid`; the reference @atproto/pds implementation always
// does. If a non-conformant PDS ever omits `cid`, surface it as a workflow
// failure rather than silently passing `undefined` to the server's response
// correlation — the server expects a CID for create/update.
function repoWriteResult(data: unknown): com.atiproto.actions.RecordResult {
  const o = asRecord(data);
  if (!o || typeof o.uri !== "string" || typeof o.cid !== "string") {
    throw new Error("Unexpected response from PDS: expected { uri, cid }");
  }
  return { uri: o.uri, cid: o.cid } as com.atiproto.actions.RecordResult;
}

// The generated `OutboundWorkflow["actions"]` union includes
// `Unknown$TypedObject` (forward-compat for unknown $types). Its `$type` is a
// wide string, so a switch on `action.$type` doesn't narrow Unknown out of the
// union. These helpers do the cast cleanly *after* a verified discriminator
// check — pure type-level narrowing, zero runtime cost.
type CreateAction = com.atiproto.actions.Create & {
  $type: "com.atiproto.actions#create";
};
type UpdateAction = com.atiproto.actions.Update & {
  $type: "com.atiproto.actions#update";
};
type DeleteAction = com.atiproto.actions.Delete & {
  $type: "com.atiproto.actions#delete";
};
type RaiseAction = com.atiproto.actions.Raise & {
  $type: "com.atiproto.actions#raise";
};

function xrpcErrorCode(err: unknown): string | undefined {
  if (!(err instanceof Error)) return undefined;
  const candidate = (err as Error & { error?: unknown }).error;
  return typeof candidate === "string" ? candidate : undefined;
}

export async function runActions(
  pds: XrpcClient,
  actions: readonly WorkflowAction[],
): Promise<com.atiproto.actions.Response[]> {
  const responses: com.atiproto.actions.Response[] = [];
  for (const action of actions) {
    try {
      switch (action.$type) {
        case "com.atiproto.actions#create": {
          const a = action as CreateAction;
          const res = await pds.call(
            "com.atproto.repo.createRecord",
            undefined,
            {
              repo: a.repo,
              collection: a.collection,
              rkey: a.rkey,
              record: a.record,
            },
          );
          responses.push({
            action: "create",
            name: a.name,
            result: repoWriteResult(res.data),
          });
          break;
        }
        case "com.atiproto.actions#update": {
          const a = action as UpdateAction;
          const res = await pds.call("com.atproto.repo.putRecord", undefined, {
            repo: a.repo,
            collection: a.collection,
            rkey: a.rkey,
            record: a.record,
            swapCommit: a.swapCommit,
          });
          responses.push({
            action: "update",
            name: a.name,
            result: repoWriteResult(res.data),
          });
          break;
        }
        case "com.atiproto.actions#delete": {
          const a = action as DeleteAction;
          const uri =
            `at://${a.repo}/${a.collection}/${a.rkey}` as com.atiproto.actions.RecordResult["uri"];
          await pds.call("com.atproto.repo.deleteRecord", undefined, {
            repo: a.repo,
            collection: a.collection,
            rkey: a.rkey,
            swapCommit: a.swapCommit,
          });
          responses.push({
            action: "delete",
            name: a.name,
            result: { uri },
          });
          break;
        }
        case "com.atiproto.actions#raise": {
          const a = action as RaiseAction;
          throw new WorkflowRaisedError(a.message, a.code);
        }
        default: {
          throw new Error(
            `Unknown workflow action $type: ${action.$type ?? "<missing>"}`,
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
