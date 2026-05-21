import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function GetStarted() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Get Started</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Set up the a
        <span className="text-primary dark:text-primary-dark">TIP</span>roto
        agent to integrate payments and subscriptions into your ATProto
        application.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <p className="mb-3">Install the agent and lexicons packages:</p>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/agent @atiproto/lexicons"
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Create an Authenticated Agent
        </AnchorHeading>
        <p className="mb-3">
          The{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            Agent
          </code>{" "}
          from{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atiproto/agent
          </code>{" "}
          wraps any{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            XrpcClient
          </code>{" "}
          and proxies requests to the atiproto tipping service. It automatically
          injects the{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            atproto-proxy
          </code>{" "}
          header so requests are routed through your PDS to our service.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          With @atproto/api Agent
        </AnchorHeading>
        <p className="mb-3">
          If you're using the official{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atproto/api
          </code>{" "}
          package, restore an OAuth session and pass the agent directly:
        </p>
        <CodeBlock
          code={`import { Agent as BskyAgent } from "@atproto/api";
import { Agent as TipAgent } from "@atiproto/agent";
// See: https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme
import { OAuthClient } from "@atproto/oauth-client";

const oauthClient = new OAuthClient({
  // ...
});

// Restore an authenticated session
const oauthSession = await oauthClient.restore("did:plc:123");
const bskyAgent = new BskyAgent(oauthSession);

// Create a TipAgent — automatically uses withProxy()
const paymentAgent = new TipAgent(bskyAgent);

// Now you can call tipping APIs
const profile = await paymentAgent.com.atiproto.recipient.profile.get();`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          With Any XrpcClient
        </AnchorHeading>
        <p className="mb-3">
          You can use any{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            XrpcClient
          </code>{" "}
          instance. The TipAgent will wrap it and add the proxy header for
          routing:
        </p>
        <CodeBlock
          code={`import { XrpcClient } from "@atproto/xrpc";
import { Agent as TipAgent } from "@atiproto/agent";

// Create any XrpcClient with your PDS
const client = new XrpcClient("https://your-pds.example.com", mySchemas);

// Wrap it with the TipAgent
const paymentAgent = new TipAgent(client);`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          How It Works
        </AnchorHeading>
        <p className="mb-3">
          When you create a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            TipAgent
          </code>
          , it sets up a proxy to{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            did:web:atiproto.com#tips_service
          </code>
          . Your PDS receives the request, sees the proxy header, and forwards
          it to our service for processing.
        </p>
        <p className="mb-3">
          The agent also provides full TypeScript types for all API methods,
          generated from the ATProto lexicon definitions. Every call is
          type-checked at compile time.
        </p>
        <CodeBlock
          code={`// All methods are fully typed
const { data } = await paymentAgent.com.atiproto.payment.item.create({
  subject: "did:plc:recipient123",
  amount: 500,       // 500 cents = $5.00
  currency: "USD",
});

// data.tipUri, data.cartUri, data.checkoutUrl are all typed
console.log(data.checkoutUrl);`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Next Steps
        </AnchorHeading>
        <ul className="list-disc pl-6 space-y-2 text-text-muted dark:text-text-muted-dark">
          <li>
            Learn about the{" "}
            <a
              href="/docs/checkout"
              className="text-primary dark:text-primary-dark hover:underline"
            >
              checkout flow
            </a>{" "}
            for creating carts, payments, and subscriptions
          </li>
          <li>
            Set up{" "}
            <a
              href="/docs/broker-onboarding"
              className="text-primary dark:text-primary-dark hover:underline"
            >
              Broker Onboarding
            </a>{" "}
            so users can receive payments
          </li>
          <li>
            Browse the{" "}
            <a
              href="/docs/lexicon"
              className="text-primary dark:text-primary-dark hover:underline"
            >
              lexicon reference
            </a>{" "}
            for the complete API
          </li>
          <li>
            Deploy on the edge with the{" "}
            <a
              href="/docs/edge-oauth"
              className="text-primary dark:text-primary-dark hover:underline"
            >
              Edge OAuth Client
            </a>{" "}
            for Cloudflare Workers
          </li>
        </ul>
      </section>
    </div>
  );
}
