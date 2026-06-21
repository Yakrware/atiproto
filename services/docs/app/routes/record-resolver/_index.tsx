import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function RecordResolverIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">record-resolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Factory functions that return{" "}
        <a
          href="/docs/atproto-attestation/resolvers"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          RecordResolver
        </a>{" "}
        implementations for verifying remote (strongRef) attestations. Each
        factory returns a function with the canonical RecordResolver signature,
        ready to drop into{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          verify
        </code>
        .
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
              href="/docs/record-resolver/createFetchRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchRecordResolver
            </a>
            : calls{" "}
            <code className="font-mono">com.atproto.repo.getRecord</code> on a
            configurable relay using <code className="font-mono">fetch</code>.
            Works anywhere HTTPS works. No auth needed for public proof records.
          </li>
          <li>
            <a
              href="/docs/record-resolver/createAgentRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createAgentRecordResolver
            </a>
            : routes the call through any XRPC-shaped client (
            <code className="font-mono">@atiproto/agent</code>,{" "}
            <code className="font-mono">@atproto/api</code>,{" "}
            <code className="font-mono">@atproto/xrpc</code>). Use this when
            auth, retries, or proxying live on the client already.
          </li>
          <li>
            <a
              href="/docs/record-resolver/createCachedRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createCachedRecordResolver
            </a>
            : same as{" "}
            <code className="font-mono">createFetchRecordResolver</code> with a{" "}
            <code className="font-mono">SimpleStore</code> cache. Proof records
            are content-addressed, so caching by URI is safe forever.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick start
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedRecordResolver } from "@atiproto/record-resolver";

const recordResolver = createCachedRecordResolver({
  relay: "https://bsky.network",
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  recordResolver,
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
            </a>
            : the underlying resolver interfaces.
          </li>
          <li>
            <a
              href="/docs/key-resolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              key-resolver
            </a>
            : companion package for inline attestations.
          </li>
        </ul>
      </section>
    </div>
  );
}
