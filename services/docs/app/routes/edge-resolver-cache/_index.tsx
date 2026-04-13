import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeResolverCacheIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">edge-resolver-cache</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Tiered DID and handle resolver caching for Cloudflare Workers. Combines
        an in-memory LRU cache (L1) with the free{" "}
        <ExternalLink href="https://developers.cloudflare.com/workers/runtime-apis/cache/">
          Cloudflare Cache API
        </ExternalLink>{" "}
        (L2) for cache durability across Worker isolate restarts.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/edge-resolver-cache"
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          No KV bindings or additional Cloudflare configuration required. The
          Cache API is available on all Workers plans at no extra cost.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick Setup
        </AnchorHeading>
        <p className="mb-3">
          Use the{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            createDidCache()
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            createHandleCache()
          </code>{" "}
          factory functions with{" "}
          <a
            href="/docs/edge-oauth-client/EdgeOAuthClient"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeOAuthClient
          </a>{" "}
          to replace the default in-memory-only caches:
        </p>
        <CodeBlock
          code={`import { createDidCache, createHandleCache } from "@atiproto/edge-resolver-cache";
import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";

const client = new EdgeOAuthClient({
  // ...
  didCache: createDidCache(),
  handleCache: createHandleCache(),
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Cache Tiers
        </AnchorHeading>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Tier
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Backend
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Latency
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Lifetime
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2">L1</td>
                <td className="px-3 py-2">In-memory LRU</td>
                <td className="px-3 py-2">~0ms</td>
                <td className="px-3 py-2">Worker isolate lifetime</td>
              </tr>
              <tr>
                <td className="px-3 py-2">L2</td>
                <td className="px-3 py-2">Cloudflare Cache API</td>
                <td className="px-3 py-2">&lt;1ms</td>
                <td className="px-3 py-2">
                  Regional, survives isolate restarts
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Default TTLs
        </AnchorHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Cache
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  L1 (memory)
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  L2 (Cache API)
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2">DID documents</td>
                <td className="px-3 py-2">1 hour, ~50MB max</td>
                <td className="px-3 py-2">24 hours</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Handle resolution</td>
                <td className="px-3 py-2">10 minutes, 1000 entries</td>
                <td className="px-3 py-2">1 hour</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Classes
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/edge-resolver-cache/CacheApiStore"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              CacheApiStore
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Cloudflare Cache API-backed store for a single cache tier
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
              — Composes two SimpleStore instances into a read-through L1/L2
              cache
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolver-cache/createDidCache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createDidCache
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Factory for a pre-configured DID document TieredStore
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolver-cache/createHandleCache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createHandleCache
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — Factory for a pre-configured handle resolution TieredStore
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
