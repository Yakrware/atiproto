import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CreateDidKeyResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createDidKeyResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/key-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Returns a KeyResolver that parses{" "}
        <code className="font-mono">did:key:</code> references locally and
        rejects everything else. No network I/O. Matches the behavior the{" "}
        <a
          href="/docs/atproto-attestation/verify"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          verify
        </a>{" "}
        function uses by default. Exposed here as a factory so consumers can
        compose it with other resolvers explicitly.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock code={`function createDidKeyResolver(): KeyResolver`} />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Usage
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createDidKeyResolver } from "@atiproto/key-resolver";

const keyResolver = createDidKeyResolver();

const result = await verify({
  record,
  repository: "did:plc:recipient",
  keyResolver,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          When to use it
        </AnchorHeading>
        <p className="text-sm">
          When your signers only use <code className="font-mono">did:key:</code>{" "}
          identities. Using this factory rather than the verifier default makes
          the dependency explicit in code review and makes it trivial to switch
          to{" "}
          <a
            href="/docs/key-resolver/createFetchKeyResolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            createFetchKeyResolver
          </a>{" "}
          later without changing the call site.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/key-resolver/createFetchKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchKeyResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/key-resolver/createCachedKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createCachedKeyResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
