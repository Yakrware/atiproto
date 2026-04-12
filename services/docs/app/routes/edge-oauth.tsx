import { CodeBlock } from "~/components/CodeBlock";

export default function EdgeOAuth() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Edge OAuth Client</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Authenticate ATProto users with OAuth on Cloudflare Workers using the
        edge-compatible OAuth client, resolvers, and KV-backed state stores.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Packages</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border dark:border-border-dark">
            <a
              href="https://www.npmjs.com/package/@atiproto/edge-oauth-client"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm font-semibold"
            >
              @atiproto/edge-oauth-client
            </a>
            <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
              Edge-compatible ATProto OAuth client for Cloudflare Workers
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border dark:border-border-dark">
            <a
              href="https://www.npmjs.com/package/@atiproto/edge-resolvers"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm font-semibold"
            >
              @atiproto/edge-resolvers
            </a>
            <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
              Edge-compatible DID and handle resolvers using fetch (no Node.js
              APIs)
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border dark:border-border-dark">
            <a
              href="https://www.npmjs.com/package/@atiproto/kv-oauth-state-store"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm font-semibold"
            >
              @atiproto/kv-oauth-state-store
            </a>
            <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
              Cloudflare KV-backed state and session stores for OAuth
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Installation</h2>
        <CodeBlock
          language="bash"
          code={`npm install @atiproto/edge-oauth-client @atiproto/kv-oauth-state-store @atproto/oauth-client`}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Wrangler Configuration</h2>
        <p className="mb-3">
          Add KV namespaces for OAuth state and session storage in your{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            wrangler.jsonc
          </code>
          :
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
        <h2 className="text-xl font-semibold mb-4">Create the OAuth Client</h2>
        <p className="mb-3">
          Set up the client in your Worker. The{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            EdgeOAuthClient
          </code>{" "}
          provides edge-compatible defaults for DID resolution, handle
          resolution, and cryptographic operations.
        </p>
        <CodeBlock
          code={`import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";
import { patchGlobalRequestObject } from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";

// Call once at the top of your worker entrypoint
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
        <h2 className="text-xl font-semibold mb-4">Authorization Flow</h2>

        <h3 className="text-lg font-medium mt-6 mb-3">Start the login</h3>
        <p className="mb-3">
          Redirect the user to authorize with their ATProto identity provider:
        </p>
        <CodeBlock
          code={`// In your login route handler
async function handleLogin(request: Request, env: Env) {
  const client = createOAuthClient(env);
  const handle = new URL(request.url).searchParams.get("handle");

  const url = await client.authorize(handle, {
    scope: "atproto transition:generic",
  });

  return Response.redirect(url.toString());
}`}
        />

        <h3 className="text-lg font-medium mt-6 mb-3">Handle the callback</h3>
        <p className="mb-3">Exchange the authorization code for a session:</p>
        <CodeBlock
          code={`// In your OAuth callback route handler
async function handleCallback(request: Request, env: Env) {
  const client = createOAuthClient(env);
  const params = new URL(request.url).searchParams;

  const { session } = await client.callback(params);

  // session.did contains the authenticated user's DID
  // session.sub contains the user's DID
  // Store the session ID in a cookie or your own session store
  return new Response(JSON.stringify({ did: session.did }), {
    headers: { "Content-Type": "application/json" },
  });
}`}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Restoring Sessions</h2>
        <p className="mb-3">
          Restore a previously authenticated session to make API calls:
        </p>
        <CodeBlock
          code={`async function handleApiRequest(request: Request, env: Env) {
  const client = createOAuthClient(env);

  // Restore session from the stored DID
  const oauthSession = await client.restore("did:plc:user123");

  // Use the session's fetch to make authenticated requests
  const response = await oauthSession.fetchHandler(
    "https://bsky.social/xrpc/app.bsky.actor.getProfile",
    { method: "GET" }
  );

  return response;
}`}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Custom Resolvers</h2>
        <p className="mb-3">
          The default resolvers use{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            plc.directory
          </code>{" "}
          for DID resolution and{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            public.api.bsky.app
          </code>{" "}
          for handle resolution. You can customize these:
        </p>
        <CodeBlock
          code={`import { EdgeDidResolver, EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";

const client = new EdgeOAuthClient({
  // ...other options
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
        <h2 className="text-xl font-semibold mb-4">Resolver Caching</h2>
        <p className="mb-3">
          By default, the OAuth client uses in-memory caches for DID and handle
          resolution that reset when the Worker isolate recycles. For better
          cache durability, use{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atiproto/edge-resolver-cache
          </code>{" "}
          which adds a Cloudflare Cache API tier that survives isolate restarts:
        </p>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/edge-resolver-cache"
        />
        <div className="mt-3">
          <CodeBlock
            code={`import { createDidCache, createHandleCache } from "@atiproto/edge-resolver-cache";

const client = new EdgeOAuthClient({
  // ...other options
  didCache: createDidCache(),
  handleCache: createHandleCache(),
});`}
          />
        </div>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          The tiered cache uses in-memory LRU as L1 and the free Cloudflare
          Cache API as L2. No KV bindings or additional cost required.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">KV Store Options</h2>
        <p className="mb-3">
          Both{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            KvStateStore
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            KvSessionStore
          </code>{" "}
          accept optional configuration:
        </p>
        <CodeBlock
          code={`new KvStateStore(env.OAUTH_STATE_KV, {
  prefix: "oauth_state:",    // default
  ttlSeconds: 600,           // default: 10 minutes
});

new KvSessionStore(env.OAUTH_SESSION_KV, {
  prefix: "oauth_session:",  // default
  ttlSeconds: 604800,        // default: 7 days
});`}
        />
      </section>
    </div>
  );
}
