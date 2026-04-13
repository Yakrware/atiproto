import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function EdgeRuntimeImplementationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">EdgeRuntimeImplementation</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-oauth-client
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Implements the{" "}
        <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
          RuntimeImplementation
        </ExternalLink>{" "}
        interface required by{" "}
        <a
          href="/docs/edge-oauth-client/EdgeOAuthClient"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          EdgeOAuthClient
        </a>{" "}
        using Web Platform APIs (WebCrypto, Fetch). Works in any edge runtime
        that exposes the standard{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          crypto
        </code>{" "}
        global — Cloudflare Workers, Deno, and modern Node.js (v18+).
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock code={`new EdgeRuntimeImplementation()`} />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          No constructor parameters. All methods delegate to Web Platform
          globals.
        </p>
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
                <td className="px-3 py-2 font-mono text-xs">createKey(algs)</td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;Key&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Generates a DPoP key pair using{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    crypto.subtle.generateKey
                  </code>
                  . Selects the first supported algorithm from{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    algs
                  </code>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">
                  getRandomValues(len)
                </td>
                <td className="px-3 py-2 font-mono text-xs">Uint8Array</td>
                <td className="px-3 py-2 text-xs">
                  Returns cryptographically random bytes via{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    crypto.getRandomValues
                  </code>
                  .
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">
                  digest(alg, data)
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;Uint8Array&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Hashes data using{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    crypto.subtle.digest
                  </code>
                  .
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">
                  requestLock(name, fn)
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  Promise&lt;T&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  Acquires a named lock via the{" "}
                  <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API">
                    Web Locks API
                  </ExternalLink>{" "}
                  (
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    navigator.locks.request
                  </code>
                  ) before invoking{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    fn
                  </code>
                  . Falls back to a no-op lock if the API is unavailable.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Usage
        </AnchorHeading>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          Passed automatically by{" "}
          <a
            href="/docs/edge-oauth-client/EdgeOAuthClient"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeOAuthClient
          </a>
          . You only need to instantiate it directly if you are constructing an{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            OAuthClient
          </code>{" "}
          from the base package:
        </p>
        <CodeBlock
          code={`import { EdgeRuntimeImplementation } from "@atiproto/edge-oauth-client";

const runtime = new EdgeRuntimeImplementation();
// runtime satisfies RuntimeImplementation`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/edge-oauth-client/patchGlobalRequestObject"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              patchGlobalRequestObject
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              — companion utility required in some edge runtimes
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
