import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CreateAgentRecordResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createAgentRecordResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/record-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Returns a RecordResolver that routes{" "}
        <code className="font-mono">com.atproto.repo.getRecord</code> through
        any XRPC-shaped client, typically the same agent you already use for
        application calls. Auth, retries, and proxying live on the agent. This
        factory just routes the call.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function createAgentRecordResolver(
  agent: RecordResolverAgent,
): RecordResolver

interface RecordResolverAgent {
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
          <code className="font-mono">@atproto/xrpc.XrpcClient</code>. Any of
          them can be passed directly.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Behavior
        </AnchorHeading>
        <p className="text-sm">
          Parses the URI, calls{" "}
          <code className="font-mono">com.atproto.repo.getRecord</code> on the
          configured agent, and returns the{" "}
          <code className="font-mono">value</code> field. Throws on missing
          value or any error propagated by the agent.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example: same-agent verification
        </AnchorHeading>
        <p className="mb-3 text-sm">
          The user's agent already has the right credentials and proxying. Reuse
          it for proof resolution rather than spinning up a separate fetch path:
        </p>
        <CodeBlock
          code={`import { Agent } from "@atiproto/agent";
import { verify } from "@atiproto/atproto-attestation";
import { createAgentRecordResolver } from "@atiproto/record-resolver";

const agent = new Agent(/* SessionManager / FetchHandler */);
const recordResolver = createAgentRecordResolver(agent);

const result = await verify({
  record: cart,
  repository: cart.recipientDid,
  fields,
  recordResolver,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example: bare XrpcClient
        </AnchorHeading>
        <CodeBlock
          code={`import { XrpcClient } from "@atproto/xrpc";
import { createAgentRecordResolver } from "@atiproto/record-resolver";

const client = new XrpcClient("https://bsky.network", []);
const recordResolver = createAgentRecordResolver(client);`}
        />
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
              href="/docs/record-resolver/createCachedRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createCachedRecordResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
