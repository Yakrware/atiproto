import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function ResolversPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        KeyResolver &amp; RecordResolver
      </h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/atproto-attestation
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Two pluggable functions used by{" "}
        <a
          href="/docs/atproto-attestation/verify"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          verify
        </a>
        . They fetch verification material that lives outside the
        record. Ready-made implementations ship in the{" "}
        <a
          href="/docs/key-resolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          @atiproto/key-resolver
        </a>{" "}
        and{" "}
        <a
          href="/docs/record-resolver"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          @atiproto/record-resolver
        </a>{" "}
        packages.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          KeyResolver
        </AnchorHeading>
        <CodeBlock
          code={`type KeyResolver = (keyRef: string) => Promise<KeyData> | KeyData;

interface KeyData {
  type: "p256" | "p384" | "k256" | "ed25519";
  bytes: Uint8Array;
}`}
        />
        <p className="mt-3 text-sm">
          Called for every inline signature entry. The argument is the
          string stored at{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            signature.key
          </code>
          , typically a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            did:key:…
          </code>{" "}
          but in principle anything your protocol uses (DID + key id,
          JWK URL, etc).
        </p>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          The verifier's default resolver only understands bare{" "}
          <code className="font-mono">did:key:</code> strings. Use one
          of the prebuilt factories in{" "}
          <a
            href="/docs/key-resolver"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            @atiproto/key-resolver
          </a>{" "}
          to verify against keys hosted in a DID document.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h3" className="text-base font-semibold mb-3">
          Prebuilt KeyResolvers
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/key-resolver/createDidKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createDidKeyResolver
            </a>
            : local-only parser for{" "}
            <code className="font-mono">did:key:</code> references.
          </li>
          <li>
            <a
              href="/docs/key-resolver/createFetchKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchKeyResolver
            </a>
            : fetches the DID document from the PLC directory or did:web
            host.
          </li>
          <li>
            <a
              href="/docs/key-resolver/createCachedKeyResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createCachedKeyResolver
            </a>
            : caches the fetched DID document, suitable for repeated
            verification on edge runtimes.
          </li>
        </ul>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedKeyResolver } from "@atiproto/key-resolver";

const keyResolver = createCachedKeyResolver();

await verify({
  record,
  repository,
  fields,
  keyResolver,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          RecordResolver
        </AnchorHeading>
        <CodeBlock
          code={`type RecordResolver = (uri: string) => Promise<RecordMap> | RecordMap;

type RecordMap = { [key: string]: unknown };`}
        />
        <p className="mt-3 text-sm">
          Called for every strongRef entry on{" "}
          <code className="font-mono">signatures[]</code>. Given an{" "}
          <code className="font-mono">at://</code> URI, return the proof
          record stored at that location. The returned record must
          include its <code className="font-mono">$type</code>{" "}
          (typically{" "}
          <code className="font-mono">network.attested.proof</code>) and
          the <code className="font-mono">cid</code> field that the
          verifier compares against the recomputed canonical CID.
        </p>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Without a <code className="font-mono">recordResolver</code>,
          remote attestations fail with{" "}
          <code className="font-mono">
            "Remote attestation requires input.recordResolver"
          </code>
          .
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h3" className="text-base font-semibold mb-3">
          Prebuilt RecordResolvers
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/record-resolver/createFetchRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createFetchRecordResolver
            </a>
            : plain fetch against a configurable relay or PDS.
          </li>
          <li>
            <a
              href="/docs/record-resolver/createAgentRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createAgentRecordResolver
            </a>
            : routes <code className="font-mono">getRecord</code>{" "}
            through an existing XRPC-shaped client.
          </li>
          <li>
            <a
              href="/docs/record-resolver/createCachedRecordResolver"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              createCachedRecordResolver
            </a>
            : cached fetch. Safe because proof records are
            content-addressed and never mutate in place.
          </li>
        </ul>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedRecordResolver } from "@atiproto/record-resolver";

const recordResolver = createCachedRecordResolver();

await verify({
  record,
  repository,
  fields,
  recordResolver,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Full example
        </AnchorHeading>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { createCachedKeyResolver } from "@atiproto/key-resolver";
import { createCachedRecordResolver } from "@atiproto/record-resolver";

const keyResolver = createCachedKeyResolver();
const recordResolver = createCachedRecordResolver();

const result = await verify({
  record: cart,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  keyResolver,
  recordResolver,
});`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Custom resolvers
        </AnchorHeading>
        <p className="text-sm">
          Both types are plain functions. If the prebuilt factories
          don't fit (e.g. you need a custom key reference format, or
          your proof records are mirrored to a non-XRPC store), write
          your own. Any function matching the shape above works.
        </p>
      </section>
    </div>
  );
}
