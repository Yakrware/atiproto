import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function AtprotoAttestationIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">atproto-attestation</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Sign and verify ATProto records with{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          did:key
        </code>{" "}
        signatures over a canonical DAG-CBOR CID. Produces inline{" "}
        <a
          href="/docs/lexicon/network.attested.signature"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          network.attested.signature
        </a>{" "}
        entries, or (with an agent) remote{" "}
        <a
          href="/docs/lexicon/network.attested.proof"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          network.attested.proof
        </a>{" "}
        records referenced via{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          com.atproto.repo.strongRef
        </code>
        .
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Installation
        </AnchorHeading>
        <CodeBlock
          language="bash"
          code="npm install @atiproto/atproto-attestation"
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          This package is consumed directly by{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atiproto/agent
          </code>
          . Install it directly when you need to sign or verify records outside
          of an agent context (e.g. in a worker that produces AppView
          attestations).
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Quick start
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Sign a cart record on the AppView side and verify it from the consumer
          side.
        </p>
        <CodeBlock
          code={`import { Attestation, verify } from "@atiproto/atproto-attestation";

const att = new Attestation({
  privateKey,                              // multibase string OR { type, bytes }
  publicKey: "did:key:zDnae...",           // optional; derived from privateKey
  role: "appview",
  issuer: "did:web:appview.example",
});

const fields = ["items", "currency", "status", "total"];

const signedCart = await att.signAndAppend({
  record: cartRecord,
  repository: "did:plc:recipient",         // DID that will own the record
  fields,                                  // restrict to the lexicon-protected fields
});

// On the consumer side:
const result = await verify({
  record: signedCart,
  repository: "did:plc:recipient",
  fields,
});

if (!result.valid) {
  console.warn("attestation failed", result.entries);
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Inline vs remote attestations
        </AnchorHeading>
        <p className="mb-3 text-sm">
          <strong>Inline</strong> attestations carry the signature bytes
          directly on the record's{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            signatures[]
          </code>
          . They are self-contained and verify offline given the signer's public
          key.
        </p>
        <p className="mb-3 text-sm">
          <strong>Remote</strong> attestations replace the inline entry with a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            com.atproto.repo.strongRef
          </code>{" "}
          pointing at a separately-stored{" "}
          <a
            href="/docs/lexicon/network.attested.proof"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            network.attested.proof
          </a>{" "}
          record. To produce a remote attestation, pass an agent to the
          constructor. The agent is used to{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            createRecord
          </code>{" "}
          the proof on its PDS. The strongRef's authority comes from the repo
          hosting it, not from the signature bytes, so verifying remote entries
          requires a{" "}
          <a
            href="/docs/atproto-attestation/resolvers"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            recordResolver
          </a>
          .
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Fields
        </AnchorHeading>
        <p className="mb-3 text-sm">
          By default the canonical signing payload covers the entire record
          (minus the{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            signatures
          </code>{" "}
          field). Pass{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            fields
          </code>{" "}
          to restrict the payload to a specific set of record keys. This is what
          the agent does on a record-write so that ancillary fields (e.g.
          server-side annotations) can change without breaking the signature.
          The verifier must use the same field list.
        </p>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          When called from{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            @atiproto/agent
          </code>
          , the field list is sourced from{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            signature_scope_collections
          </code>{" "}
          for the record's collection.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          API
        </AnchorHeading>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="/docs/atproto-attestation/Attestation"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              Attestation
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              Sign records inline or via an agent-backed proof record.
            </span>
          </li>
          <li>
            <a
              href="/docs/atproto-attestation/verify"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              verify
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              Standalone verifier. No keys required at module init.
            </span>
          </li>
          <li>
            <a
              href="/docs/atproto-attestation/resolvers"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              KeyResolver &amp; RecordResolver
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              Plug in DID-doc keys and PDS-hosted proof records.
            </span>
          </li>
          <li>
            <a
              href="/docs/atproto-attestation/keys"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              did:key utilities
            </a>{" "}
            <span className="text-text-muted dark:text-text-muted-dark">
              Parse and format did:key and private-key multibase strings.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
