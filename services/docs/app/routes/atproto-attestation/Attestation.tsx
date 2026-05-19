import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function AttestationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Attestation</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/atproto-attestation
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Wraps a key pair and produces signature entries for a record's{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          signatures[]
        </code>{" "}
        array. By default emits inline{" "}
        <a
          href="/docs/lexicon/network.attested.signature"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          network.attested.signature
        </a>{" "}
        entries; with an agent it writes proof records to that agent's PDS and
        emits strongRefs.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Constructor
        </AnchorHeading>
        <CodeBlock code={`new Attestation(options: AttestationOptions)`} />

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
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">privateKey</td>
                <td className="px-3 py-2 font-mono text-xs">
                  string | KeyData
                </td>
                <td className="px-3 py-2 text-xs">
                  Multibase string (e.g. <code className="font-mono">z…</code>)
                  or a raw <code className="font-mono">KeyData</code> object.
                  Supports p256, k256, p384, ed25519.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">publicKey?</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 text-xs">
                  <code className="font-mono">did:key:…</code>. Derived from
                  <code className="font-mono"> privateKey</code> when omitted
                  (P-384 must supply this explicitly).
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">role?</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 text-xs">
                  Default role to embed on every signature (e.g.{" "}
                  <code className="font-mono">"appview"</code>,{" "}
                  <code className="font-mono">"pos"</code>,{" "}
                  <code className="font-mono">"broker"</code>).
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">issuer?</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 text-xs">
                  Default issuer DID. Travels with the signature; useful when{" "}
                  <code className="font-mono">key</code> does not directly
                  identify the issuer.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">signatureType?</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 text-xs">
                  <code className="font-mono">$type</code> of the inline
                  signature record. Default{" "}
                  <code className="font-mono">network.attested.signature</code>.
                </td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">proofType?</td>
                <td className="px-3 py-2 font-mono text-xs">string</td>
                <td className="px-3 py-2 text-xs">
                  Collection NSID used for proof records when an agent is set.
                  Default{" "}
                  <code className="font-mono">network.attested.proof</code>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">agent?</td>
                <td className="px-3 py-2 font-mono text-xs">
                  AttestationAgent
                </td>
                <td className="px-3 py-2 text-xs">
                  XRPC-shaped client with <code className="font-mono">did</code>{" "}
                  and{" "}
                  <code className="font-mono">call(nsid, params, data)</code>.
                  When supplied, signatures become strongRefs pointing at proof
                  records the agent writes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          sign
        </AnchorHeading>
        <CodeBlock
          code={`sign(input: SignInput): Promise<SignatureEntry>

interface SignInput {
  record: RecordMap;                  // must include a $type
  repository: string;                 // DID that owns the record
  fields?: readonly string[];         // record keys to include in the canonical payload
  signatureType?: string;             // overrides the constructor default
  metadata?: SignatureMetadata;       // issuer, issuedAt, role, status, ...extras
}`}
        />
        <p className="mt-3 text-sm">
          Returns an inline{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            InlineAttestation
          </code>{" "}
          when no agent was configured. When an agent is configured, the proof
          record is written to its PDS and a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            RemoteAttestation
          </code>{" "}
          (a strongRef) is returned instead. The signed CID is{" "}
          <em>identical</em> between the two paths only when the metadata's{" "}
          <code className="font-mono">$type</code> matches — by design, inline
          and remote attestations are domain-separated.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          signAndAppend
        </AnchorHeading>
        <CodeBlock
          code={`signAndAppend<T extends RecordMap>(
  input: SignInput & { record: T }
): Promise<T & { signatures: unknown[] }>`}
        />
        <p className="mt-3 text-sm mb-3">
          Convenience helper that signs and returns a copy of the record with
          the new entry merged into{" "}
          <code className="font-mono">signatures[]</code>. If the array already
          contains an entry by <em>this</em> attestation, that entry is replaced
          in place rather than appended.
        </p>
        <p className="text-sm">
          <strong>Match rule:</strong> inline entries match if{" "}
          <code className="font-mono">entry.key === this.publicKey</code>.
          Remote entries match if the strongRef's authority DID equals the
          configured agent's <code className="font-mono">did</code>. Old proof
          records are intentionally left in the agent's repo so that prior
          strongRefs continue to resolve.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          findOwnIndex
        </AnchorHeading>
        <CodeBlock
          code={`findOwnIndex(args: { signatures: readonly unknown[] }): number`}
        />
        <p className="mt-3 text-sm">
          Returns the index of an existing signature on{" "}
          <code className="font-mono">signatures[]</code> that was issued by
          this attestation, or <code className="font-mono">-1</code> when none
          match. Used internally by{" "}
          <code className="font-mono">signAndAppend</code>; exposed for callers
          who want to inspect or manipulate signatures manually.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Inline example
        </AnchorHeading>
        <CodeBlock
          code={`import { Attestation } from "@atiproto/atproto-attestation";

const att = new Attestation({
  privateKey: "z3u2en7t5LRb4G…",
  role: "appview",
});

const entry = await att.sign({
  record: { $type: "com.atiproto.cart", items: [], currency: "USD", status: "open" },
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
});

// entry = {
//   $type: "network.attested.signature",
//   key: "did:key:zDnae…",
//   cid: "bafyrei…",
//   signature: Uint8Array(64),
//   role: "appview",
// }`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Agent-backed example
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Supply any object with a <code className="font-mono">did</code> and a{" "}
          <code className="font-mono">call(nsid, params, data)</code> method
          (e.g. an <code className="font-mono">@atproto/api</code> Agent or an{" "}
          <code className="font-mono">@atproto/xrpc</code> XrpcClient).
        </p>
        <CodeBlock
          code={`import { Attestation } from "@atiproto/atproto-attestation";
import { AtpAgent } from "@atproto/api";

const pdsAgent = new AtpAgent({ service: "https://my-pds.example" });
await pdsAgent.login({ identifier: "appview.bsky.team", password });

const att = new Attestation({
  privateKey: process.env.APPVIEW_SIGNING_KEY!,
  role: "appview",
  issuer: pdsAgent.did,
  agent: pdsAgent,        // writes proof records here
});

const entry = await att.sign({
  record: cartRecord,
  repository: "did:plc:recipient",
  fields: ["items", "currency", "status"],
});

// entry = {
//   $type: "com.atproto.repo.strongRef",
//   uri: "at://did:plc:appview/network.attested.proof/3lab…",
//   cid: "bafyrei…",
// }`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/atproto-attestation/verify"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              verify
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
          <li>
            <a
              href="/docs/atproto-attestation/keys"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              did:key utilities
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
