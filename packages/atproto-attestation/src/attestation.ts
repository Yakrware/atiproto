import { p256 } from "@noble/curves/nist";
import { secp256k1 } from "@noble/curves/secp256k1";
import { ed25519 } from "@noble/curves/ed25519";
import { createAttestationCid, signBytes, type RecordMap } from "./crypto.js";
import {
  formatDidKey,
  parseDidKey,
  parsePrivateMultibase,
  type KeyData,
} from "./key.js";

const DEFAULT_SIGNATURE_TYPE = "network.attested.signature";
const DEFAULT_PROOF_TYPE = "network.attested.proof";
const STRONG_REF_NSID = "com.atproto.repo.strongRef";

/** Inline signature, ready to be appended to `signatures[]`. */
export interface InlineAttestation {
  $type: string;
  key: string;
  cid: string;
  signature: Uint8Array;
  issuer?: string;
  issuedAt?: string;
  role?: string;
  [extra: string]: unknown;
}

/** Remote signature reference (strongRef to a `network.attested.proof`). */
export interface RemoteAttestation {
  $type: "com.atproto.repo.strongRef";
  uri: string;
  cid: string;
}

/** Union for "an entry stored on `record.signatures[]`". */
export type SignatureEntry = InlineAttestation | RemoteAttestation;

/** Metadata propagated into the signature/proof. */
export interface SignatureMetadata {
  issuer?: string;
  issuedAt?: string;
  role?: string;
  status?: string;
  [extra: string]: unknown;
}

export interface SignInput {
  record: RecordMap;
  repository: string;
  signatureType?: string;
  metadata?: SignatureMetadata;
  /**
   * Record keys included in the canonical signing payload. Omit to sign
   * the whole record (minus `signatures`).
   */
  fields?: readonly string[];
}

export interface AttestationKeys {
  privateKey: string | KeyData;
  /** Public did:key. Derived from the private key when omitted (not P-384). */
  publicKey?: string;
}

/**
 * Minimal XRPC-shaped agent the Attestation uses to write proof records.
 * Compatible with `@atiproto/agent.Agent` and `@atproto/xrpc.XrpcClient`.
 */
export interface AttestationAgent {
  /** Agent's repo DID; required when `agent` is supplied. */
  readonly did?: string;
  call(
    nsid: string,
    params?: unknown,
    data?: unknown,
  ): Promise<{ data: unknown }>;
}

export interface AttestationOptions extends AttestationKeys {
  signatureType?: string;
  proofType?: string;
  role?: string;
  issuer?: string;
  /**
   * When supplied, `sign()` writes a `network.attested.proof` record to
   * this agent's PDS and returns a `com.atproto.repo.strongRef` rather
   * than an inline signature. Without an agent, signatures are inline.
   */
  agent?: AttestationAgent;
}

function toKeyData(value: string | KeyData): KeyData {
  return typeof value === "string" ? parsePrivateMultibase(value) : value;
}

function derivePublicDidKey(privateKey: KeyData): string {
  let bytes: Uint8Array;
  switch (privateKey.type) {
    case "p256":
      bytes = p256.getPublicKey(privateKey.bytes);
      break;
    case "k256":
      bytes = secp256k1.getPublicKey(privateKey.bytes);
      break;
    case "ed25519":
      bytes = ed25519.getPublicKey(privateKey.bytes);
      break;
    case "p384":
      throw new Error(
        "Cannot derive P-384 public did:key; pass `publicKey` explicitly",
      );
  }
  return formatDidKey({ type: privateKey.type, bytes });
}

function asRecord(value: unknown): RecordMap | undefined {
  return value && typeof value === "object" ? (value as RecordMap) : undefined;
}

function strongRefRepo(uri: string): string | undefined {
  if (!uri.startsWith("at://")) return undefined;
  const rest = uri.slice("at://".length);
  const slash = rest.indexOf("/");
  return slash === -1 ? rest : rest.slice(0, slash);
}

/**
 * Signs records and produces signature entries (inline or remote) for
 * `signatures[]`. Verification lives on the standalone `verify()` export.
 *
 * `sign()` becomes async because the remote-proof path writes to the
 * configured agent's PDS.
 */
export class Attestation {
  readonly privateKey: KeyData;
  readonly publicKey: string;
  readonly signatureType: string;
  readonly proofType: string;
  readonly role?: string;
  readonly issuer?: string;
  readonly agent?: AttestationAgent;

  constructor(options: AttestationOptions) {
    this.privateKey = toKeyData(options.privateKey);
    this.publicKey = options.publicKey ?? derivePublicDidKey(this.privateKey);

    const parsed = parseDidKey(this.publicKey);
    if (parsed.type !== this.privateKey.type) {
      throw new Error(
        `Public/private key type mismatch (pub=${parsed.type}, priv=${this.privateKey.type})`,
      );
    }

    this.signatureType = options.signatureType ?? DEFAULT_SIGNATURE_TYPE;
    this.proofType = options.proofType ?? DEFAULT_PROOF_TYPE;
    this.role = options.role;
    this.issuer = options.issuer;
    this.agent = options.agent;
  }

