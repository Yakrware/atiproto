import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeOAuthClientIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">edge-oauth-client</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        An edge-compatible ATProto OAuth client for Cloudflare Workers. Extends{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
          @atproto/oauth-client
        </ExternalLink>{" "}
        with WebCrypto-based cryptography, edge-friendly DID and handle
        resolution, and Cloudflare Workers compatibility patches.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/edge-oauth-client @atiproto/kv-oauth-state-store"
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          You will also need{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atproto/oauth-client
          </code>{" "}
          as a peer dependency.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick Setup
        </AnchorHeading>
        <p className="mb-3">
          Call{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            patchGlobalRequestObject()
          </code>{" "}
          once at the top of your Worker entrypoint, then create an{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            EdgeOAuthClient
          </code>{" "}
          with your KV-backed state and session stores:
        </p>
        <CodeBlock
          code={`import { EdgeOAuthClient, patchGlobalRequestObject } from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";

// Required once — strips unsupported Request.cache property for Workers
patchGlobalRequestObject();

interface Env {
  OAUTH_STATE_KV: KVNamespace;
  OAUTH_SESSION_KV: KVNamespace;
}

function createOAuthClient(env: Env) {
  return new EdgeOAuthClient({
    clientMetadata: {
      client_id: "https://your-app.example.com/oauth/client-metadata.json",
      client_name: "My App",
      client_uri: "https://your-app.example.com",
      redirect_uris: ["https://your-app.example.com/oauth/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "atproto transition:generic",
      token_endpoint_auth_method: "none",
      application_type: "web",
      dpop_bound_access_tokens: true,
    },
    stateStore: new KvStateStore(env.OAUTH_STATE_KV),
    sessionStore: new KvSessionStore(env.OAUTH_SESSION_KV),
  });
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Authorization Flow
        </AnchorHeading>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Start login
        </AnchorHeading>
        <CodeBlock
          code={`async function handleLogin(request: Request, env: Env) {
  const client = createOAuthClient(env);
  const handle = new URL(request.url).searchParams.get("handle");
  const url = await client.authorize(handle, {
    scope: "atproto transition:generic",
  });
  return Response.redirect(url.toString());
}`}
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Handle callback
        </AnchorHeading>
        <CodeBlock
          code={`async function handleCallback(request: Request, env: Env) {
  const client = createOAuthClient(env);
  const { session } = await client.callback(
    new URL(request.url).searchParams
  );
  // Store session.did in a cookie or session store
  return new Response(JSON.stringify({ did: session.did }));
}`}
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Restore a session
        </AnchorHeading>
        <CodeBlock
          code={`async function handleApiRequest(request: Request, env: Env) {
  const client = createOAuthClient(env);
  const session = await client.restore("did:plc:user123");
  // session.fetchHandler is an authenticated fetch
  return session.fetchHandler(
    "https://bsky.social/xrpc/app.bsky.actor.getProfile",
    { method: "GET" }
  );
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related Packages
        </AnchorHeading>
        <ul className="space-y-2 text-sm text-text-muted dark:text-text-muted-dark">
          <li>
            <a
              href="/docs/kv-oauth-state-store"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              @atiproto/kv-oauth-state-store
            </a>{" "}
            — Cloudflare KV-backed{" "}
            <code className="px-1 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
              stateStore
            </code>{" "}
            and{" "}
            <code className="px-1 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
              sessionStore
            </code>{" "}
            implementations
          </li>
          <li>
            <a
              href="/docs/edge-resolvers"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              @atiproto/edge-resolvers
            </a>{" "}
            — Edge-compatible DID and handle resolvers (used as defaults
            internally; override via constructor options)
          </li>
          <li>
            <a
              href="/docs/edge-resolver-cache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              @atiproto/edge-resolver-cache
            </a>{" "}
            — Tiered Cache API + in-memory resolver caching
          </li>
        </ul>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Classes
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/edge-oauth-client/EdgeOAuthClient"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeOAuthClient
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Main OAuth client; constructor options and defaults
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-oauth-client/EdgeRuntimeImplementation"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeRuntimeImplementation
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — WebCrypto-based RuntimeImplementation for edge runtimes
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-oauth-client/patchGlobalRequestObject"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              patchGlobalRequestObject
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Patches globalThis.Request to strip unsupported cache property
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
