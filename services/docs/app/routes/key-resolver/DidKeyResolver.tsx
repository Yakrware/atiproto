import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function DidKeyResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">DidKeyResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/key-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Parses <code className="font-mono">did:key:</code> references locally
        and rejects everything else. No network I/O. This is the same behavior
        the{" "}
        <a
          href="/docs/atproto-attestation/verify"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          verify
        </a>{" "}
        function uses by default — exposed here as a class so consumers can
        compose it with other resolvers explicitly.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Usage
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { DidKeyResolver } from "@atiproto/key-resolver";

const keys = new DidKeyResolver();

const result = await verify({
  record,
  repository: "did:plc:recipient",
  keyResolver: keys.resolve,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          When to use it
        </AnchorHeading>
        <p className="text-sm">
          When your signers only use <code className="font-mono">did:key:</code>{" "}
          identities — common for fully in-process signing flows where there is
          no DID document to publish. Using the class form rather than relying
          on the verifier default makes the dependency explicit in code review
          and makes it easy to switch to{" "}
          <a
            href="/docs/key-resolver/FetchKeyResolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            FetchKeyResolver
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
              href="/docs/key-resolver/FetchKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              FetchKeyResolver
            </a>
          </li>
          <li>
            <a
              href="/docs/key-resolver/EdgeKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              EdgeKeyResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
