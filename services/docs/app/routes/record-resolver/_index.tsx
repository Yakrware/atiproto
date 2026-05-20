import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function RecordResolverIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">record-resolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Ready-made{" "}
        <a
          href="/docs/atproto-attestation/resolvers"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          RecordResolver
        </a>{" "}
        implementations for verifying remote (strongRef) attestations. Pick the
        variant that matches your runtime: bare relay fetch, agent-backed XRPC,
        or a cached fetch for the edge.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/record-resolver"
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Pick a resolver
        </AnchorHeading>
        <ul className="space-y-3 text-sm">
          <li>
            <a
              href="/docs/record-resolver/FetchRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              FetchRecordResolver
            </a>{" "}
            — calls{" "}
            <code className="font-mono">com.atproto.repo.getRecord</code> on a
            configurable relay using <code className="font-mono">fetch</code>.
            Works anywhere HTTPS works; no auth needed for public proof records.
          </li>
          <li>
            <a
              href="/docs/record-resolver/AgentRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              AgentRecordResolver
            </a>{" "}
            — routes the call through any XRPC-shaped client (
            <code className="font-mono">@atiproto/agent</code>,{" "}
            <code className="font-mono">@atproto/api</code>,{" "}
            <code className="font-mono">@atproto/xrpc</code>). Use this when
            auth, retries, or proxying live on the client already.
          </li>
          <li>
            <a
              href="/docs/record-resolver/EdgeRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeRecordResolver
            </a>{" "}
            — same as <code className="font-mono">FetchRecordResolver</code>{" "}
            with a <code className="font-mono">SimpleStore</code> cache. Proof
            records are content-addressed, so caching by URI is safe forever.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick start
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { EdgeRecordResolver } from "@atiproto/record-resolver";

const records = new EdgeRecordResolver({
  relay: "https://bsky.network",
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  recordResolver: records.resolve,
});`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          See also
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/atproto-attestation/resolvers"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              KeyResolver &amp; RecordResolver
            </a>{" "}
            — the underlying resolver interfaces.
          </li>
          <li>
            <a
              href="/docs/key-resolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              key-resolver
            </a>{" "}
            — companion package for inline attestations.
          </li>
        </ul>
      </section>
    </div>
  );
}
