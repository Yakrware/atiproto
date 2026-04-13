import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function CreateDidCachePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createDidCache</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolver-cache
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Factory function that returns a pre-configured{" "}
        <a
          href="/docs/edge-resolver-cache/TieredStore"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          TieredStore
        </a>{" "}
        for caching DID documents. L1 is an in-memory LRU cache; L2 is a{" "}
        <a
          href="/docs/edge-resolver-cache/CacheApiStore"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          CacheApiStore
        </a>{" "}
        backed by the Cloudflare Cache API. Suitable as the{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          didCache
        </code>{" "}
        option for{" "}
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
          code={`function createDidCache(options?: CreateDidCacheOptions): TieredStore<Did, DidDocument>`}
        />

        <div className="overflow-x-auto mt-4">
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
                <td className="px-3 py-2 font-mono text-xs">cacheName</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "atproto-resolver"
                </td>
                <td className="px-3 py-2 text-xs">
                  Name of the Cache API cache passed to{" "}
                  <a
                    href="/docs/edge-resolver-cache/CacheApiStore"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    CacheApiStore
                  </a>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">l1MaxSize</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">~50 MB</td>
                <td className="px-3 py-2 text-xs">
                  Maximum byte size of the in-memory L1 cache.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">l1Ttl</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">3_600_000 (1hr)</td>
                <td className="px-3 py-2 text-xs">
                  TTL for the in-memory L1 cache in milliseconds.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">l2TtlSeconds</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">86400 (24hr)</td>
                <td className="px-3 py-2 text-xs">
                  TTL for the Cache API L2 store in seconds.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { createDidCache } from "@atiproto/edge-resolver-cache";
import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";

const client = new EdgeOAuthClient({
  // ...
  didCache: createDidCache({ cacheName: "my-cache" }),
});`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/edge-resolver-cache/createHandleCache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createHandleCache
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — equivalent factory for handle resolution caching
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolver-cache/TieredStore"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              TieredStore
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — the underlying two-tier cache class
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
