import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function KeysPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">did:key utilities</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/atproto-attestation
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Parse and format <code className="font-mono">did:key:</code> identifiers
        and the multibase-encoded private-key strings the Attestation
        constructor accepts. Supports p256, p384, k256, and ed25519.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          KeyData
        </AnchorHeading>
        <CodeBlock
          code={`interface KeyData {
  type: "p256" | "p384" | "k256" | "ed25519";
  bytes: Uint8Array;     // raw key bytes (compressed point for EC; scalar for ed25519)
}`}
        />
        <p className="mt-3 text-sm">
          The common shape consumed by every API in this package. Public keys
          for EC curves are stored in SEC1 compressed form (33 bytes for
          p256/k256, 49 bytes for p384). Ed25519 keys are 32 bytes. Private keys
          are the raw scalar (32 bytes for p256/k256/ed25519, 48 bytes for
          p384).
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          parseDidKey / formatDidKey
        </AnchorHeading>
        <CodeBlock
          code={`function parseDidKey(didKey: string): KeyData
function formatDidKey(key: KeyData): string`}
        />
        <p className="mt-3 text-sm mb-3">
          Round-trip a public key through the{" "}
          <code className="font-mono">did:key:</code> encoding (multibase
          base58btc + multicodec prefix).
        </p>
        <CodeBlock
          code={`import { parseDidKey, formatDidKey } from "@atiproto/atproto-attestation";

const parsed = parseDidKey("did:key:zDnaeUKTWUXc1HDpGfKbEK4VRpw8FJVDExddoNqfJW3kJyqzn");
// parsed.type  === "p256"
// parsed.bytes is the compressed public key

const did = formatDidKey(parsed);
// did === "did:key:zDnaeUKTWUXc1HDpGfKbEK4VRpw8FJVDExddoNqfJW3kJyqzn"`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          parsePrivateMultibase / formatPrivateMultibase
        </AnchorHeading>
        <CodeBlock
          code={`function parsePrivateMultibase(mb: string): KeyData
function formatPrivateMultibase(key: KeyData): string`}
        />
        <p className="mt-3 text-sm mb-3">
          Same encoding scheme but with private-key multicodec prefixes. The
          Attestation constructor accepts either{" "}
          <code className="font-mono">parsePrivateMultibase</code> output (raw{" "}
          <code className="font-mono">KeyData</code>) or the multibase string
          itself.
        </p>
        <CodeBlock
          code={`import {
  formatPrivateMultibase,
  parsePrivateMultibase,
  Attestation,
} from "@atiproto/atproto-attestation";

// One-time setup: generate, encode, persist somewhere safe.
const priv = generateP256Key();                       // { type: "p256", bytes: <32 bytes> }
const stored = formatPrivateMultibase(priv);          // "z3u2en7t5LRb4G…"

// Later, in a worker / service:
const att = new Attestation({ privateKey: stored });
// equivalent to:
const att2 = new Attestation({ privateKey: parsePrivateMultibase(stored) });`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Multicodec table
        </AnchorHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border dark:border-border-dark">
            <thead>
              <tr className="bg-surface-alt dark:bg-surface-alt-dark">
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Key type
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Public prefix
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  Private prefix
                </th>
                <th className="px-3 py-2 text-left border-b border-border dark:border-border-dark font-medium">
                  JWS alg
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted dark:text-text-muted-dark">
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">p256</td>
                <td className="px-3 py-2 font-mono text-xs">0x8024</td>
                <td className="px-3 py-2 font-mono text-xs">0x8626</td>
                <td className="px-3 py-2 font-mono text-xs">ES256</td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">p384</td>
                <td className="px-3 py-2 font-mono text-xs">0x1200</td>
                <td className="px-3 py-2 font-mono text-xs">0x1301</td>
                <td className="px-3 py-2 font-mono text-xs">ES384</td>
              </tr>
              <tr className="border-b border-border dark:border-border-dark">
                <td className="px-3 py-2 font-mono text-xs">k256</td>
                <td className="px-3 py-2 font-mono text-xs">0xe701</td>
                <td className="px-3 py-2 font-mono text-xs">0x8126</td>
                <td className="px-3 py-2 font-mono text-xs">ES256K</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">ed25519</td>
                <td className="px-3 py-2 font-mono text-xs">0xed01</td>
                <td className="px-3 py-2 font-mono text-xs">0x8026</td>
                <td className="px-3 py-2 font-mono text-xs">EdDSA</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          P-384 cannot derive its public key from the private scalar alone in
          this package; supply both halves explicitly to the Attestation
          constructor.
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
