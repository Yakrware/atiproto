import { base58btc } from "multiformats/bases/base58";

export type KeyType = "p256" | "p384" | "k256" | "ed25519";

export interface KeyData {
  type: KeyType;
  bytes: Uint8Array;
}

interface CodecEntry {
  type: KeyType;
  kind: "public" | "private";
  prefix: Uint8Array;
}

const CODECS: CodecEntry[] = [
  { type: "p256", kind: "public", prefix: new Uint8Array([0x80, 0x24]) },
  { type: "p256", kind: "private", prefix: new Uint8Array([0x86, 0x26]) },
  { type: "p384", kind: "public", prefix: new Uint8Array([0x12, 0x00]) },
  { type: "p384", kind: "private", prefix: new Uint8Array([0x13, 0x01]) },
  { type: "k256", kind: "public", prefix: new Uint8Array([0xe7, 0x01]) },
  { type: "k256", kind: "private", prefix: new Uint8Array([0x81, 0x26]) },
  { type: "ed25519", kind: "public", prefix: new Uint8Array([0xed, 0x01]) },
  { type: "ed25519", kind: "private", prefix: new Uint8Array([0x80, 0x26]) },
];

function startsWith(bytes: Uint8Array, prefix: Uint8Array): boolean {
  if (bytes.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix[i]) return false;
  }
  return true;
}

function findCodec(
  bytes: Uint8Array,
  kind: "public" | "private",
): CodecEntry | undefined {
  return CODECS.find((c) => c.kind === kind && startsWith(bytes, c.prefix));
}

function decodeMultibase(value: string): Uint8Array {
  return base58btc.decode(value);
}

function encodeMultibase(bytes: Uint8Array): string {
  return base58btc.encode(bytes);
}

export function parseDidKey(didKey: string): KeyData {
  if (!didKey.startsWith("did:key:")) {
    throw new Error(`Not a did:key: ${didKey}`);
  }
  const mb = didKey.slice("did:key:".length);
  const decoded = decodeMultibase(mb);
  const codec = findCodec(decoded, "public");
  if (!codec) {
    throw new Error(`Unknown public key codec for did:key`);
  }
  return { type: codec.type, bytes: decoded.slice(codec.prefix.length) };
}

export function formatDidKey(key: KeyData): string {
  const codec = CODECS.find((c) => c.type === key.type && c.kind === "public");
  if (!codec) throw new Error(`Unsupported key type: ${key.type}`);
  const combined = new Uint8Array(codec.prefix.length + key.bytes.length);
  combined.set(codec.prefix, 0);
  combined.set(key.bytes, codec.prefix.length);
  return `did:key:${encodeMultibase(combined)}`;
}

export function parsePrivateMultibase(mb: string): KeyData {
  const decoded = decodeMultibase(mb);
  const codec = findCodec(decoded, "private");
  if (!codec) {
    throw new Error(`Unknown private key codec`);
  }
  return { type: codec.type, bytes: decoded.slice(codec.prefix.length) };
}

export function formatPrivateMultibase(key: KeyData): string {
  const codec = CODECS.find((c) => c.type === key.type && c.kind === "private");
  if (!codec) throw new Error(`Unsupported key type: ${key.type}`);
  const combined = new Uint8Array(codec.prefix.length + key.bytes.length);
  combined.set(codec.prefix, 0);
  combined.set(key.bytes, codec.prefix.length);
  return encodeMultibase(combined);
}
