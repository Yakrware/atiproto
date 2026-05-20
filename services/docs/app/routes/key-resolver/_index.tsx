import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function KeyResolverIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">key-resolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Ready-made{" "}
        <a
          href="/docs/atproto-attestation/resolvers"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          KeyResolver
        </a>{" "}
        implementations for{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atiproto/atproto-attestation
        </code>
        . Pick the one that matches your runtime: bare did:key parsing, live
        DID-document fetch, or a cached fetch suitable for the edge.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock language="bash" code="npm install @atiproto/key-resolver" />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Pick a resolver
        </AnchorHeading>
        <ul className="space-y-3 text-sm">
          <li>
            <a
              href="/docs/key-resolver/DidKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              DidKeyResolver
            </a>{" "}
            — local-only parser for <code className="font-mono">did:key:</code>{" "}
            references. Same behavior as the verifier's built-in default,
            exposed as a class so you can compose it explicitly.
          </li>
          <li>
            <a
              href="/docs/key-resolver/FetchKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              FetchKeyResolver
            </a>{" "}
            — fetches DID documents from the PLC directory or did:web hosts
            using <code className="font-mono">fetch</code>, then extracts the
            key from the named verification method. Pure network, no cache.
          </li>
          <li>
            <a
              href="/docs/key-resolver/EdgeKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeKeyResolver
            </a>{" "}
            — same as <code className="font-mono">FetchKeyResolver</code> with a{" "}
            <code className="font-mono">SimpleStore</code> cache in front of the
            DID document fetch. Defaults to in-memory; pair with{" "}
            <a
              href="/docs/edge-resolver-cache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              @atiproto/edge-resolver-cache
            </a>{" "}
            for cross-request caching on Cloudflare Workers.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick start
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { EdgeKeyResolver } from "@atiproto/key-resolver";
import { createDidCache } from "@atiproto/edge-resolver-cache";

const keys = new EdgeKeyResolver({
  plcUrl: "https://plc.directory",
  cache: createDidCache(),
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  keyResolver: keys.resolve,
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
              href="/docs/record-resolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              record-resolver
            </a>{" "}
            — companion package for remote (proof-record) attestations.
          </li>
        </ul>
      </section>
    </div>
  );
}
