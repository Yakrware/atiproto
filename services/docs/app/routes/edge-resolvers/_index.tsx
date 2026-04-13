import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeResolversIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">edge-resolvers</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Edge-compatible DID and handle resolvers for Cloudflare Workers. Extends{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/identity#readme">
          @atproto/identity
        </ExternalLink>{" "}
        resolvers to work with the standard{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          fetch
        </code>{" "}
        API instead of Node.js-specific networking.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/edge-resolvers"
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          These resolvers are used as defaults inside{" "}
          <a
            href="/docs/edge-oauth-client"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            @atiproto/edge-oauth-client
          </a>
          . Install this package directly only if you need to customize resolver
          behavior or use them independently.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick Setup
        </AnchorHeading>
        <p className="mb-3">
          Override the default resolvers in{" "}
          <a
            href="/docs/edge-oauth-client/EdgeOAuthClient"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeOAuthClient
          </a>{" "}
          to customise timeouts, PLC directory URL, or the XRPC service:
        </p>
        <CodeBlock
          code={`import { EdgeDidResolver, EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";
import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";

const client = new EdgeOAuthClient({
  // ...
  didResolver: new EdgeDidResolver({
    plcUrl: "https://plc.directory",
    timeout: 5000,
  }).asOAuthResolver(),
  handleResolver: new EdgeXrpcHandleResolver(
    "https://public.api.bsky.app"
  ),
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Standalone Usage
        </AnchorHeading>
        <p className="mb-3">
          Resolve DIDs and handles directly without an OAuth client:
        </p>
        <CodeBlock
          code={`import { EdgeDidResolver, EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";

const didResolver = new EdgeDidResolver();
const doc = await didResolver.resolve("did:plc:abc123");

const handleResolver = new EdgeXrpcHandleResolver();
const did = await handleResolver.resolve("alice.bsky.social");`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Classes
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Resolves did:plc and did:web documents over fetch
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidPlcResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidPlcResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Resolves did:plc: identifiers against the PLC directory
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidWebResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidWebResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Resolves did:web: identifiers via /.well-known/did.json
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeXrpcHandleResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeXrpcHandleResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Resolves ATProto handles to DIDs via XRPC
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/timed"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              timed
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Wraps an async function with an AbortSignal timeout
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/resolveHandles"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              resolveHandles
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Batch-resolves DIDs to handles with fault tolerance
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
