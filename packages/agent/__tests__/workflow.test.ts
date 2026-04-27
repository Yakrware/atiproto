import { describe, it, expect, vi } from "vitest";
import {
  WorkflowActionFailed,
  WorkflowRaisedError,
  extractWorkflow,
  isOutboundWorkflow,
  runActions,
} from "../src/workflow.js";

const REPO = "did:plc:user";
const COLLECTION = "com.atiproto.tip";

function mockClient(scripted: Record<string, unknown[]>) {
  const calls: Array<{ nsid: string; data: unknown }> = [];
  const indexes: Record<string, number> = {};
  return {
    calls,
    client: {
      call: vi.fn(async (nsid: string, _params: unknown, data: unknown) => {
        calls.push({ nsid, data });
        const queue = scripted[nsid];
        if (!queue) {
          throw new Error(`Unmocked NSID: ${nsid}`);
        }
        const i = (indexes[nsid] ??= 0);
        indexes[nsid] = i + 1;
        const next = queue[i] ?? queue[queue.length - 1];
        if (next instanceof Error) throw next;
        return { data: next, headers: {}, success: true };
      }),
    } as any,
  };
}

describe("isOutboundWorkflow", () => {
  it("accepts a well-formed envelope", () => {
    expect(isOutboundWorkflow({ intent: "x", actions: [] })).toBe(true);
  });

  it("rejects when intent is missing", () => {
    expect(isOutboundWorkflow({ actions: [] })).toBe(false);
  });

  it("rejects when actions is not an array", () => {
    expect(isOutboundWorkflow({ intent: "x", actions: null })).toBe(false);
  });

  it("rejects null and primitives", () => {
    expect(isOutboundWorkflow(null)).toBe(false);
    expect(isOutboundWorkflow(undefined)).toBe(false);
    expect(isOutboundWorkflow("not a workflow")).toBe(false);
    expect(isOutboundWorkflow(42)).toBe(false);
  });
});

describe("extractWorkflow", () => {
  it("returns the envelope when present under $workflow", () => {
    const w = { intent: "createTip", actions: [] };
    expect(extractWorkflow({ $workflow: w, foo: "bar" })).toEqual(w);
  });

  it("returns undefined when $workflow is malformed", () => {
    expect(extractWorkflow({ $workflow: { intent: "x" } })).toBeUndefined();
  });

  it("returns undefined when $workflow is absent", () => {
    expect(extractWorkflow({ foo: "bar" })).toBeUndefined();
  });

  it("returns undefined when data is not an object", () => {
    expect(extractWorkflow(null)).toBeUndefined();
    expect(extractWorkflow("string")).toBeUndefined();
    expect(extractWorkflow(undefined)).toBeUndefined();
  });
});

describe("runActions — happy paths", () => {
  it("create returns { uri, cid } from the PDS response", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.createRecord": [
        { uri: `at://${REPO}/${COLLECTION}/abc`, cid: "bafyfake1" },
      ],
    });

    const responses = await runActions(client, [
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "tip",
        collection: COLLECTION,
        rkey: "abc",
        record: { foo: "bar" },
      } as any,
    ]);

    expect(responses).toEqual([
      {
        action: "create",
        name: "tip",
        result: {
          uri: `at://${REPO}/${COLLECTION}/abc`,
          cid: "bafyfake1",
        },
      },
    ]);
    expect(calls[0]).toEqual({
      nsid: "com.atproto.repo.createRecord",
      data: {
        repo: REPO,
        collection: COLLECTION,
        rkey: "abc",
        record: { foo: "bar" },
      },
    });
  });

  it("create without rkey lets the PDS generate one; response URI flows through", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.createRecord": [
        { uri: `at://${REPO}/${COLLECTION}/pds-gen-key`, cid: "bafyfakegen" },
      ],
    });

    const responses = await runActions(client, [
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "tip",
        collection: COLLECTION,
        record: { foo: "bar" },
      } as any,
    ]);

    // PDS sees no rkey; it picks one and returns the resulting uri.
    expect((calls[0].data as Record<string, unknown>).rkey).toBeUndefined();
    expect(responses[0].result.uri).toBe(
      `at://${REPO}/${COLLECTION}/pds-gen-key`,
    );
    expect(responses[0].result.cid).toBe("bafyfakegen");
  });

  it("update calls putRecord and returns { uri, cid }", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.putRecord": [
        { uri: `at://${REPO}/${COLLECTION}/abc`, cid: "bafyfake2" },
      ],
    });

    await runActions(client, [
      {
        $type: "com.atiproto.actions#update",
        repo: REPO,
        name: "tip",
        collection: COLLECTION,
        rkey: "abc",
        record: { foo: "baz" },
        swapCommit: "bafyswap",
      } as any,
    ]);

    expect(calls[0].data).toMatchObject({
      repo: REPO,
      collection: COLLECTION,
      rkey: "abc",
      record: { foo: "baz" },
      swapCommit: "bafyswap",
    });
  });

  it("delete carries { uri } only (no cid) and synthesizes the URI", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.deleteRecord": [{}],
    });

    const responses = await runActions(client, [
      {
        $type: "com.atiproto.actions#delete",
        repo: REPO,
        name: "old-tip",
        collection: COLLECTION,
        rkey: "abc",
      } as any,
    ]);

    expect(responses).toEqual([
      {
        action: "delete",
        name: "old-tip",
        result: { uri: `at://${REPO}/${COLLECTION}/abc` },
      },
    ]);
    expect(responses[0].result.cid).toBeUndefined();
    expect(calls[0].nsid).toBe("com.atproto.repo.deleteRecord");
  });

  it("processes multi-action batches in order", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.createRecord": [
        { uri: `at://${REPO}/${COLLECTION}/a`, cid: "bafy1" },
        { uri: `at://${REPO}/${COLLECTION}/b`, cid: "bafy2" },
      ],
    });

    const responses = await runActions(client, [
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "first",
        collection: COLLECTION,
        rkey: "a",
        record: {},
      } as any,
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "second",
        collection: COLLECTION,
        rkey: "b",
        record: {},
      } as any,
    ]);

    expect(responses.map((r) => r.name)).toEqual(["first", "second"]);
    expect(calls).toHaveLength(2);
  });
});