  /**
   * Sign a record. Returns either an inline attestation or a strongRef to
   * a freshly written proof record, depending on whether an agent was
   * configured.
   */
  async sign({
    record,
    repository,
    signatureType,
    metadata: extraMetadata,
    fields,
  }: SignInput): Promise<SignatureEntry> {
    const remote = this.agent !== undefined;
    const $type = remote
      ? this.proofType
      : (signatureType ?? this.signatureType);

    // Inline metadata carries `key`; remote (proof) metadata does not — the
    // proof record's authority is the repo that hosts it. Both share the
    // optional issuer/issuedAt/role + extra fields. `$type` differs, so the
    // CID computed for inline vs remote attestations is intentionally
    // distinct.
    const metadata: RecordMap = { $type };
    if (!remote) metadata.key = this.publicKey;

    const issuer = extraMetadata?.issuer ?? this.issuer;
    const issuedAt = extraMetadata?.issuedAt;
    const role = extraMetadata?.role ?? this.role;
    if (issuer !== undefined) metadata.issuer = issuer;
    if (issuedAt !== undefined) metadata.issuedAt = issuedAt;
    if (role !== undefined) metadata.role = role;

    if (extraMetadata) {
      for (const [k, v] of Object.entries(extraMetadata)) {
        if (k === "issuer" || k === "issuedAt" || k === "role") continue;
        metadata[k] = v;
      }
    }

    const cid = createAttestationCid(record, metadata, repository, fields);

    if (remote) return this.writeProof(cid.toString(), metadata);

    const signature = signBytes(cid.bytes, this.privateKey);
    const entry: InlineAttestation = {
      $type,
      key: this.publicKey,
      cid: cid.toString(),
      signature,
    };
    if (issuer !== undefined) entry.issuer = issuer;
    if (issuedAt !== undefined) entry.issuedAt = issuedAt;
    if (role !== undefined) entry.role = role;
    if (extraMetadata) {
      for (const [k, v] of Object.entries(extraMetadata)) {
        if (k === "issuer" || k === "issuedAt" || k === "role") continue;
        entry[k] = v;
      }
    }
    return entry;
  }

  private async writeProof(
    contentCid: string,
    metadata: RecordMap,
  ): Promise<RemoteAttestation> {
    const agent = this.agent!;
    const repo = agent.did;
    if (!repo) {
      throw new Error("Attestation agent must expose a `did` to write proofs");
    }

    const proofRecord: RecordMap = { $type: this.proofType, cid: contentCid };
    if (metadata.issuer !== undefined) proofRecord.issuer = metadata.issuer;
    if (metadata.role !== undefined) proofRecord.role = metadata.role;
    if (metadata.status !== undefined) proofRecord.status = metadata.status;

    const res = await agent.call("com.atproto.repo.createRecord", undefined, {
      repo,
      collection: this.proofType,
      record: proofRecord,
    });
    const data = asRecord(res.data);
    if (!data || typeof data.uri !== "string" || typeof data.cid !== "string") {
      throw new Error("PDS did not return { uri, cid } for proof write");
    }
    return {
      $type: "com.atproto.repo.strongRef",
      uri: data.uri,
      cid: data.cid,
    };
  }

  /**
   * Sign and merge the entry into a copy of `input.record.signatures`.
   *
   * Re-sign detection: if an existing entry on `signatures[]` was issued
   * by THIS attestation (inline entries match by `key`, remote entries
   * match by the strongRef's authority DID), it is replaced in place
   * rather than appended. Old proof records are intentionally left in the
   * agent's repo so that prior strongRefs continue to resolve — version
   * dependence is part of the strongRef contract.
   */
  async signAndAppend<T extends RecordMap>(
    input: SignInput & { record: T },
  ): Promise<T & { signatures: unknown[] }> {
    const { record } = input;
    const entry = await this.sign(input);
    const prior = Array.isArray(record.signatures)
      ? (record.signatures as unknown[])
      : [];

    const replaceIdx = this.findOwnIndex({ signatures: prior });
    let next: unknown[];
    if (replaceIdx >= 0) {
      next = prior.slice();
      next[replaceIdx] = entry;
    } else {
      next = [...prior, entry];
    }

    return { ...record, signatures: next } as T & { signatures: unknown[] };
  }

  /**
   * Find an existing signature on `signatures[]` that was issued by us.
   * Inline match: `entry.key === this.publicKey`. Remote match: the
   * strongRef's authority DID equals our agent's DID (we wrote it).
   * Returns -1 when nothing matches.
   */
  findOwnIndex({ signatures }: { signatures: readonly unknown[] }): number {
    const agentDid = this.agent?.did;
    return signatures.findIndex((raw) => {
      const entry = asRecord(raw);
      if (!entry) return false;
      if (entry.$type === STRONG_REF_NSID) {
        return (
          typeof entry.uri === "string" &&
          !!agentDid &&
          strongRefRepo(entry.uri) === agentDid
        );
      }
      return entry.key === this.publicKey;
    });
  }
}
