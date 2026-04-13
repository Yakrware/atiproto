import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function KvStateStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">KvStateStore</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/kv-oauth-state-store
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Implements the{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
          StateStore
        </ExternalLink>{" "}
        interface from{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atproto/oauth-client
        </code>{" "}
        using a Cloudflare KV namespace. Stores transient OAuth state between
        the authorization request and the callback, including the DPoP key in
        JWK format.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new KvStateStore(kv: KVNamespace, options?: KvStateStoreOptions)`}
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Parameter
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Type
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">kv</td>
                <td className="px-3 py-2 font-mono text-xs">KVNamespace</td>
                <td className="px-3 py-2 text-xs">
                  The Cloudflare KV namespace binding. Bind this in{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    wrangler.jsonc
                  </code>{" "}
                  as{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    OAUTH_STATE_KV
                  </code>
                  .
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">options</td>
                <td className="px-3 py-2 font-mono text-xs">
                  KvStateStoreOptions
                </td>
                <td className="px-3 py-2 text-xs">See options table below.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Options
        </AnchorHeading>
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
                <td className="px-3 py-2 font-mono text-xs">prefix</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">"oauth_state:"</td>
                <td className="px-3 py-2 text-xs">
                  Key prefix for all KV entries. Change this if you share a KV
                  namespace with other data.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">ttlSeconds</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">600</td>
                <td className="px-3 py-2 text-xs">
                  Time-to-live in seconds for each state entry. State is only
                  needed during the login flow, so the default 10-minute TTL is
                  sufficient for most cases.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { KvStateStore } from "@atiproto/kv-oauth-state-store";

new KvStateStore(env.OAUTH_STATE_KV, {
  prefix: "oauth_state:",  // default
  ttlSeconds: 600,         // default: 10 minutes
});`}
        />
      </section>
    </div>
  );
}
