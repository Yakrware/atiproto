import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function AgentRecordResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">AgentRecordResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/record-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Resolves <code className="font-mono">at://</code> URIs through any
        XRPC-shaped client — typically the same agent you already use for
        application calls. Auth, retries, and proxying live on the agent; this
        resolver just routes the{" "}
        <code className="font-mono">com.atproto.repo.getRecord</code> call.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new AgentRecordResolver(agent: RecordResolverAgent)`}
        />
        <CodeBlock
          code={`interface RecordResolverAgent {
  call(
    nsid: string,
    params?: unknown,
    data?: unknown,
  ): Promise<{ data: unknown }>;
}`}
        />
        <p className="mt-3 text-sm">
          The interface matches{" "}
          <code className="font-mono">@atiproto/agent.Agent</code>,{" "}
          <code className="font-mono">@atproto/api.Agent</code>, and bare{" "}
          <code className="font-mono">@atproto/xrpc.XrpcClient</code> — any of
          them can be passed directly.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Resolve
        </AnchorHeading>
        <CodeBlock code={`resolve(uri: string): Promise<RecordMap>`} />
        <p className="mt-3 text-sm">
          Parses the URI, calls{" "}
          <code className="font-mono">com.atproto.repo.getRecord</code> on the
          configured agent, returns the <code className="font-mono">value</code>{" "}
          field. Throws on missing value or an error from the agent.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example: same-agent verification
        </AnchorHeading>
        <p className="mb-3 text-sm">
          The user's agent already has the right credentials and proxying —
          reuse it for proof resolution rather than spinning up a separate fetch
          path:
        </p>
        <CodeBlock
          code={`import { Agent } from "@atiproto/agent";
import { verify } from "@atiproto/atproto-attestation";
import { AgentRecordResolver } from "@atiproto/record-resolver";

const agent = new Agent(/* SessionManager / FetchHandler */);
const records = new AgentRecordResolver(agent);

const result = await verify({
  record: cart,
  repository: cart.recipientDid,
  fields,
  recordResolver: records.resolve,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example: bare XrpcClient
        </AnchorHeading>
        <CodeBlock
          code={`import { XrpcClient } from "@atproto/xrpc";
import { AgentRecordResolver } from "@atiproto/record-resolver";

const client = new XrpcClient("https://bsky.network", []);
const records = new AgentRecordResolver(client);`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/record-resolver/FetchRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              FetchRecordResolver
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
