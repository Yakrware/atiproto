import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CreateCachedKeyResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createCachedKeyResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/key-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Returns a KeyResolver that wraps{" "}
        <a
          href="/docs/key-resolver/createFetchKeyResolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          createFetchKeyResolver
        </a>{" "}
        with a <code className="font-mono">SimpleStore</code> cache in front of
        the DID document fetch. Multiple fragments on the same DID share a
        single network request, and multiple records sharing a signer share the
        cached document.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function createCachedKeyResolver(
  options?: CachedKeyResolverOptions,
): KeyResolver`}
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
                <td className="px-3 py-2 font-mono text-xs">plcUrl</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "https://plc.directory"
                </td>
                <td className="px-3 py-2 text-xs">PLC directory base URL.</td>
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
                  SimpleStore&lt;string, DidDocument&gt;
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  SimpleStoreMemory&nbsp;(1hr TTL)
                </td>
                <td className="px-3 py-2 text-xs">
                  Cache keyed by full DID string.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Cache behavior
        </AnchorHeading>
        <ul className="list-disc list-inside text-sm space-y-2 text-text-muted dark:text-text-muted-dark">
          <li>
            Cache key is the bare DID (e.g.{" "}
            <code className="font-mono">did:plc:abc</code>). Fragment lookups
            happen in-process from the cached document.
          </li>
          <li>
            <code className="font-mono">did:key:</code> references skip both the
            fetch and the cache.
          </li>
          <li>
            On a cache miss the document is fetched and written back before the
            resolver returns.
          </li>
          <li>
            DID rotation isn't free here, since keys can change. Use a TTL short
            enough that compromised keys can't keep verifying indefinitely (the
            in-memory default is 1 hour).
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Edge (Cloudflare Workers)
        </AnchorHeading>
        <p className="mb-3 text-sm">
          On Cloudflare Workers, pair with{" "}
          <a
            href="/docs/edge-resolver-cache"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            @atiproto/edge-resolver-cache
          </a>{" "}
          for an in-memory L1 backed by the Cache API L2:
        </p>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedKeyResolver } from "@atiproto/key-resolver";
import { createDidCache } from "@atiproto/edge-resolver-cache";

const keyResolver = createCachedKeyResolver({ cache: createDidCache() });

export default {
  async fetch(req: Request) {
    const result = await verify({
      record,
      repository,
      keyResolver,
    });
    return Response.json(result);
  },
};`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Node / generic runtimes
        </AnchorHeading>
        <p className="mb-3 text-sm">
          The default in-memory cache works everywhere. For long-running
          services, supply your own store backed by Redis, Memcached, or
          similar:
        </p>
        <CodeBlock
          code={`import { createCachedKeyResolver } from "@atiproto/key-resolver";

const keyResolver = createCachedKeyResolver({
  cache: myRedisBackedStore,    // SimpleStore<string, DidDocument>
  timeout: 5000,
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
              href="/docs/key-resolver/createFetchKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchKeyResolver
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
