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
        </a>{" "}
        to fetch verification material that lives outside the record itself.
        Both are async-or-sync; return a value or a promise of one.
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
          Called for every inline signature entry. The argument is the string
          stored at{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            signature.key
          </code>{" "}
          — typically a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-xs font-mono">
            did:key:…
          </code>{" "}
          but in principle anything your protocol uses (DID + key id, JWK URL,
          etc).
        </p>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          The default resolver only understands bare{" "}
          <code className="font-mono">did:key:</code> strings. Supply a custom
          resolver to verify against keys hosted in a DID document (PLC or DID
          Web).
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h3" className="text-base font-semibold mb-3">
          Example: DID-document resolver
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Accepts both bare <code className="font-mono">did:key:</code> strings
          (fast path) and <code className="font-mono">did:plc:…#sigKey</code>{" "}
          style references that need a fetch.
        </p>
        <CodeBlock
          code={`import {
  parseDidKey,
  type KeyResolver,
  type KeyData,
} from "@atiproto/atproto-attestation";

const KEY_TYPE_BY_ALG: Record<string, KeyData["type"]> = {
  ES256: "p256",
  ES256K: "k256",
  ES384: "p384",
  EdDSA: "ed25519",
};

export const didDocKeyResolver: KeyResolver = async (ref) => {
  // Fast path: did:key is self-describing.
  if (ref.startsWith("did:key:")) return parseDidKey(ref);

  // ref is something like did:plc:abc#signing-key
  const [did, fragment] = ref.split("#");
  if (!fragment) throw new Error(\`Cannot resolve key without fragment: \${ref}\`);

  const docUrl = did.startsWith("did:plc:")
    ? \`https://plc.directory/\${did}\`
    : did.startsWith("did:web:")
      ? \`https://\${did.slice("did:web:".length)}/.well-known/did.json\`
      : (() => { throw new Error(\`Unsupported DID method: \${did}\`); })();

  const doc = await fetch(docUrl).then((r) => r.json());
  const method = doc.verificationMethod?.find(
    (m: { id: string }) => m.id === \`\${did}#\${fragment}\` || m.id === \`#\${fragment}\`,
  );
  if (!method) throw new Error(\`No verification method \${fragment} on \${did}\`);

  // Atproto-flavored DID docs embed did:key in publicKeyMultibase OR JWK.
  if (typeof method.publicKeyMultibase === "string") {
    return parseDidKey(\`did:key:\${method.publicKeyMultibase}\`);
  }
  if (method.publicKeyJwk?.kty === "OKP") {
    return {
      type: "ed25519",
      bytes: base64UrlDecode(method.publicKeyJwk.x),
    };
  }
  if (method.publicKeyJwk?.kty === "EC") {
    const type = KEY_TYPE_BY_ALG[method.publicKeyJwk.alg ?? "ES256"];
    if (!type) throw new Error(\`Unsupported alg: \${method.publicKeyJwk.alg}\`);
    return { type, bytes: jwkEcToCompressed(method.publicKeyJwk) };
  }
  throw new Error(\`No key material on verification method \${ref}\`);
};

// (base64UrlDecode and jwkEcToCompressed are implementation details — pick
// your favorite crypto util library.)`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Cache aggressively in production. DID resolution is not free and
          verification is called once per signature entry per record.
        </p>
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
          <code className="font-mono">at://</code> URI, return the proof record
          stored at that location. The returned record must include its{" "}
          <code className="font-mono">$type</code> (typically{" "}
          <code className="font-mono">network.attested.proof</code>) and the{" "}
          <code className="font-mono">cid</code> field that the verifier
          compares against the recomputed canonical CID.
        </p>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Without a <code className="font-mono">recordResolver</code>, remote
          attestations fail with{" "}
          <code className="font-mono">
            "Remote attestation requires input.recordResolver"
          </code>
          .
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h3" className="text-base font-semibold mb-3">
          Example: minimal XRPC resolver
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Resolves{" "}
          <code className="font-mono">at://{`{repo}/{collection}/{rkey}`}</code>{" "}
          via <code className="font-mono">com.atproto.repo.getRecord</code>. The
          PDS endpoint can be looked up from the repo's DID document; this
          example assumes a single trusted relay endpoint for brevity.
        </p>
        <CodeBlock
          code={`import type { RecordResolver, RecordMap } from "@atiproto/atproto-attestation";

const RELAY = "https://bsky.network";

export const fetchProofRecord: RecordResolver = async (uri) => {
  // uri: at://did:plc:.../network.attested.proof/<tid>
  const [, , rest] = uri.split("/", 3);
  const path = uri.slice("at://".length);
  const [repo, collection, rkey] = path.split("/");
  if (!repo || !collection || !rkey) {
    throw new Error(\`Malformed strongRef URI: \${uri}\`);
  }

  const url = new URL("/xrpc/com.atproto.repo.getRecord", RELAY);
  url.searchParams.set("repo", repo);
  url.searchParams.set("collection", collection);
  url.searchParams.set("rkey", rkey);

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(\`getRecord \${repo}/\${collection}/\${rkey} -> \${res.status}\`);
  }
  const body = (await res.json()) as { value: RecordMap };
  return body.value;
};`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h3" className="text-base font-semibold mb-3">
          Example: agent-backed resolver
        </AnchorHeading>
        <p className="mb-3 text-sm">
          If you already have an <code className="font-mono">@atproto/api</code>{" "}
          agent or an <code className="font-mono">@atproto/xrpc</code>{" "}
          XrpcClient handy, route the call through it so auth, retries, and
          proxying stay consistent.
        </p>
        <CodeBlock
          code={`import type { RecordResolver, RecordMap } from "@atiproto/atproto-attestation";
import type { XrpcClient } from "@atproto/xrpc";

export function makeAgentRecordResolver(client: XrpcClient): RecordResolver {
  return async (uri) => {
    const path = uri.slice("at://".length).split("/");
    const [repo, collection, rkey] = path;
    const res = await client.call("com.atproto.repo.getRecord", {
      repo,
      collection,
      rkey,
    });
    return (res.data as { value: RecordMap }).value;
  };
}`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Like the key resolver, cache by URI when possible. Proof records are
          content-addressed so a hit is always safe.
        </p>
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
