import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function ResolveHandlesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">resolveHandles</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolvers
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Batch-resolves an array of DIDs to their corresponding ATProto handles
        using{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          Promise.allSettled
        </code>{" "}
        for fault tolerance. Failures for individual DIDs fall back to the DID
        string itself, so the result map always contains an entry for every
        input.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function resolveHandles(
  dids: string[],
  resolver?: EdgeDidResolver
): Promise<Map<string, string>>`}
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
                <td className="px-3 py-2 font-mono text-xs">dids</td>
                <td className="px-3 py-2 font-mono text-xs">string[]</td>
                <td className="px-3 py-2 text-xs">
                  Array of DID strings to resolve.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">resolver</td>
                <td className="px-3 py-2 font-mono text-xs">
                  EdgeDidResolver?
                </td>
                <td className="px-3 py-2 text-xs">
                  Optional{" "}
                  <a
                    href="/docs/edge-resolvers/EdgeDidResolver"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    EdgeDidResolver
                  </a>{" "}
                  instance. A default instance is created if not provided.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Return Value
        </AnchorHeading>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
          A{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            Map&lt;string, string&gt;
          </code>{" "}
          keyed by DID. The value is the resolved ATProto handle (e.g.{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            "alice.bsky.social"
          </code>
          ) on success, or the original DID string on failure. The map always
          has the same number of entries as the input array.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { resolveHandles, EdgeDidResolver } from "@atiproto/edge-resolvers";

const resolver = new EdgeDidResolver();

const handles = await resolveHandles(
  ["did:plc:abc123", "did:plc:def456"],
  resolver
);

// { "did:plc:abc123" => "alice.bsky.social", "did:plc:def456" => "bob.bsky.social" }
console.log(handles);`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeXrpcHandleResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeXrpcHandleResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
