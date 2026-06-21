import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function AgentIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">agent</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        XRPC agent for atiproto endpoints. Wraps{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atproto/api
        </code>
        , transparently runs the workflow protocol on every call
        (record writes get executed against the user&apos;s PDS as the
        server emits them), and exposes utility methods like{" "}
        <a
          href="/docs/agent/appendBroker"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          com.appendBroker
        </a>{" "}
        for tasks that don&apos;t fit a single XRPC call.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock language="bash" code="npm install @atiproto/agent" />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Construction
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Construct from a SessionManager, FetchHandler, or another
          XrpcClient. The agent proxies through to the underlying
          client for everything it doesn&apos;t handle itself.
        </p>
        <CodeBlock
          code={`import { Agent } from "@atiproto/agent";
import { AtpAgent } from "@atproto/api";

const upstream = new AtpAgent({ service: "https://pds.example" });
await upstream.login({ identifier: "alice.example", password });

const agent = new Agent(upstream);

// Now agent.com.atiproto.* hits the PoS via the atproto-proxy header,
// and the workflow interpreter handles record writes against the PDS.`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Attestation
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Pass an{" "}
          <a
            href="/docs/atproto-attestation/Attestation"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            Attestation
          </a>{" "}
          (or options for one) to sign records that the workflow
          interpreter writes to the PDS. The fields included in the
          canonical signing payload come from{" "}
          <code className="font-mono text-sm">
            signature_scope_collections
          </code>{" "}
          for each known collection.
        </p>
        <CodeBlock
          code={`const agent = new Agent(upstream, {
  attestation: {
    privateKey: process.env.APPVIEW_KEY!,
    role: "appview",
    issuer: "did:web:appview.example",
  },
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Utility methods
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/agent/appendBroker"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              com.appendBroker
            </a>
            : add or promote a broker on the authenticated user&apos;s
            DID document via the standard PLC signing flow.
          </li>
        </ul>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/atproto-attestation"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              atproto-attestation
            </a>
            : sign and verify records.
          </li>
          <li>
            <a
              href="/docs/checkout"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              Checkout Flow
            </a>
            : end-to-end purchase example built on the agent.
          </li>
        </ul>
      </section>
    </div>
  );
}
