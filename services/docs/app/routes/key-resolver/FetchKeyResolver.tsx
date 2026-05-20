import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function FetchKeyResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">FetchKeyResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/key-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Fetches the signer's DID document over HTTPS, then extracts the public
        key from the named verification method. Supports{" "}
        <code className="font-mono">did:key:</code> (no fetch — parsed locally),{" "}
        <code className="font-mono">did:plc:</code> (via the PLC directory), and{" "}
        <code className="font-mono">did:web:</code> (via{" "}
        <code className="font-mono">/.well-known/did.json</code>).
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock
          code={`new FetchKeyResolver(options?: FetchKeyResolverOptions)`}
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
                <td className="px-3 py-2 text-xs">PLC directory base URL.</td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">timeout</td>
                <td className="px-3 py-2 font-mono text-xs">number</td>
                <td className="px-3 py-2 font-mono text-xs">3000</td>
                <td className="px-3 py-2 text-xs">
                  Milliseconds before the fetch is aborted.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">fetch</td>
                <td className="px-3 py-2 font-mono text-xs">typeof fetch</td>
                <td className="px-3 py-2 font-mono text-xs">
                  globalThis.fetch
                </td>
                <td className="px-3 py-2 text-xs">
                  Override the global fetch (tests, custom transports).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Resolve
        </AnchorHeading>
        <CodeBlock code={`resolve(ref: string): Promise<KeyData>`} />
        <p className="mt-3 text-sm">
          <code className="font-mono">ref</code> is the string stored at{" "}
          <code className="font-mono">signature.key</code>. Bare{" "}
          <code className="font-mono">did:key:</code> references skip the fetch
          entirely; everything else is parsed as{" "}
          <code className="font-mono">{`<did>#<fragment>`}</code> and resolved
          against the appropriate DID document.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Supported key formats
        </AnchorHeading>
        <p className="mb-3 text-sm">
          The resolver reads both flavors of public-key material that
          atproto-flavored DID documents emit:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-text-muted dark:text-text-muted-dark">
          <li>
            <code className="font-mono">publicKeyMultibase</code> — parsed as
            the multibase portion of a{" "}
            <code className="font-mono">did:key:</code> string.
          </li>
          <li>
            <code className="font-mono">publicKeyJwk</code> — OKP keys (Ed25519)
            and EC keys (P-256, P-384, secp256k1) are recognized via{" "}
            <code className="font-mono">crv</code> /{" "}
            <code className="font-mono">alg</code>.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Example
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { FetchKeyResolver } from "@atiproto/key-resolver";

const keys = new FetchKeyResolver({
  plcUrl: "https://plc.directory",
  timeout: 5000,
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  keyResolver: keys.resolve,
});`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          For repeated verifications against the same signers, prefer{" "}
          <a
            href="/docs/key-resolver/EdgeKeyResolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            EdgeKeyResolver
          </a>{" "}
          so each DID document is fetched once per cache TTL rather than once
          per record.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/key-resolver/DidKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              DidKeyResolver
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