describe("runActions — error paths", () => {
  it("aborts on first failure and includes partial responses", async () => {
    const { client } = mockClient({
      "com.atproto.repo.createRecord": [
        { uri: `at://${REPO}/${COLLECTION}/a`, cid: "bafy1" },
        new Error("PDS rejected"),
      ],
    });

    const actions = [
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "ok",
        collection: COLLECTION,
        rkey: "a",
        record: {},
      },
      {
        $type: "com.atiproto.actions#create",
        repo: REPO,
        name: "boom",
        collection: COLLECTION,
        rkey: "b",
        record: {},
      },
    ] as any;

    let caught: unknown;
    try {
      await runActions(client, actions);
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(WorkflowActionFailed);
    const e = caught as WorkflowActionFailed;
    expect(e.action).toBe("create");
    expect(e.actionName).toBe("boom");
    expect(e.partial).toEqual([
      {
        action: "create",
        name: "ok",
        result: {
          uri: `at://${REPO}/${COLLECTION}/a`,
          cid: "bafy1",
        },
      },
    ]);
  });

  it("raise throws WorkflowRaisedError immediately", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.deleteRecord": [{}],
    });

    await expect(
      runActions(client, [
        {
          $type: "com.atiproto.actions#raise",
          message: "Tip creation failed",
          code: "TipCreateFailed",
        } as any,
      ]),
    ).rejects.toMatchObject({
      name: "WorkflowRaisedError",
      message: "Tip creation failed",
      code: "TipCreateFailed",
    });

    expect(calls).toHaveLength(0);
  });

  it("raise inside a batch skips later actions", async () => {
    const { client, calls } = mockClient({
      "com.atproto.repo.deleteRecord": [{}],
    });

    await expect(
      runActions(client, [
        {
          $type: "com.atiproto.actions#raise",
          message: "no thanks",
        } as any,
        {
          $type: "com.atiproto.actions#delete",
          repo: REPO,
          name: "should-not-run",
          collection: COLLECTION,
          rkey: "x",
        } as any,
      ]),
    ).rejects.toBeInstanceOf(WorkflowRaisedError);

    expect(calls).toHaveLength(0);
  });

  it("rejects an action with an unknown $type via the default branch", async () => {
    const { client } = mockClient({});

    await expect(
      runActions(client, [{ $type: "com.atiproto.actions#mystery" } as any]),
    ).rejects.toThrow(/Unknown workflow action \$type/);
  });

  it("extracts xrpc error codes onto WorkflowActionFailed when present", async () => {
    const xrpcError = Object.assign(new Error("invalid record"), {
      error: "InvalidRecord",
    });
    const { client } = mockClient({
      "com.atproto.repo.createRecord": [xrpcError],
    });

    try {
      await runActions(client, [
        {
          $type: "com.atiproto.actions#create",
          repo: REPO,
          name: "tip",
          collection: COLLECTION,
          rkey: "a",
          record: {},
        } as any,
      ]);
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(WorkflowActionFailed);
      expect((err as WorkflowActionFailed).code).toBe("InvalidRecord");
    }
  });
});
