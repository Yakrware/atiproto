import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function TimedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">timed</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/edge-resolvers
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Wraps an async function with an{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          AbortSignal
        </code>{" "}
        timeout. If the function does not resolve within{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          ms
        </code>{" "}
        milliseconds, the signal is aborted and the promise rejects with a
        timeout error. Used internally by{" "}
        <a
          href="/docs/edge-resolvers/EdgeDidPlcResolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          EdgeDidPlcResolver
        </a>{" "}
        and{" "}
        <a
          href="/docs/edge-resolvers/EdgeDidWebResolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono"
        >
          EdgeDidWebResolver
        </a>
        .
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function timed<T>(ms: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T>`}
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
                <td className="px-3 py-2 font-mono text-xs">ms</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 text-xs">
                  Timeout in milliseconds. The{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    AbortSignal
                  </code>{" "}
                  fires after this duration.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">fn</td>
                <td className="px-3 py-2 font-mono text-xs">
                  (signal: AbortSignal) =&gt; Promise&lt;T&gt;
                </td>
                <td className="px-3 py-2 text-xs">
                  The async work to perform. Receives the{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    AbortSignal
                  </code>{" "}
                  so it can be forwarded to{" "}
                  <code className="bg-surface-alt dark:bg-surface-alt-dark px-1 rounded font-mono">
                    fetch
                  </code>{" "}
                  or other cancellable APIs.
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
          code={`import { timed } from "@atiproto/edge-resolvers";

const data = await timed(3000, async (signal) => {
  const res = await fetch("https://plc.directory/did:plc:abc123", { signal });
  return res.json();
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
              href="/docs/edge-resolvers/EdgeDidPlcResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidPlcResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/edge-resolvers/EdgeDidWebResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeDidWebResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
