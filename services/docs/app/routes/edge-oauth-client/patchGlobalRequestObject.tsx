import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";
import { ExternalLink } from "~/components/ExternalLink";

export default function PatchGlobalRequestObjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">patchGlobalRequestObject</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-oauth-client
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Patches{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          globalThis.Request
        </code>{" "}
        to strip the{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          cache
        </code>{" "}
        property from request init objects before construction. Required in
        Cloudflare Workers, where passing{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          cache
        </code>{" "}
        to{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          new Request()
        </code>{" "}
        throws a{" "}
        <ExternalLink href="https://developers.cloudflare.com/workers/runtime-apis/request/#the-cache-property-is-not-supported">
          TypeError
        </ExternalLink>
        .
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock code={`function patchGlobalRequestObject(): void`} />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Call once at the top of your Worker entry point, before constructing
          any{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            EdgeOAuthClient
          </code>{" "}
          instance. Subsequent calls are no-ops.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`// worker.ts (entry point)
import { patchGlobalRequestObject, EdgeOAuthClient } from "@atiproto/edge-oauth-client";

patchGlobalRequestObject();

const client = new EdgeOAuthClient({ ... });

export default {
  async fetch(request: Request, env: Env) {
    // ...
  },
};`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Why This Is Needed
        </AnchorHeading>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
          The underlying{" "}
          <ExternalLink href="https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client#readme">
            @atproto/oauth-client
          </ExternalLink>{" "}
          package constructs{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            Request
          </code>{" "}
          objects with a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            cache
          </code>{" "}
          property set to{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            "no-store"
          </code>
          . Cloudflare Workers does not support this property and throws
          synchronously when it is present. The patch intercepts{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            new Request()
          </code>{" "}
          calls and removes the offending key before delegating to the original
          constructor.
        </p>
      </section>
    </div>
  );
}
