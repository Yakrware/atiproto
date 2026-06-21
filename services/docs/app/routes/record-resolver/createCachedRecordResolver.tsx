import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CreateCachedRecordResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createCachedRecordResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/record-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Returns a RecordResolver that wraps{" "}
        <a
          href="/docs/record-resolver/createFetchRecordResolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          createFetchRecordResolver
        </a>{" "}
        with a <code className="font-mono">SimpleStore</code> cache. Cache key
        is the full <code className="font-mono">at://</code> URI. Safe because
        proof records are content-addressed by their strongRef CID and never
        change in place.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function createCachedRecordResolver(
  options?: CachedRecordResolverOptions,
): RecordResolver`}
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
                <td className="px-3 py-2 font-mono text-xs">relay</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "https://bsky.network"
                </td>
                <td className="px-3 py-2 text-xs">
                  Base URL for <code className="font-mono">getRecord</code>.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">timeout</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">3000</td>
                <td className="px-3 py-2 text-xs">
                  Milliseconds before the fetch is aborted.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">fetch</td>
                <td className="px-3 py-2 font-mono text-xs">typeof fetch</td>
                <td className="px-3 py-2 font-mono text-xs">
                  globalThis.fetch
                </td>
                <td className="px-3 py-2 text-xs">
                  Override the global fetch.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">cache</td>
                <td className="px-3 py-2 font-mono text-xs">
                  SimpleStore&lt;string, RecordMap&gt;
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  SimpleStoreMemory&nbsp;(24hr TTL)
                </td>
                <td className="px-3 py-2 text-xs">
                  Cache keyed by full <code className="font-mono">at://</code>{" "}
                  URI.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Edge (Cloudflare Workers)
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Pair with a tiered cache (in-memory L1 + Cache API L2) for
          cross-request persistence within a colo. Build the cache from the same
          primitives as{" "}
          <a
            href="/docs/edge-resolver-cache"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            @atiproto/edge-resolver-cache
          </a>
          :
        </p>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedRecordResolver } from "@atiproto/record-resolver";
import { CacheApiStore, TieredStore } from "@atiproto/edge-resolver-cache";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";

const cache = new TieredStore(
  new SimpleStoreMemory({ ttl: 86_400_000, ttlAutopurge: true, max: 1000 }),
  new CacheApiStore({ prefix: "proof:", ttlSeconds: 7 * 86_400 }),
);

const recordResolver = createCachedRecordResolver({ cache });

export default {
  async fetch(req: Request) {
    const result = await verify({
      record,
      repository,
      recordResolver,
    });
    return Response.json(result);
  },
};`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Why caching is safe
        </AnchorHeading>
        <p className="text-sm">
          Each strongRef pins a specific proof record CID. If the proof's
          contents change, the strongRef stops resolving: there is no mutation
          in place. So a cache keyed by URI is safe for an unlimited duration.
          The 24-hour TTL on the in-memory default exists only to bound memory;
          for Workers backed by Cache API, much longer TTLs are reasonable.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/record-resolver/createFetchRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchRecordResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/edge-resolver-cache"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              @atiproto/edge-resolver-cache
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
