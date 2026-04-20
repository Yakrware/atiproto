import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function GetKeysetPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">getKeyset</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-oauth-client
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Builds a{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/jwk">
          Keyset
        </ExternalLink>{" "}
        from a private JWK string and caches the resulting{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          Promise
        </code>{" "}
        in module scope. Pass the result as the{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          keyset
        </code>{" "}
        option when constructing a confidential{" "}
        <a
          href="/docs/edge-oauth-client/EdgeOAuthClient"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          EdgeOAuthClient
        </a>
        .
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function getKeyset(jwk: string | undefined): Promise<Keyset | null>`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Accepts the raw JSON string of a single private JWK (typically read
          from an environment variable). Returns{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            null
          </code>{" "}
          when the input is empty or undefined, which is the correct shape for a
          public client.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { EdgeOAuthClient, getKeyset, patchGlobalRequestObject } from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";

patchGlobalRequestObject();

interface Env {
  OAUTH_STATE_KV: KVNamespace;
  OAUTH_SESSION_KV: KVNamespace;
  OAUTH_PRIVATE_JWK?: string;
}

async function createOAuthClient(env: Env) {
  return new EdgeOAuthClient({
    clientMetadata: {
      client_id: "https://your-app.example.com/oauth/client-metadata.json",
      // ... other metadata, with
      //   token_endpoint_auth_method: "private_key_jwt"
      //   token_endpoint_auth_signing_alg: "ES256"
    },
    keyset: (await getKeyset(env.OAUTH_PRIVATE_JWK)) ?? undefined,
    stateStore: new KvStateStore(env.OAUTH_STATE_KV),
    sessionStore: new KvSessionStore(env.OAUTH_SESSION_KV),
  });
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Caching Behavior
        </AnchorHeading>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
          The first call memoizes the{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            Promise
          </code>{" "}
          in a module-level variable; every subsequent call returns the same
          Promise without re-parsing the JWK. This matches the lifetime of a
          Worker isolate, which should only ever serve one client identity.
          Because the cache is keyed on module identity rather than input, the
          argument passed to later calls is ignored.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Generating a Key
        </AnchorHeading>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
          The JWK is a <strong>private</strong> key that signs client assertions
          at the token endpoint. Treat it like any other secret: keep it out of
          source control, store it in Wrangler secrets (
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            wrangler secret put OAUTH_PRIVATE_JWK
          </code>
          ), and rotate it only when necessary — rotating invalidates every
          currently-issued session because refresh tokens can no longer be
          signed.
        </p>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
          The following script prints a fresh ES256 private JWK on{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            stdout
          </code>
          . Pipe it directly into{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            wrangler secret put
          </code>{" "}
          to avoid writing the key to disk:
        </p>
        <CodeBlock
          language="bash"
          code={`node scripts/generate-jwk.mjs | wrangler secret put OAUTH_PRIVATE_JWK`}
        />
        <p className="mt-4 mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            scripts/generate-jwk.mjs
          </code>
          :
        </p>
        <CodeBlock
          language="javascript"
          code={`#!/usr/bin/env node
// Generates an ES256 private JWK suitable for OAUTH_PRIVATE_JWK.
import { subtle, randomUUID } from "node:crypto";

export async function generateJwk() {
  const { privateKey } = await subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const jwk = await subtle.exportKey("jwk", privateKey);
  jwk.alg = "ES256";
  jwk.key_ops = ["sign"];
  jwk.kid = randomUUID();
  return jwk;
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  process.stdout.write(JSON.stringify(await generateJwk()) + "\\n");
}`}
        />
        <p className="mt-4 text-sm text-text-muted dark:text-text-muted-dark">
          The exported{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
            generateJwk()
          </code>{" "}
          function can also be imported from tests or setup scripts when a fresh
          key is needed programmatically.
        </p>
      </section>
    </div>
  );
}
