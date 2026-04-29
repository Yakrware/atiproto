import { describe, it, expect, vi } from "vitest";
import { Agent as ApiAgent } from "@atproto/api";
import { Agent, WorkflowRaisedError } from "../src/index.js";

const USER_DID = "did:plc:user";
const ITEM_COLLECTION = "com.atiproto.item";
const CART_COLLECTION = "com.atiproto.cart";
// Real CIDv1 — passes lex's `format: cid` validator (CID.parse).
const FAKE_CID = "bafyreigh2akiscaildc3xqwmwx4tgabhgwd3xnpemivpknbplbeczj7yyy";
const FAKE_CID_2 =
  "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a";

type Route = (req: Request) => Response | Promise<Response>;

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function jsonErr(error: string, message: string, status = 400) {
  return jsonRes({ error, message }, status);
}

// URL-routed fetch handler: each test scripts a path → handler map and the
// fetch calls (XRPC server + PDS writes) all flow through the same dispatcher.
function scriptedFetch(routes: Record<string, Route>) {
  const calls: Array<{ url: string; init: RequestInit; body?: unknown }> = [];
  const fetchHandler = vi.fn(async (url: string, init: RequestInit) => {
    let body: unknown;
    if (init.body && typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }
    calls.push({ url, init, body });
    const absolute = new URL(url, "http://localhost");
    const handler = routes[absolute.pathname];
    if (!handler)
      return jsonErr("UnmockedRoute", `No route for ${absolute.pathname}`, 404);
    return handler(new Request(absolute.toString(), init));
  });
  return { fetchHandler, calls };
}

function buildAgent(
  fetchHandler: ReturnType<typeof scriptedFetch>["fetchHandler"],
  opts?: { maxWorkflowSteps?: number },
) {
  // Build an authed ApiAgent so writes route correctly. We don't drive a real
  // OAuth login — the tests rely on the server populating `repo` per action.
  // `prepChat: false` keeps the workflow tests focused on the workflow path —
  // the chat pre-auth flow has its own coverage in prep-chat.test.ts.
  const apiAgent = new ApiAgent(fetchHandler);
  return new Agent(apiAgent, { ...opts, prepChat: false });
}

