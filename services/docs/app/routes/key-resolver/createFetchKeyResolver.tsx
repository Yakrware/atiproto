import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CreateFetchKeyResolverPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">createFetchKeyResolver</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/key-resolver
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Returns a KeyResolver that fetches the signer's DID document over HTTPS,
        then extracts the public key from the named verification method.
        Supports <code className="font-mono">did:key:</code> (no fetch, parsed
        locally), <code className="font-mono">did:plc:</code> (via the PLC
        directory), and <code className="font-mono">did:web:</code> (via{" "}
        <code className="font-mono">/.well-known/did.json</code>).
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`function createFetchKeyResolver(
  options?: FetchKeyResolverOptions,
): KeyResolver`}
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
          Supported key formats
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Reads both flavors of public-key material that atproto-flavored DID
          documents emit:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-text-muted dark:text-text-muted-dark">
          <li>
            <code className="font-mono">publicKeyMultibase</code>: parsed as the
            multibase portion of a <code className="font-mono">did:key:</code>{" "}
            string.
          </li>
          <li>
            <code className="font-mono">publicKeyJwk</code>: OKP keys (Ed25519)
            and EC keys (P-256, P-384, secp256k1) recognized via{" "}
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
import { createFetchKeyResolver } from "@atiproto/key-resolver";

const keyResolver = createFetchKeyResolver({
  plcUrl: "https://plc.directory",
  timeout: 5000,
});

const result = await verify({
  record,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  keyResolver,
});`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          For repeated verifications against the same signers, prefer{" "}
          <a
            href="/docs/key-resolver/createCachedKeyResolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            createCachedKeyResolver
          </a>{" "}
          so each DID document is fetched once per cache TTL rather than once
          per record.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          createDidDocumentFetcher
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Lower-level companion factory exported from the same module. Returns
          just the DID-document fetch step without the fragment-extraction
          logic, for callers that want to layer their own caching or extraction
          on top.
        </p>
        <CodeBlock
          code={`function createDidDocumentFetcher(
  options?: FetchKeyResolverOptions,
): (did: string) => Promise<DidDocument>`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/key-resolver/createDidKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createDidKeyResolver
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
