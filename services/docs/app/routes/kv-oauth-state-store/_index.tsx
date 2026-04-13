import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function KvOAuthStateStoreIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">kv-oauth-state-store</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Cloudflare KV-backed{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          StateStore
        </code>{" "}
        and{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          SessionStore
        </code>{" "}
        implementations for{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
          @atproto/oauth-client
        </ExternalLink>
        . Handles DPoP key serialization and automatic TTL management.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/kv-oauth-state-store"
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Wrangler Configuration
        </AnchorHeading>
        <p className="mb-3">
          Add two KV namespaces to your{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            wrangler.jsonc
          </code>
          : one for OAuth state (short-lived, used during login) and one for
          sessions (long-lived, used after login):
        </p>
        <CodeBlock
          language="jsonc"
          code={`{
  "kv_namespaces": [
    { "binding": "OAUTH_STATE_KV", "id": "<your-kv-id>" },
    { "binding": "OAUTH_SESSION_KV", "id": "<your-kv-id>" }
  ]
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick Setup
        </AnchorHeading>
        <CodeBlock
          code={`import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";
import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";

interface Env {
  OAUTH_STATE_KV: KVNamespace;
  OAUTH_SESSION_KV: KVNamespace;
}

function createOAuthClient(env: Env) {
  return new EdgeOAuthClient({
    // ...
    stateStore: new KvStateStore(env.OAUTH_STATE_KV),
    sessionStore: new KvSessionStore(env.OAUTH_SESSION_KV),
  });
}`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Classes
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/kv-oauth-state-store/KvStateStore"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              KvStateStore
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Stores transient OAuth state between authorization request and
              callback (default TTL: 10 minutes)
            </span>
          </li>
          <li>
            <a
              href="/docs/kv-oauth-state-store/KvSessionStore"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              KvSessionStore
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Persists authenticated sessions for token refresh and restore
              (default TTL: 7 days)
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
