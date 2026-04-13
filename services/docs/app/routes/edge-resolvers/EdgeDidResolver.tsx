import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeDidResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">EdgeDidResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolvers
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Extends{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/identity#readme">
          DidResolver
        </ExternalLink>{" "}
        from{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          @atproto/identity
        </code>{" "}
        using fetch-based sub-resolvers for both did:plc and did:web, making it
        compatible with Cloudflare Workers and any fetch-capable runtime.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock code={`new EdgeDidResolver(opts?: DidResolverOpts)`} />

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
                  Base URL for the PLC directory used to resolve did:plc
                  identifiers.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">timeout</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">3000</td>
                <td className="px-3 py-2 text-xs">
                  Milliseconds before a resolution request is aborted.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Methods
        </AnchorHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Method
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Returns
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">resolve(did)</td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;DidDocument&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Resolves a DID to its DID document. Dispatches to the PLC or
                  Web sub-resolver based on the DID method.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">
                  resolveHandle(did)
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;string | undefined&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Extracts the handle from the{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    alsoKnownAs
                  </code>{" "}
                  field of the resolved DID document.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">
                  asOAuthResolver()
                </td>
                <td className="px-3 py-2 font-mono text-xs">OAuthResolver</td>
                <td className="px-3 py-2 text-xs">
                  Returns an adapter compatible with the{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    didResolver
                  </code>{" "}
                  option of{" "}
                  <a
                    href="/docs/edge-oauth-client/EdgeOAuthClient"
                    className="text-primary dark:text-primary-dark hover:underline font-mono"
                  >
                    EdgeOAuthClient
                  </a>
                  .
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
          code={`import { EdgeDidResolver } from "@atiproto/edge-resolvers";

// Standalone resolution
const resolver = new EdgeDidResolver({ timeout: 5000 });
const doc = await resolver.resolve("did:plc:abc123");

// As an OAuth-compatible resolver
const oauthResolver = resolver.asOAuthResolver();`}
        />
      </section>
    </div>
  );
}
