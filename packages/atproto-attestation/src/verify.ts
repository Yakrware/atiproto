import { createAttestationCid, verifyBytes, type RecordMap } from "./crypto.js";
import { parseDidKey, type KeyData } from "./key.js";

const STRONG_REF_NSID = "com.atproto.repo.strongRef";

export type KeyResolver = (keyRef: string) => Promise<KeyData> | KeyData;
export type RecordResolver = (uri: string) => Promise<RecordMap> | RecordMap;

export interface VerifyInput {
  record: RecordMap;
  repository: string;
  /** Resolve `did:key:` (or other) references. Defaults to bare did:key parsing. */
  keyResolver?: KeyResolver;
  /** Resolve a strongRef URI to its proof record. Required for remote attestations. */
  recordResolver?: RecordResolver;
  /**
   * Record keys included in the canonical signing payload. Must match
   * what the signer used. Omit to verify against the whole record.
   */
  fields?: readonly string[];
  /**
   * Filter: only entries with this `role` are checked; the rest are
   * skipped. `valid` is `false` when nothing matches.
   */
  role?: string;
}

export interface VerifyEntryResult {
  index: number;
  $type: string;
  ok: boolean;
  reason?: string;
}

export interface VerifyResult {
  valid: boolean;
  entries: VerifyEntryResult[];
}

function asRecord(value: unknown): RecordMap | undefined {
  return value && typeof value === "object" ? (value as RecordMap) : undefined;
}

function defaultKeyResolver(ref: string): KeyData {
  if (!ref.startsWith("did:key:")) {
    throw new Error(`Default keyResolver only handles did:key (got: ${ref})`);
  }
  return parseDidKey(ref);
}

/**
 * Verify the attestations attached to a record's `signatures[]`.
 */
export async function verify({
  record,
  repository,
  keyResolver = defaultKeyResolver,
  recordResolver,
  fields,
  role,
}: VerifyInput): Promise<VerifyResult> {
  const signatures = Array.isArray(record.signatures)
    ? (record.signatures as unknown[])
    : [];

  const entries: VerifyEntryResult[] = [];
  for (let i = 0; i < signatures.length; i++) {
    const entry = asRecord(signatures[i]);
    const $type =
      entry && typeof entry.$type === "string" ? (entry.$type as string) : "";

    if (!entry || !$type) {
      entries.push({
        index: i,
        $type,
        ok: false,
        reason: "Entry is not an object with a $type",
      });
      continue;
    }

    try {
      if ($type === STRONG_REF_NSID) {
        if (!recordResolver) {
          throw new Error("Remote attestation requires input.recordResolver");
        }
        const uri = entry.uri;
        if (typeof uri !== "string" || uri.length === 0) {
          throw new Error("Remote attestation entry missing `uri`");
        }
        const proof = asRecord(await recordResolver(uri));
        if (!proof) throw new Error("Resolved proof was not an object");
        if (role !== undefined && proof.role !== role) continue;

        const computed = createAttestationCid(
          record,
          proof,
          repository,
          fields,
        );
        if (proof.cid !== computed.toString()) {
          throw new Error("Remote attestation CID mismatch");
        }
        entries.push({ index: i, $type, ok: true });
        continue;
      }

      if (role !== undefined && entry.role !== role) continue;

      const key = entry.key;
      const sig = entry.signature;
      if (typeof key !== "string") {
        throw new Error("Inline attestation missing `key`");
      }
      if (!(sig instanceof Uint8Array)) {
        throw new Error("Inline attestation `signature` must be a Uint8Array");
      }
      const keyData = await keyResolver(key);
      const computed = createAttestationCid(record, entry, repository, fields);
      const ok = verifyBytes(computed.bytes, sig, keyData);
      if (!ok) throw new Error("Signature did not verify");
      entries.push({ index: i, $type, ok: true });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      entries.push({ index: i, $type, ok: false, reason });
    }
  }

  return {
    valid: entries.length > 0 && entries.every((e) => e.ok),
    entries,
  };
}
