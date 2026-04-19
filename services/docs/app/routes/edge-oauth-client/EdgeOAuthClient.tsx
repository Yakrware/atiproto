import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeOAuthClientClass() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">EdgeOAuthClient</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-oauth-client
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Extends{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
          OAuthClient
        </ExternalLink>{" "}
        from{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atproto/oauth-client
        </code>{" "}
        with WebCrypto-based cryptography and edge-compatible defaults for DID
        and handle resolution.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new EdgeOAuthClient(options: EdgeOAuthClientOptions)`}
        />

        <p className="mt-4 mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          All options from{" "}
          <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
            OAuthClientOptions
          </ExternalLink>{" "}
          are accepted. The following have edge-specific defaults or are
          required:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Option
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Type
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Default
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">clientMetadata</td>
                <td className="px-3 py-2 font-mono text-xs">
                  OAuthClientMetadata
                </td>
                <td className="px-3 py-2 text-xs">required</td>
                <td className="px-3 py-2 text-xs">
                  OAuth 2.0 client metadata. Must include{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    client_id
                  </code>
                  ,{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    redirect_uris
                  </code>
                  , and{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    dpop_bound_access_tokens: true
                  </code>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">stateStore</td>
                <td className="px-3 py-2 font-mono text-xs">StateStore</td>
                <td className="px-3 py-2 text-xs">required</td>
                <td className="px-3 py-2 text-xs">
                  Stores transient OAuth state between the authorization request
                  and callback. Use{" "}
                  <a
                    href="/docs/kv-oauth-state-store/KvStateStore"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    KvStateStore
                  </a>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">sessionStore</td>
                <td className="px-3 py-2 font-mono text-xs">SessionStore</td>
                <td className="px-3 py-2 text-xs">required</td>
                <td className="px-3 py-2 text-xs">
                  Persists authenticated sessions for{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    restore()
                  </code>
                  . Use{" "}
                  <a
                    href="/docs/kv-oauth-state-store/KvSessionStore"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    KvSessionStore
                  </a>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">keyset</td>
                <td className="px-3 py-2 font-mono text-xs">Keyset</td>
                <td className="px-3 py-2 text-xs">optional</td>
                <td className="px-3 py-2 text-xs">
                  Required for confidential clients. Build one from a private
                  JWK with{" "}
                  <a
                    href="/docs/edge-oauth-client/getKeyset"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    getKeyset
                  </a>
                  . Public clients (
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    token_endpoint_auth_method: "none"
                  </code>
                  ) omit this option.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">responseMode</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "query" | "fragment"
                </td>
                <td className="px-3 py-2 font-mono text-xs">"query"</td>
                <td className="px-3 py-2 text-xs">
                  How the authorization server returns the code. Workers cannot
                  read fragments, so{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    "query"
                  </code>{" "}
                  is the correct choice.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">didResolver</td>
                <td className="px-3 py-2 font-mono text-xs">DidResolver</td>
                <td className="px-3 py-2 text-xs">
                  EdgeDidResolver (plc.directory, 3s timeout)
                </td>
                <td className="px-3 py-2 text-xs">
                  Resolves DIDs to DID documents. Override to use{" "}
                  <a
                    href="/docs/edge-resolver-cache"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    edge-resolver-cache
                  </a>{" "}
                  for durability.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">handleResolver</td>
                <td className="px-3 py-2 font-mono text-xs">HandleResolver</td>
                <td className="px-3 py-2 text-xs">
                  EdgeXrpcHandleResolver (public.api.bsky.app)
                </td>
                <td className="px-3 py-2 text-xs">
                  Resolves ATProto handles to DIDs via XRPC.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">didCache</td>
                <td className="px-3 py-2 font-mono text-xs">DidCache</td>
                <td className="px-3 py-2 text-xs">in-memory only</td>
                <td className="px-3 py-2 text-xs">
                  Cache for resolved DID documents. Use{" "}
                  <a
                    href="/docs/edge-resolver-cache"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    createDidCache()
                  </a>{" "}
                  for a tiered Cache API + memory cache.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">handleCache</td>
                <td className="px-3 py-2 font-mono text-xs">HandleCache</td>
                <td className="px-3 py-2 text-xs">in-memory only</td>
                <td className="px-3 py-2 text-xs">
                  Cache for resolved handles. Use{" "}
                  <a
                    href="/docs/edge-resolver-cache"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    createHandleCache()
                  </a>{" "}
                  for a tiered Cache API + memory cache.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          With Resolver Caching
        </AnchorHeading>
        <p className="mb-3">
          The default in-memory caches reset when the Worker isolate recycles.
          For better durability, provide Cache API-backed caches:
        </p>
        <CodeBlock
          code={`import { createDidCache, createHandleCache } from "@atiproto/edge-resolver-cache";

const client = new EdgeOAuthClient({
  // ...
  didCache: createDidCache(),
  handleCache: createHandleCache(),
});`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Inherited Methods
        </AnchorHeading>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          All methods from{" "}
          <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
            OAuthClient
          </ExternalLink>{" "}
          are available.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Method
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">
                  authorize(handle, params)
                </td>
                <td className="px-3 py-2 text-xs">
                  Generates an authorization URL for the given ATProto handle.
                  Redirect the user to this URL to begin the OAuth flow.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">
                  callback(params)
                </td>
                <td className="px-3 py-2 text-xs">
                  Exchanges the authorization code for a session. Pass the
                  callback URL's search params directly.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">restore(did)</td>
                <td className="px-3 py-2 text-xs">
                  Restores a previously authenticated session by DID.
                  Automatically refreshes tokens if expired.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
