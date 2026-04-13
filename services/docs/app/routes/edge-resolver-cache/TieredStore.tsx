import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function TieredStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">TieredStore</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolver-cache
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Implements{" "}
        <ExternalLink href="https://www.npmjs.com/package/@atproto-labs/simple-store">
          SimpleStore
        </ExternalLink>{" "}
        by composing two stores into a read-through L1/L2 cache. On a cache
        miss, L2 is checked and a hit populates L1. Writes go to both tiers.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new TieredStore<K, V>(l1: SimpleStore<K, V>, l2: SimpleStore<K, V>)`}
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
                <td className="px-3 py-2 font-mono text-xs">l1</td>
                <td className="px-3 py-2 font-mono text-xs">
                  SimpleStore&lt;K, V&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  The fast, short-lived tier. Typically a{" "}
                  <ExternalLink href="https://www.npmjs.com/package/@atproto-labs/simple-store-memory">
                    SimpleStoreMemory
                  </ExternalLink>{" "}
                  instance. Checked first on reads.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">l2</td>
                <td className="px-3 py-2 font-mono text-xs">
                  SimpleStore&lt;K, V&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  The durable, slower tier. Typically a{" "}
                  <a
                    href="/docs/edge-resolver-cache/CacheApiStore"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    CacheApiStore
                  </a>{" "}
                  instance. Checked on L1 miss; results are backfilled to L1.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Read-Through Behavior
        </AnchorHeading>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          On{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
            get(key)
          </code>
          :
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm text-text-muted dark:text-text-muted-dark">
          <li>Check L1 — return immediately on hit.</li>
          <li>Check L2 on L1 miss — backfill L1 and return on hit.</li>
          <li>
            Return{" "}
            <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
              undefined
            </code>{" "}
            on L2 miss.
          </li>
        </ol>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          On{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
            set(key, value)
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
            del(key)
          </code>
          : both tiers are written concurrently.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { CacheApiStore, TieredStore } from "@atiproto/edge-resolver-cache";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";

const tiered = new TieredStore(
  new SimpleStoreMemory({ max: 1000, ttl: 3_600_000 }), // L1: 1hr, 1000 entries
  new CacheApiStore({ prefix: "did:", ttlSeconds: 86400 }), // L2: 24hrs
);

await tiered.set("did:plc:abc123", didDocument);
const doc = await tiered.get("did:plc:abc123"); // hits L1`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Factory Functions
        </AnchorHeading>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          For the common case of caching DID documents or handles, use the
          built-in factories which return pre-configured{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded font-mono">
            TieredStore
          </code>{" "}
          instances:
        </p>
        <CodeBlock
          code={`import { createDidCache, createHandleCache } from "@atiproto/edge-resolver-cache";

// TieredStore with sane defaults for DID doc caching
const didCache = createDidCache({ cacheName: "my-cache" });

// TieredStore with sane defaults for handle caching
const handleCache = createHandleCache({ cacheName: "my-cache" });`}
        />
      </section>
    </div>
  );
}
