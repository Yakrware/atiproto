import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function FetchRecordResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">FetchRecordResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/record-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Resolves <code className="font-mono">at://</code> URIs to record values
        by calling <code className="font-mono">com.atproto.repo.getRecord</code>{" "}
        on a configurable relay (or any PDS that mirrors the record). Plain{" "}
        <code className="font-mono">fetch</code> only — no auth, no XRPC client
        dependency.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new FetchRecordResolver(options?: FetchRecordResolverOptions)`}
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
                  Base URL hosting{" "}
                  <code className="font-mono">
                    /xrpc/com.atproto.repo.getRecord
                  </code>
                  . Use any relay or the issuer's PDS directly.
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
              <tr>
                <td className="px-3 py-2 font-mono text-xs">fetch</td>
                <td className="px-3 py-2 font-mono text-xs">typeof fetch</td>
                <td className="px-3 py-2 font-mono text-xs">
                  globalThis.fetch
                </td>
                <td className="px-3 py-2 text-xs">
                  Override the global fetch (tests, custom transports).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Resolve
        </AnchorHeading>
        <CodeBlock code={`resolve(uri: string): Promise<RecordMap>`} />
        <p className="mt-3 text-sm">
          Parses{" "}
          <code className="font-mono">at://{`{repo}/{collection}/{rkey}`}</code>
          , issues a single <code className="font-mono">getRecord</code> call,
          and returns the <code className="font-mono">value</code> field of the
          response. Throws on non-2xx or missing value.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { FetchRecordResolver } from "@atiproto/record-resolver";

const records = new FetchRecordResolver({
  relay: "https://bsky.network",
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  recordResolver: records.resolve,
});`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          For repeated verifications, prefer{" "}
          <a
            href="/docs/record-resolver/EdgeRecordResolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeRecordResolver
          </a>
          . Proof records are content-addressed — once resolved, they never
          change.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/record-resolver/AgentRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              AgentRecordResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/record-resolver/EdgeRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeRecordResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
