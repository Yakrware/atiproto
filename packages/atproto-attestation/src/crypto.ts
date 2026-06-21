import * as dagCbor from "@ipld/dag-cbor";
import { sha256 } from "@noble/hashes/sha2";
import { p256 } from "@noble/curves/nist";
import { p384 } from "@noble/curves/nist";
import { secp256k1 } from "@noble/curves/secp256k1";
import { ed25519 } from "@noble/curves/ed25519";
import { CID } from "multiformats/cid";
import * as Digest from "multiformats/hashes/digest";
import type { KeyData, KeyType } from "./key.js";

const DAG_CBOR_CODEC = 0x71;
const MULTIHASH_SHA256 = 0x12;

export type RecordMap = { [key: string]: unknown };

function curveFor(type: KeyType) {
  switch (type) {
    case "p256":
      return p256;
    case "p384":
      return p384;
    case "k256":
      return secp256k1;
    case "ed25519":
      throw new Error("ed25519 uses a separate code path");
  }
}

export function createDagCborCid(value: unknown): CID {
  const bytes = dagCbor.encode(value);
  const digest = Digest.create(MULTIHASH_SHA256, sha256(bytes));
  return CID.createV1(DAG_CBOR_CODEC, digest);
}

/**
 * Build the canonical signing payload's CID for a record + metadata pair.
 *
 * Mirrors `create_attestation_cid` from the Rust reference: strips
 * `signatures` from the record, strips `cid` and `signature` from the
 * metadata, inserts `repository`, sets `$sig = metadata`, then DAG-CBOR
 * hashes the result.
 *
 * When `fields` is provided, only those record keys are kept in the
 * canonical payload (alongside `$type` and `$sig`). Omitting `fields`
 * preserves the Rust-reference behavior of signing the whole record.
 */
export function createAttestationCid(
  record: RecordMap,
  metadata: RecordMap,
  repository: string,
  fields?: readonly string[],
): CID {
  if (
    typeof record.$type !== "string" ||
    (record.$type as string).length === 0
  ) {
    throw new Error("record is missing $type");
  }
  if (
    typeof metadata.$type !== "string" ||
    (metadata.$type as string).length === 0
  ) {
    throw new Error("attestation metadata is missing $type");
  }

  const preparedMetadata: RecordMap = { ...metadata };
  delete preparedMetadata.cid;
  delete preparedMetadata.signature;
  preparedMetadata.repository = repository;

  let preparedRecord: RecordMap;
  if (fields) {
    preparedRecord = { $type: record.$type, $sig: preparedMetadata };
    for (const f of fields) {
      if (f in record && f !== "signatures") preparedRecord[f] = record[f];
    }
  } else {
    preparedRecord = { ...record };
    delete preparedRecord.signatures;
    preparedRecord.$sig = preparedMetadata;
  }

  return createDagCborCid(preparedRecord);
}

export function isAttestationCidString(value: string): boolean {
  try {
    const cid = CID.parse(value);
    return (
      cid.version === 1 &&
      cid.code === DAG_CBOR_CODEC &&
      cid.multihash.code === MULTIHASH_SHA256 &&
      cid.multihash.digest.length === 32
    );
  } catch {
    return false;
  }
}

/**
 * Low-S normalization for ECDSA on P-256 / K-256. P-384 and Ed25519 pass
 * through unchanged.
 */
export function normalizeSignature(raw: Uint8Array, type: KeyType): Uint8Array {
  if (type !== "p256" && type !== "k256") return raw;
  if (raw.length !== 64) {
    throw new Error(
      `Unexpected ECDSA signature length ${raw.length}; expected 64`,
    );
  }
  const curve = curveFor(type);
  const sig = curve.Signature.fromBytes(raw, "compact");
  const normalized = sig.hasHighS() ? sig.normalizeS() : sig;
  return normalized.toBytes("compact");
}

/**
 * Sign the bytes of an attestation CID with the given private key. The CID
 * bytes are SHA-256 hashed externally (matching `@atproto/crypto` and the
 * Rust reference) before being passed to ECDSA. Output is the 64-byte
 * low-S compact signature for ECDSA, raw bytes for Ed25519.
 */
export function signBytes(
  payload: Uint8Array,
  privateKey: KeyData,
): Uint8Array {
  if (privateKey.type === "ed25519") {
    return ed25519.sign(payload, privateKey.bytes);
  }
  const curve = curveFor(privateKey.type);
  const digest = sha256(payload);
  const sig = curve.sign(digest, privateKey.bytes, {
    lowS: privateKey.type !== "p384",
  });
  return normalizeSignature(sig.toBytes("compact"), privateKey.type);
}

export function verifyBytes(
  payload: Uint8Array,
  signature: Uint8Array,
  publicKey: KeyData,
): boolean {
  try {
    if (publicKey.type === "ed25519") {
      return ed25519.verify(signature, payload, publicKey.bytes);
    }
    const curve = curveFor(publicKey.type);
    const digest = sha256(payload);
    return curve.verify(signature, digest, publicKey.bytes, {
      lowS: publicKey.type !== "p384",
      format: "compact",
    });
  } catch {
    return false;
  }
}
