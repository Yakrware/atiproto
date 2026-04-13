import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeOAuth() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Edge OAuth Client</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        ATProto OAuth on Cloudflare Workers — and why a dedicated package is
        needed.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          What it is
        </AnchorHeading>
        <p className="mb-3 text-text-muted dark:text-text-muted-dark">
          The{" "}
          <a
            href="/docs/edge-oauth-client"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            @atiproto/edge-oauth-client
          </a>{" "}
          package extends{" "}
          <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
            @atproto/oauth-client
          </ExternalLink>{" "}
          to run in Cloudflare Workers. It handles the full ATProto OAuth 2.0
          flow: generating authorization URLs, exchanging codes for sessions,
          refreshing tokens, and making DPoP-authenticated API requests on
          behalf of a user.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Why a separate package
        </AnchorHeading>
        <p className="mb-3 text-text-muted dark:text-text-muted-dark">
          The upstream{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atproto/oauth-client
          </code>{" "}
          is written for Node.js and relies on Node-specific APIs that are not
          available in the Cloudflare Workers runtime:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-muted dark:text-text-muted-dark mb-3">
          <li>
            <strong>Crypto</strong> — uses Node{" "}
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              crypto
            </code>{" "}
            module; Workers only expose WebCrypto (
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              globalThis.crypto
            </code>
            ).
          </li>
          <li>
            <strong>Request cache property</strong> — the client sets{" "}
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              cache: "no-store"
            </code>{" "}
            on fetch requests; Workers throw a{" "}
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              TypeError
            </code>{" "}
            if this property is present.
          </li>
          <li>
            <strong>DID / handle resolution</strong> — the default resolvers use
            Node networking; Workers require standard{" "}
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              fetch
            </code>
            .
          </li>
          <li>
            <strong>Session / state storage</strong> — file and in-process
            stores don't persist across isolate instances; KV-backed stores are
            required.
          </li>
        </ul>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          This package wires up the WebCrypto{" "}
          <a
            href="/docs/edge-oauth-client/EdgeRuntimeImplementation"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeRuntimeImplementation
          </a>
          , the{" "}
          <a
            href="/docs/edge-oauth-client/patchGlobalRequestObject"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            patchGlobalRequestObject
          </a>{" "}
          fix, and edge-compatible resolver defaults so you don't have to.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Getting started
        </AnchorHeading>
        <p className="text-text-muted dark:text-text-muted-dark">
          See the{" "}
          <a
            href="/docs/edge-oauth-client"
            className="text-primary dark:text-primary-dark hover:underline"
          >
            edge-oauth-client package docs
          </a>{" "}
          for installation, Wrangler configuration, and a full example of the
          authorization flow.
        </p>
      </section>
    </div>
  );
}
