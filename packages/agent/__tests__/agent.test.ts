import { describe, it, expect, vi, beforeEach } from "vitest";
import { Agent as ApiAgent } from "@atproto/api";
import { Lexicons } from "@atproto/lexicon";
import { XrpcClient } from "@atproto/xrpc";
import { Agent } from "../src/agent.js";

function createMockClient() {
  const fetchHandler = vi
    .fn<(url: string, init: RequestInit) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  return new XrpcClient(fetchHandler, new Lexicons());
}

function createMockApiAgent() {
  const fetchHandler = vi
    .fn<(url: string, init: RequestInit) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  return new ApiAgent(fetchHandler);
}

describe("Agent", () => {
  describe("construction", () => {
    it("creates a full namespace hierarchy", () => {
      const agent = new Agent(createMockClient());

      expect(agent.com).toBeDefined();
      expect(agent.com.atiproto).toBeDefined();

      expect(agent.com.atiproto.recipient).toBeDefined();
      expect(agent.com.atiproto.payment.cart).toBeDefined();
      expect(agent.com.atiproto.recipient.profile).toBeDefined();
      expect(agent.com.atiproto.recipient.payment.subscription).toBeDefined();
      expect(agent.com.atiproto.recipient.payment.item).toBeDefined();

      expect(agent.com.atiproto.payment).toBeDefined();
      expect(agent.com.atiproto.payment.subscription).toBeDefined();
      expect(agent.com.atiproto.payment.item).toBeDefined();

      expect(agent.com.atiproto.repo).toBeDefined();
      expect(agent.com.atiproto.repo.profile).toBeDefined();
      expect(agent.com.atiproto.repo.subscription).toBeDefined();
      expect(agent.com.atiproto.repo.item).toBeDefined();
    });

    it("is an instance of XrpcClient", () => {
      const agent = new Agent(createMockClient());
      expect(agent).toBeInstanceOf(XrpcClient);
    });
  });

  describe("proxy header injection (plain XrpcClient)", () => {
    it("injects atproto-proxy header via fetchHandler", async () => {
      const client = createMockClient();
      const agent = new Agent(client);

      await agent.fetchHandler("/xrpc/com.atiproto.payment.item.list", {
        method: "GET",
        headers: new Headers(),
      });

      expect(client.fetchHandler).toHaveBeenCalledOnce();
      const init = (client.fetchHandler as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as RequestInit;
      const headers = new Headers(init.headers);
      expect(headers.get("atproto-proxy")).toBe(
        "did:web:atiproto.com#payments",
      );
    });

    it("does not overwrite an existing atproto-proxy header", async () => {
      const client = createMockClient();
      const agent = new Agent(client);

      await agent.fetchHandler("/xrpc/com.atiproto.payment.item.list", {
        method: "GET",
        headers: new Headers({ "atproto-proxy": "custom#value" }),
      });

      const init = (client.fetchHandler as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as RequestInit;
      const headers = new Headers(init.headers);
      expect(headers.get("atproto-proxy")).toBe("custom#value");
    });
  });

  describe("withProxy support (ApiAgent)", () => {
    it("uses withProxy when client is an ApiAgent", () => {
      const atpAgent = createMockApiAgent();
      const withProxySpy = vi.spyOn(atpAgent, "withProxy");

      new Agent(atpAgent);

      expect(withProxySpy).toHaveBeenCalledWith(
        "payments",
        "did:web:atiproto.com",
      );
    });

    it("delegates to the proxied agent fetchHandler", async () => {
      const atpAgent = createMockApiAgent();
      const proxied = atpAgent.withProxy("payments", "did:web:atiproto.com");
      const proxiedFetchSpy = vi.spyOn(proxied, "fetchHandler");

      vi.spyOn(atpAgent, "withProxy").mockReturnValue(proxied);

      const agent = new Agent(atpAgent);

      await agent.fetchHandler("/xrpc/test", {
        method: "GET",
        headers: new Headers(),
      });

      expect(proxiedFetchSpy).toHaveBeenCalledOnce();
    });

    it("falls back to header injection for plain XrpcClient", async () => {
      const client = createMockClient();
      const agent = new Agent(client);

      await agent.fetchHandler("/xrpc/com.atiproto.payment.item.list", {
        method: "GET",
        headers: new Headers(),
      });

      const init = (client.fetchHandler as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as RequestInit;
      const headers = new Headers(init.headers);
      expect(headers.get("atproto-proxy")).toBe(
        "did:web:atiproto.com#payments",
      );
    });
  });

  describe("JS Proxy delegation", () => {
    it("delegates unknown properties to the underlying client", () => {
      const client = createMockClient();
      (client as any).customProp = "test-value";

      const agent = new Agent(client);
      expect((agent as any).customProp).toBe("test-value");
    });

    it("prefers own properties over delegated ones", () => {
      const client = createMockClient();
      (client as any).com = "should-not-see-this";

      const agent = new Agent(client);
      expect(agent.com).not.toBe("should-not-see-this");
      expect(agent.com).toBeDefined();
      expect(agent.com.atiproto).toBeDefined();
    });
  });

  describe("nested com proxy delegation", () => {
    it("delegates com.atproto to the underlying client", () => {
      const atpAgent = createMockApiAgent();
      const agent = new Agent(atpAgent);

      // com.atproto should fall through to the ApiAgent's com.atproto
      expect(agent.com.atproto).toBeDefined();
      expect(agent.com.atproto.repo).toBeDefined();
      expect(agent.com.atproto.server).toBeDefined();
    });

    it("preserves our atiproto namespace on com", () => {
      const atpAgent = createMockApiAgent();
      const agent = new Agent(atpAgent);

      expect(agent.com.atiproto).toBeDefined();
      expect(agent.com.atiproto.payment).toBeDefined();
      expect(agent.com.atiproto.recipient).toBeDefined();
    });

    it("prefers our com properties over the client's", () => {
      const atpAgent = createMockApiAgent();
      const agent = new Agent(atpAgent);

      // atiproto._client should be our agent, not the ApiAgent
      expect(agent.com.atiproto._client).not.toBe(atpAgent);
      expect(agent.com.atiproto._client).toBeInstanceOf(XrpcClient);
    });
  });

  describe("namespace method calls", () => {
    let agent: Agent<XrpcClient>;

    beforeEach(() => {
      const client = createMockClient();
      agent = new Agent(client);
      vi.spyOn(agent, "call" as any).mockResolvedValue({
        success: true,
        data: {},
        headers: {},
      });
    });

    it("calls com.atiproto.payment.item.create with correct NSID and data", async () => {
      const data = {
        subject: {
          $type: "com.atiproto.item#userRef" as const,
          did: "did:plc:test" as const,
        },
        amount: 500,
        currency: "USD",
      };

      await agent.com.atiproto.payment.item.create(data);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.payment.item.create",
        undefined,
        data,
        undefined,
      );
    });

    it("calls com.atiproto.payment.item.get with correct NSID and params", async () => {
      const params = {
        uri: "at://did:plc:test/com.atiproto.item/abc" as const,
      };

      await agent.com.atiproto.payment.item.get(params);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.payment.item.get",
        params,
        undefined,
        undefined,
      );
    });

    it("calls com.atiproto.payment.cart.checkout with correct NSID", async () => {
      const data = {
        cart: "at://did:plc:test/com.atiproto.cart/xyz" as const,
      };

      await agent.com.atiproto.payment.cart.checkout(data);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.payment.cart.checkout",
        undefined,
        data,
        undefined,
      );
    });

    it("calls com.atiproto.repo.subscription.count with correct NSID and params", async () => {
      const params = {
        record: "at://did:plc:subject" as const,
      };

      await agent.com.atiproto.repo.subscription.count(params);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.repo.subscription.count",
        params,
        undefined,
        undefined,
      );
    });

    it("calls com.atiproto.payment.subscription.cancel with correct NSID", async () => {
      const data = {
        subscriptionUri:
          "at://did:plc:test/com.atiproto.subscription/abc" as const,
      };

      await agent.com.atiproto.payment.subscription.cancel(data);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.payment.subscription.cancel",
        undefined,
        data,
        undefined,
      );
    });

    it("calls com.atiproto.recipient.payment.item.list with correct NSID and params", async () => {
      const params = {
        limit: 50,
      };

      await agent.com.atiproto.recipient.payment.item.list(params);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.recipient.payment.item.list",
        params,
        undefined,
        undefined,
      );
    });

    it("calls com.atiproto.repo.item.count with correct NSID and params", async () => {
      const params = {
        record: "at://did:plc:recipient" as const,
      };

      await agent.com.atiproto.repo.item.count(params);

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.repo.item.count",
        params,
        undefined,
        undefined,
      );
    });

    it("calls com.atiproto.recipient.profile.get with no params", async () => {
      await agent.com.atiproto.recipient.profile.get();

      expect(agent.call).toHaveBeenCalledWith(
        "com.atiproto.recipient.profile.get",
        undefined,
        undefined,
        undefined,
      );
    });
  });
});
