import { describe, it, expect, vi } from "vitest";
import { Agent as ApiAgent } from "@atproto/api";
import { Agent } from "../src/agent.js";
import { prepChat } from "../src/prep-chat.js";

const USER_DID = "did:plc:user";
const BOT_DID = "did:plc:4x5dcv6u4wlkjcssto7f22nu";

type Route = (req: Request) => Response | Promise<Response>;

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function scriptedFetch(routes: Record<string, Route>) {
  const calls: Array<{
    path: string;
    method: string;
    body?: unknown;
    params?: Record<string, string | string[]>;
  }> = [];
  const fetchHandler = vi.fn(async (url: string, init: RequestInit) => {
    const absolute = new URL(url, "http://localhost");
    // Read body off a cloned Request so we don't consume the stream the
    // route handler will see. init.body can be a string, Uint8Array, or
    // ReadableStream depending on the call site.
    const probe = new Request(absolute.toString(), init);
    let body: unknown;
    try {
      const text = await probe.clone().text();
      if (text) body = JSON.parse(text);
    } catch {
      // not JSON / no body
    }
    // Collect search params; same key may appear multiple times for arrays
    // (e.g. `members=did:plc:a&members=did:plc:b`).
    const params: Record<string, string | string[]> = {};
    for (const [k, v] of absolute.searchParams.entries()) {
      const existing = params[k];
      if (existing === undefined) {
        params[k] = v;
      } else if (Array.isArray(existing)) {
        existing.push(v);
      } else {
        params[k] = [existing, v];
      }
    }
    calls.push({
      path: absolute.pathname,
      method: init.method ?? "GET",
      body,
      params,
    });
    const handler = routes[absolute.pathname];
    if (!handler) return jsonRes({}, 404);
    return handler(new Request(absolute.toString(), init));
  });
  return { fetchHandler, calls };
}

function authedApiAgent(
  fetchHandler: ReturnType<typeof scriptedFetch>["fetchHandler"],
  did = USER_DID,
) {
  const apiAgent = new ApiAgent(fetchHandler);
  Object.defineProperty(apiAgent, "did", { value: did, configurable: true });
  return apiAgent;
}

describe("prepChat — direct helper", () => {
  it("creates+accepts when no convo exists yet", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: true }),
      "/xrpc/chat.bsky.convo.getConvoForMembers": async () =>
        jsonRes({
          convo: {
            $type: "chat.bsky.convo.defs#convoView",
            id: "convo-123",
            rev: "rev1",
            members: [],
            muted: false,
            unreadCount: 0,
            status: "request",
          },
        }),
      "/xrpc/chat.bsky.convo.acceptConvo": async () => jsonRes({}),
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChat(apiAgent, [BOT_DID]);

    expect(calls.map((c) => c.path)).toEqual([
      "/xrpc/chat.bsky.convo.getConvoAvailability",
      "/xrpc/chat.bsky.convo.getConvoForMembers",
      "/xrpc/chat.bsky.convo.acceptConvo",
    ]);
    expect(calls[2].body).toEqual({ convoId: "convo-123" });
  });

  it("skips when convo is already accepted", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({
          canChat: true,
          convo: {
            $type: "chat.bsky.convo.defs#convoView",
            id: "convo-456",
            rev: "rev1",
            members: [],
            muted: false,
            unreadCount: 0,
            status: "accepted",
          },
        }),
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChat(apiAgent, [BOT_DID]);

    expect(calls.map((c) => c.path)).toEqual([
      "/xrpc/chat.bsky.convo.getConvoAvailability",
    ]);
  });

  it("skips when canChat is false (user disabled chat or not chat-capable)", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: false }),
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChat(apiAgent, [BOT_DID]);

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/xrpc/chat.bsky.convo.getConvoAvailability");
  });

  it("no-ops on empty members list", async () => {
    const { fetchHandler, calls } = scriptedFetch({});
    const apiAgent = authedApiAgent(fetchHandler);
    await prepChat(apiAgent, []);
    expect(calls).toHaveLength(0);
  });

  it("uses the bsky_chat proxy header on every call", async () => {
    const proxyHeaders: string[] = [];
    const captureProxy: Route = async (req) => {
      const proxy = req.headers.get("atproto-proxy");
      if (proxy) proxyHeaders.push(proxy);
      const path = new URL(req.url).pathname;
      if (path.endsWith("getConvoAvailability"))
        return jsonRes({ canChat: true });
      if (path.endsWith("getConvoForMembers"))
        return jsonRes({
          convo: {
            $type: "chat.bsky.convo.defs#convoView",
            id: "c1",
            rev: "r",
            members: [],
            muted: false,
            unreadCount: 0,
          },
        });
      return jsonRes({});
    };
    const { fetchHandler } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": captureProxy,
      "/xrpc/chat.bsky.convo.getConvoForMembers": captureProxy,
      "/xrpc/chat.bsky.convo.acceptConvo": captureProxy,
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChat(apiAgent, [BOT_DID]);

    expect(proxyHeaders).toHaveLength(3);
    expect(
      proxyHeaders.every((h) => h === "did:web:api.bsky.chat#bsky_chat"),
    ).toBe(true);
  });
});

describe("Agent constructor — prepChat option", () => {
  // Helper: capture whether any chat.bsky route was hit. We give construction
  // a microtask to fire its unawaited promise.
  async function flushMicrotasks() {
    await new Promise((r) => setTimeout(r, 10));
  }

  it("fires by default with the atiproto bsky bot DID", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: false }),
    });
    const apiAgent = authedApiAgent(fetchHandler);
    new Agent(apiAgent);
    await flushMicrotasks();

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/xrpc/chat.bsky.convo.getConvoAvailability");
    expect(calls[0].params?.members).toBe(BOT_DID);
  });

  it("skips entirely when prepChat: false", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: true }),
    });
    const apiAgent = authedApiAgent(fetchHandler);
    new Agent(apiAgent, { prepChat: false });
    await flushMicrotasks();

    expect(calls).toHaveLength(0);
  });

  it("uses a custom DID when prepChat is a string", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: false }),
    });
    const apiAgent = authedApiAgent(fetchHandler);
    new Agent(apiAgent, { prepChat: "did:plc:custom-bot" });
    await flushMicrotasks();

    expect(calls).toHaveLength(1);
    expect(calls[0].params?.members).toBe("did:plc:custom-bot");
  });

  it("accepts an array of DIDs", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: false }),
    });
    const apiAgent = authedApiAgent(fetchHandler);
    new Agent(apiAgent, {
      prepChat: ["did:plc:bot-a", "did:plc:bot-b"],
    });
    await flushMicrotasks();

    expect(calls[0].params?.members).toEqual([
      "did:plc:bot-a",
      "did:plc:bot-b",
    ]);
  });

  it("does not throw when prep fails (e.g. network error)", async () => {
    const fetchHandler = vi.fn(async () => {
      throw new Error("network exploded");
    });
    const apiAgent = authedApiAgent(fetchHandler);
    expect(() => new Agent(apiAgent)).not.toThrow();
    await flushMicrotasks();
    // No assertion on call count — fetch might or might not have been
    // dispatched depending on internal scheduling. The assertion is just
    // that construction doesn't surface the failure.
  });
});
