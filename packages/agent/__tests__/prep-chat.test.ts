import { describe, it, expect, vi } from "vitest";
import { Agent as ApiAgent } from "@atproto/api";
import { Lexicons } from "@atproto/lexicon";
import { XrpcClient } from "@atproto/xrpc";
import { Agent } from "../src/agent.js";
import { ATIPROTO_BSKY_DID, prepChatForReceipts } from "../src/prep-chat.js";

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

describe("prepChatForReceipts", () => {
  it("creates+accepts+confirms when no convo exists yet", async () => {
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
      "/xrpc/chat.bsky.convo.sendMessage": async () =>
        jsonRes({
          $type: "chat.bsky.convo.defs#messageView",
          id: "msg-1",
          rev: "rev2",
          text: "I will receive receipts in this chat",
          sender: { did: USER_DID },
          sentAt: "2024-01-01T00:00:00Z",
        }),
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChatForReceipts(apiAgent, [BOT_DID]);

    expect(calls.map((c) => c.path)).toEqual([
      "/xrpc/chat.bsky.convo.getConvoAvailability",
      "/xrpc/chat.bsky.convo.getConvoForMembers",
      "/xrpc/chat.bsky.convo.acceptConvo",
      "/xrpc/chat.bsky.convo.sendMessage",
    ]);
    expect(calls[2].body).toEqual({ convoId: "convo-123" });
    // The confirmation message makes the convo bidirectionally accepted.
    expect(calls[3].body).toEqual({
      convoId: "convo-123",
      message: { text: "I will receive receipts in this chat" },
    });
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
    await prepChatForReceipts(apiAgent, [BOT_DID]);

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
    await prepChatForReceipts(apiAgent, [BOT_DID]);

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/xrpc/chat.bsky.convo.getConvoAvailability");
  });

  it("no-ops on empty members list", async () => {
    const { fetchHandler, calls } = scriptedFetch({});
    const apiAgent = authedApiAgent(fetchHandler);
    await prepChatForReceipts(apiAgent, []);
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
      if (path.endsWith("sendMessage"))
        return jsonRes({
          $type: "chat.bsky.convo.defs#messageView",
          id: "msg-1",
          rev: "rev2",
          text: "I will receive receipts in this chat",
          sender: { did: USER_DID },
          sentAt: "2024-01-01T00:00:00Z",
        });
      return jsonRes({});
    };
    const { fetchHandler } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": captureProxy,
      "/xrpc/chat.bsky.convo.getConvoForMembers": captureProxy,
      "/xrpc/chat.bsky.convo.acceptConvo": captureProxy,
      "/xrpc/chat.bsky.convo.sendMessage": captureProxy,
    });

    const apiAgent = authedApiAgent(fetchHandler);
    await prepChatForReceipts(apiAgent, [BOT_DID]);

    expect(proxyHeaders).toHaveLength(4);
    expect(
      proxyHeaders.every((h) => h === "did:web:api.bsky.chat#bsky_chat"),
    ).toBe(true);
  });

  it("accepts an @atiproto/agent Agent<ApiAgent> as the client", async () => {
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async () =>
        jsonRes({ canChat: false }),
    });
    const apiAgent = authedApiAgent(fetchHandler);
    const wrapped = new Agent(apiAgent);

    await prepChatForReceipts(wrapped, [ATIPROTO_BSKY_DID]);

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/xrpc/chat.bsky.convo.getConvoAvailability");
  });

  it("accepts a raw XrpcClient as the client (header injection path)", async () => {
    const proxyHeaders: string[] = [];
    const { fetchHandler, calls } = scriptedFetch({
      "/xrpc/chat.bsky.convo.getConvoAvailability": async (req) => {
        const proxy = req.headers.get("atproto-proxy");
        if (proxy) proxyHeaders.push(proxy);
        return jsonRes({ canChat: false });
      },
    });
    const raw = new XrpcClient(fetchHandler, new Lexicons());

    await prepChatForReceipts(raw, [ATIPROTO_BSKY_DID]);

    expect(calls).toHaveLength(1);
    expect(proxyHeaders).toEqual(["did:web:api.bsky.chat#bsky_chat"]);
  });
});