describe("workflow interpreter — integration", () => {
  it("single round, single action: server emits create → agent writes → callback → final", async () => {
    let xrpcCalls = 0;
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async (req) => {
        const body = await req.json();
        xrpcCalls++;
        if (xrpcCalls === 1) {
          return jsonRes({
            workflow: {
              intent: "createTip",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "item",
                  collection: ITEM_COLLECTION,
                  rkey: "tipkey1",
                  record: {
                    $type: ITEM_COLLECTION,
                    amount: 500,
                    currency: "USD",
                    status: "pending",
                    createdAt: "2024-01-01T00:00:00Z",
                  },
                },
              ],
            },
          });
        }
        // Callback
        expect(body.workflow.intent).toBe("createTip");
        expect(body.workflow.responses).toHaveLength(1);
        expect(body.workflow.responses[0]).toMatchObject({
          action: "create",
          name: "item",
          result: {
            uri: `at://${USER_DID}/${ITEM_COLLECTION}/tipkey1`,
            cid: FAKE_CID,
          },
        });
        // Initial input still echoed
        expect(body.subject).toBe("did:plc:recipient");
        expect(body.amount).toBe(500);
        return jsonRes({
          itemUri: `at://${USER_DID}/${ITEM_COLLECTION}/tipkey1`,
          item: {
            $type: `${ITEM_COLLECTION}#view`,
            uri: `at://${USER_DID}/${ITEM_COLLECTION}/tipkey1`,
            amount: 500,
            currency: "USD",
            status: "pending",
            createdAt: "2024-01-01T00:00:00Z",
          },
        });
      },
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        expect(body.repo).toBe(USER_DID);
        expect(body.collection).toBe(ITEM_COLLECTION);
        expect(body.rkey).toBe("tipkey1");
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
    });

    const agent = buildAgent(fetchHandler);
    const res = await agent.com.atiproto.payment.item.create({
      subject: "did:plc:recipient" as any,
      amount: 500,
      currency: "USD",
    });

    expect(res.data.itemUri).toBe(
      `at://${USER_DID}/${ITEM_COLLECTION}/tipkey1`,
    );
    expect((res.data as any).workflow).toBeUndefined();
    expect(calls).toHaveLength(3); // initial XRPC + 1 PDS create + callback XRPC
  });

  it("multi-round chain: createTip → createCart → final", async () => {
    let xrpcCalls = 0;
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async (req) => {
        const body = await req.json();
        xrpcCalls++;
        if (xrpcCalls === 1) {
          return jsonRes({
            workflow: {
              intent: "createTip",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "item",
                  collection: ITEM_COLLECTION,
                  rkey: "tipkey1",
                  record: { $type: ITEM_COLLECTION },
                },
              ],
            },
          });
        }
        if (xrpcCalls === 2) {
          expect(body.workflow.intent).toBe("createTip");
          return jsonRes({
            workflow: {
              intent: "createCart",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "cart",
                  collection: CART_COLLECTION,
                  rkey: "cartkey1",
                  record: { $type: CART_COLLECTION },
                },
              ],
            },
          });
        }
        // Final
        expect(body.workflow.intent).toBe("createCart");
        return jsonRes({
          itemUri: `at://${USER_DID}/${ITEM_COLLECTION}/tipkey1`,
          cartUri: `at://${USER_DID}/${CART_COLLECTION}/cartkey1`,
          checkoutUrl: "https://stripe.example/checkout/xyz",
        });
      },
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
    });

    const agent = buildAgent(fetchHandler);
    const res = await agent.com.atiproto.payment.item.create({
      subject: "did:plc:recipient" as any,
      amount: 500,
      currency: "USD",
    });

    expect(res.data.checkoutUrl).toBe("https://stripe.example/checkout/xyz");
    expect((res.data as any).workflow).toBeUndefined();
  });

  it("direct result on first call: no workflow → return immediately, no PDS calls", async () => {
    const pdsCalls = vi.fn();
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async () =>
        jsonRes({
          itemUri: `at://${USER_DID}/${ITEM_COLLECTION}/abc`,
          item: {
            $type: `${ITEM_COLLECTION}#view`,
            uri: `at://${USER_DID}/${ITEM_COLLECTION}/abc`,
            amount: 0,
            currency: "USD",
            status: "completed",
            createdAt: "2024-01-01T00:00:00Z",
          },
        }),
      "/xrpc/com.atproto.repo.createRecord": async () => {
        pdsCalls();
        return jsonRes({});
      },
    });

    const agent = buildAgent(fetchHandler);
    const res = await agent.com.atiproto.payment.item.create({
      subject: "did:plc:recipient" as any,
      amount: 0,
      currency: "USD",
    });

    expect(res.data.item).toBeDefined();
    expect(pdsCalls).not.toHaveBeenCalled();
  });

  it("empty actions array exits the loop and strips workflow", async () => {
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async () =>
        jsonRes({
          workflow: { intent: "noop", actions: [] },
          itemUri: `at://${USER_DID}/${ITEM_COLLECTION}/abc`,
        }),
    });

    const agent = buildAgent(fetchHandler);
    const res = await agent.com.atiproto.payment.item.create({
      subject: "did:plc:recipient" as any,
      amount: 0,
      currency: "USD",
    });

    expect(res.data.itemUri).toBeDefined();
    expect((res.data as any).workflow).toBeUndefined();
  });

  it("action failure → error callback → server raise → caller throws WorkflowRaisedError", async () => {
    let xrpcCalls = 0;
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async (req) => {
        xrpcCalls++;
        const body = await req.json();
        if (xrpcCalls === 1) {
          return jsonRes({
            workflow: {
              intent: "createTip",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "item",
                  collection: ITEM_COLLECTION,
                  rkey: "tipkey1",
                  record: { $type: ITEM_COLLECTION },
                },
              ],
            },
          });
        }
        // Callback with error
        expect(body.workflow.intent).toBe("error");
        expect(body.workflow.error.action).toBe("create");
        expect(body.workflow.error.name).toBe("item");
        return jsonRes({
          workflow: {
            intent: "rollback",
            actions: [
              {
                $type: "com.atiproto.actions#raise",
                message: "Tip creation failed: PDS rejected",
                code: "TipCreateFailed",
              },
            ],
          },
        });
      },
      "/xrpc/com.atproto.repo.createRecord": async () =>
        jsonErr("InvalidRecord", "the record was bad", 400),
    });

    const agent = buildAgent(fetchHandler);
    await expect(
      agent.com.atiproto.payment.item.create({
        subject: "did:plc:recipient" as any,
        amount: 500,
        currency: "USD",
      }),
    ).rejects.toMatchObject({
      name: "WorkflowRaisedError",
      message: "Tip creation failed: PDS rejected",
      code: "TipCreateFailed",
    });
  });

  it("compensating delete on failure (rollback path): cleanup runs, then raise throws", async () => {
    let xrpcCalls = 0;
    const pdsActions: Array<{ verb: string; rkey: string }> = [];
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async (req) => {
        xrpcCalls++;
        const body = await req.json();
        if (xrpcCalls === 1) {
          return jsonRes({
            workflow: {
              intent: "createTip",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "first",
                  collection: ITEM_COLLECTION,
                  rkey: "first-rkey",
                  record: { $type: ITEM_COLLECTION },
                },
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "second",
                  collection: ITEM_COLLECTION,
                  rkey: "second-rkey",
                  record: { $type: ITEM_COLLECTION },
                },
              ],
            },
          });
        }
        // Error callback — agent has partial responses [first]
        expect(body.workflow.intent).toBe("error");
        expect(body.workflow.responses).toHaveLength(1);
        expect(body.workflow.responses[0].name).toBe("first");
        return jsonRes({
          workflow: {
            intent: "rollback",
            actions: [
              {
                $type: "com.atiproto.actions#delete",
                repo: USER_DID,
                name: "rollback-first",
                collection: ITEM_COLLECTION,
                rkey: "first-rkey",
              },
              {
                $type: "com.atiproto.actions#raise",
                message: "rolled back",
                code: "RolledBack",
              },
            ],
          },
        });
      },
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        pdsActions.push({ verb: "create", rkey: body.rkey });
        if (body.rkey === "second-rkey") {
          return jsonErr("InvalidRecord", "second one fails", 400);
        }
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
      "/xrpc/com.atproto.repo.deleteRecord": async (req) => {
        const body = await req.json();
        pdsActions.push({ verb: "delete", rkey: body.rkey });
        return jsonRes({});
      },
    });

    const agent = buildAgent(fetchHandler);
    await expect(
      agent.com.atiproto.payment.item.create({
        subject: "did:plc:recipient" as any,
        amount: 500,
        currency: "USD",
      }),
    ).rejects.toBeInstanceOf(WorkflowRaisedError);

    expect(pdsActions).toEqual([
      { verb: "create", rkey: "first-rkey" },
      { verb: "create", rkey: "second-rkey" },
      { verb: "delete", rkey: "first-rkey" },
    ]);
  });

  it("max-steps guard throws when server emits workflow forever", async () => {
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async () =>
        jsonRes({
          workflow: {
            intent: "loop",
            actions: [
              {
                $type: "com.atiproto.actions#create",
                repo: USER_DID,
                name: "n",
                collection: ITEM_COLLECTION,
                rkey: "key",
                record: { $type: ITEM_COLLECTION },
              },
            ],
          },
        }),
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
    });

    const agent = buildAgent(fetchHandler, { maxWorkflowSteps: 2 });
    await expect(
      agent.com.atiproto.payment.item.create({
        subject: "did:plc:recipient" as any,
        amount: 500,
        currency: "USD",
      }),
    ).rejects.toThrow(/Workflow exceeded max steps \(2\)/);
  });

  it("extensibility: shape-driven interpreter handles workflow on a non-orchestrating endpoint", async () => {
    let xrpcCalls = 0;
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.list": async (req) => {
        xrpcCalls++;
        if (xrpcCalls === 1) {
          // feed.tip.list isn't a workflow endpoint today; the agent should
          // still handle a workflow in the response purely on shape.
          // We include `items: []` so the lexicon validator accepts the
          // response — the point of this test is the shape-driven loop, not
          // bypassing validation.
          return jsonRes({
            items: [],
            workflow: {
              intent: "extensibilityProbe",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "thing",
                  collection: ITEM_COLLECTION,
                  rkey: "extkey",
                  record: { $type: ITEM_COLLECTION },
                },
              ],
            },
          });
        }
        return jsonRes({ items: [] });
      },
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
    });

    const agent = buildAgent(fetchHandler);
    const res = await agent.com.atiproto.payment.item.list();
    expect(res.data.items).toEqual([]);
    expect(xrpcCalls).toBe(2);
  });

  it("preserves the atproto-proxy header on every XRPC fetch (initial + callback)", async () => {
    let xrpcCalls = 0;
    const proxyHeaders: string[] = [];
    const { fetchHandler } = scriptedFetch({
      "/xrpc/com.atiproto.payment.item.create": async (req) => {
        xrpcCalls++;
        const proxy = req.headers.get("atproto-proxy");
        if (proxy) proxyHeaders.push(proxy);
        if (xrpcCalls === 1) {
          return jsonRes({
            workflow: {
              intent: "go",
              actions: [
                {
                  $type: "com.atiproto.actions#create",
                  repo: USER_DID,
                  name: "item",
                  collection: ITEM_COLLECTION,
                  rkey: "k",
                  record: { $type: ITEM_COLLECTION },
                },
              ],
            },
          });
        }
        return jsonRes({ itemUri: `at://${USER_DID}/${ITEM_COLLECTION}/k` });
      },
      "/xrpc/com.atproto.repo.createRecord": async (req) => {
        const body = await req.json();
        return jsonRes({
          uri: `at://${body.repo}/${body.collection}/${body.rkey}`,
          cid: FAKE_CID,
        });
      },
    });

    const agent = buildAgent(fetchHandler);
    await agent.com.atiproto.payment.item.create({
      subject: "did:plc:recipient" as any,
      amount: 500,
      currency: "USD",
    });

    expect(proxyHeaders).toHaveLength(2);
    expect(proxyHeaders[0]).toBe("did:web:atiproto.com#payments");
    expect(proxyHeaders[1]).toBe("did:web:atiproto.com#payments");
  });
});
