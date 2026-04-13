import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeDidPlcResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">EdgeDidPlcResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolvers
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Extends{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/identity">
          DidPlcResolver
        </ExternalLink>{" "}
        from{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atproto/identity
        </code>{" "}
        to use the Web Platform{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          fetch
        </code>{" "}
        API with request timeouts via{" "}
        <a
          href="/docs/edge-resolvers/timed"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          timed()
        </a>
        . Resolves{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          did:plc:
        </code>{" "}
        identifiers against the PLC directory.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new EdgeDidPlcResolver(options?: DidPlcResolverOptions)`}
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
                <td className="px-3 py-2 text-xs">
                  Base URL of the PLC directory to resolve DIDs against.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">timeout</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">3000</td>
                <td className="px-3 py-2 text-xs">
                  Request timeout in milliseconds. Uses{" "}
                  <a
                    href="/docs/edge-resolvers/timed"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    timed()
                  </a>{" "}
                  with an{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    AbortSignal
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
          code={`import { EdgeDidPlcResolver } from "@atiproto/edge-resolvers";

const resolver = new EdgeDidPlcResolver({
  plcUrl: "https://plc.directory",
  timeout: 5000,
});

const didDoc = await resolver.resolve("did:plc:abc123");`}
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
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — aggregates all DID method resolvers
            </span>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidWebResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidWebResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — resolves did:web: identifiers
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
