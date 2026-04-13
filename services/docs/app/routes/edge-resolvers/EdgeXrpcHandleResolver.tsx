import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeXrpcHandleResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">EdgeXrpcHandleResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolvers
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Resolves ATProto handles to DIDs by calling the{" "}
        <ExternalLink href="https://atproto.com/lexicon/com-atproto-identity-resolveHandle">
          com.atproto.identity.resolveHandle
        </ExternalLink>{" "}
        XRPC endpoint via fetch. No Node.js networking APIs required.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new EdgeXrpcHandleResolver(service?: string | URL)`}
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
                  Default
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr>
                <td className="px-3 py-2 font-mono text-xs">service</td>
                <td className="px-3 py-2 font-mono text-xs">string | URL</td>
                <td className="px-3 py-2 font-mono text-xs">
                  "https://public.api.bsky.app"
                </td>
                <td className="px-3 py-2 text-xs">
                  The XRPC service URL to use for handle resolution. Can be any
                  ATProto PDS or AppView that implements{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    com.atproto.identity.resolveHandle
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
              <tr>
                <td className="px-3 py-2 font-mono text-xs">resolve(handle)</td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;string&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Resolves an ATProto handle (e.g.{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    alice.bsky.social
                  </code>
                  ) to a DID string.
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
          code={`import { EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";

const resolver = new EdgeXrpcHandleResolver();
const did = await resolver.resolve("alice.bsky.social");
// => "did:plc:abc123..."`}
        />
      </section>
    </div>
  );
}
