import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function VerifyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">verify</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/atproto-attestation
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Standalone verifier. Walks a record's{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          signatures[]
        </code>{" "}
        and checks each entry. Returns a structured result rather than throwing
        — callers decide whether a partial pass is acceptable.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`verify(input: VerifyInput): Promise<VerifyResult>

interface VerifyInput {
  record: RecordMap;
  repository: string;                    // DID that owns the record
  fields?: readonly string[];            // must match what the signer used
  role?: string;                         // filter to a specific role
  keyResolver?: KeyResolver;             // defaults to did:key parsing
  recordResolver?: RecordResolver;       // required for remote entries
}

interface VerifyResult {
  valid: boolean;                        // true iff every checked entry verified
  entries: VerifyEntryResult[];
}

interface VerifyEntryResult {
  index: number;
  $type: string;
  ok: boolean;
  reason?: string;                       // populated when ok is false
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          What is verified
        </AnchorHeading>
        <ul className="list-disc list-inside text-sm space-y-2 text-text-muted dark:text-text-muted-dark">
          <li>
            For an <strong>inline</strong> entry: the CID is recomputed over the
            record + the entry's own metadata + the supplied{" "}
            <code className="font-mono">repository</code>, and the attached
            ECDSA / Ed25519 signature is verified against the public key
            resolved from <code className="font-mono">entry.key</code>.
          </li>
          <li>
            For a <strong>remote</strong> entry (
            <code className="font-mono">com.atproto.repo.strongRef</code>
            ): the proof record is fetched via{" "}
            <code className="font-mono">recordResolver</code>, the CID is
            recomputed, and <code className="font-mono">proof.cid</code> must
            equal it. Authority comes from the repo hosting the proof — there
            are no signature bytes to check.
          </li>
          <li>
            When <code className="font-mono">role</code> is supplied, entries
            whose role does not match are skipped, not failed. Inline entries
            are matched on <code className="font-mono">entry.role</code>; remote
            entries on <code className="font-mono">proof.role</code>.
          </li>
          <li>
            <code className="font-mono">valid</code> is{" "}
            <code className="font-mono">false</code> when the after-filter set
            is empty.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Examples
        </AnchorHeading>

        <h3 className="text-sm font-semibold mt-2 mb-2">Inline only</h3>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";

const result = await verify({
  record: cart,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
});

if (!result.valid) {
  for (const e of result.entries) {
    if (!e.ok) console.warn(\`#\${e.index} (\${e.$type}): \${e.reason}\`);
  }
}`}
        />

        <h3 className="text-sm font-semibold mt-6 mb-2">
          Require an AppView signature
        </h3>
        <CodeBlock
          code={`const appViewOk = await verify({
  record: cart,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  role: "appview",
});

if (!appViewOk.valid) throw new Error("missing or bad AppView attestation");`}
        />

        <h3 className="text-sm font-semibold mt-6 mb-2">
          Inline + remote, with resolvers
        </h3>
        <CodeBlock
          code={`import { verify } from "@atiproto/atproto-attestation";
import { didDocKeyResolver, fetchProofRecord } from "./resolvers";

const result = await verify({
  record: cart,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
  keyResolver: didDocKeyResolver,
  recordResolver: fetchProofRecord,
});`}
        />
        <p className="mt-3 text-sm">
          See{" "}
          <a
            href="/docs/atproto-attestation/resolvers"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            KeyResolver &amp; RecordResolver
          </a>{" "}
          for the resolver shapes and worked implementations.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Why a structured result
        </AnchorHeading>
        <p className="text-sm">
          The verifier reports per-entry rather than throwing because real
          records carry multiple attestations (PoS, AppView, broker) and partial
          validity is often what callers want — e.g. accept a cart whose PoS
          signature is good, even if a stale AppView signature is left over.
          Callers can collapse the result to a boolean via{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            result.valid
          </code>{" "}
          when strictness is needed.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/atproto-attestation/Attestation"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              Attestation
            </a>
          </li>
          <li>
            <a
              href="/docs/atproto-attestation/resolvers"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              KeyResolver &amp; RecordResolver
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
