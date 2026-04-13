import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function CacheApiStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">CacheApiStore</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolver-cache
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Implements{" "}
        <ExternalLink href="https://www.npmjs.com/package/@atproto-labs/simple-store">
          SimpleStore
        </ExternalLink>{" "}
        using the{" "}
        <ExternalLink href="https://developers.cloudflare.com/workers/runtime-apis/cache/">
          Cloudflare Cache API
        </ExternalLink>
        . Values are serialized to JSON and stored as synthetic HTTP responses
        with{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          Cache-Control
        </code>{" "}
        headers for TTL management. The Cache API is regional and survives
        Worker isolate restarts.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new CacheApiStore<V>(options: CacheApiStoreOptions)`}
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
                <td className="px-3 py-2 font-mono text-xs">ttlSeconds</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 text-xs">required</td>
                <td className="px-3 py-2 text-xs">
                  Time-to-live in seconds for cached values, set via the{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    Cache-Control: max-age
                  </code>{" "}
                  header.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">cacheName</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "atproto-resolver"
                </td>
                <td className="px-3 py-2 text-xs">
                  Name of the{" "}
                  <ExternalLink href="https://developers.cloudflare.com/workers/runtime-apis/cache/">
                    Cache API
                  </ExternalLink>{" "}
                  cache to open. Namespaces the entries from other caches in the
                  same Worker.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">prefix</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">""</td>
                <td className="px-3 py-2 text-xs">
                  Optional string prepended to all cache keys. Useful when
                  multiple{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    CacheApiStore
                  </code>{" "}
                  instances share the same{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    cacheName
                  </code>
                  .
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
          code={`import { CacheApiStore } from "@atiproto/edge-resolver-cache";

// Cache API only — no memory tier
const store = new CacheApiStore({
  ttlSeconds: 3600,
  cacheName: "my-cache",
  prefix: "did:",
});

await store.set("did:plc:abc123", didDocument);
const doc = await store.get("did:plc:abc123");`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Usage with TieredStore
        </AnchorHeading>
        <p className="mb-3">
          For the typical two-tier setup, pair with a memory store as L1:
        </p>
        <CodeBlock
          code={`import { CacheApiStore, TieredStore } from "@atiproto/edge-resolver-cache";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";

const tiered = new TieredStore(
  new SimpleStoreMemory({ max: 500, ttl: 300_000 }), // L1: memory, 5 minutes
  new CacheApiStore({ prefix: "did:", ttlSeconds: 7200 }), // L2: Cache API, 2 hours
);`}
        />
      </section>
    </div>
  );
}
