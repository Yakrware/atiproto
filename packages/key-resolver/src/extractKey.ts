import { parseDidKey } from "@atiproto/atproto-attestation";
import type { DidDocument, KeyData, PublicKeyJwk } from "./types.js";

const JWK_ALG_TO_KEY_TYPE: Record<string, KeyData["type"]> = {
  ES256: "p256",
  ES256K: "k256",
  ES384: "p384",
  EdDSA: "ed25519",
};

const JWK_CRV_TO_KEY_TYPE: Record<string, KeyData["type"]> = {
  "P-256": "p256",
  "P-384": "p384",
  secp256k1: "k256",
  Ed25519: "ed25519",
};

function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4;
  const padded = pad === 0 ? input : input + "=".repeat(4 - pad);
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function jwkKeyType(jwk: PublicKeyJwk): KeyData["type"] {
  if (jwk.crv && JWK_CRV_TO_KEY_TYPE[jwk.crv]) {
    return JWK_CRV_TO_KEY_TYPE[jwk.crv];
  }
  if (jwk.alg && JWK_ALG_TO_KEY_TYPE[jwk.alg]) {
    return JWK_ALG_TO_KEY_TYPE[jwk.alg];
  }
  throw new Error(
    `Cannot determine key type from JWK (crv=${jwk.crv}, alg=${jwk.alg})`,
  );
}

function jwkEcToCompressed(jwk: PublicKeyJwk): Uint8Array {
  if (!jwk.x || !jwk.y) {
    throw new Error("EC JWK is missing x or y coordinate");
  }
  const x = base64UrlDecode(jwk.x);
  const y = base64UrlDecode(jwk.y);
  const yIsOdd = (y[y.length - 1] & 1) === 1;
  const out = new Uint8Array(x.length + 1);
  out[0] = yIsOdd ? 0x03 : 0x02;
  out.set(x, 1);
  return out;
}

/**
 * Pull a `KeyData` out of a verification method on a DID document.
 *
 * Looks up the method by either `${did}#${fragment}` or `#${fragment}`,
 * then decodes whichever public-key form is present
 * (`publicKeyMultibase` or `publicKeyJwk`).
 */
export function extractKeyFromDidDoc(
  doc: DidDocument,
  did: string,
  fragment: string,
): KeyData {
  const fullId = `${did}#${fragment}`;
  const method = doc.verificationMethod?.find(
    (m) => m.id === fullId || m.id === `#${fragment}`,
  );
  if (!method) {
    throw new Error(`No verification method '${fragment}' on ${did}`);
  }

  if (typeof method.publicKeyMultibase === "string") {
    return parseDidKey(`did:key:${method.publicKeyMultibase}`);
  }

  if (method.publicKeyJwk) {
    const jwk = method.publicKeyJwk;
    const type = jwkKeyType(jwk);
    if (jwk.kty === "OKP") {
      if (!jwk.x) throw new Error("OKP JWK is missing `x`");
      return { type, bytes: base64UrlDecode(jwk.x) };
    }
    if (jwk.kty === "EC") {
      return { type, bytes: jwkEcToCompressed(jwk) };
    }
    throw new Error(`Unsupported JWK kty: ${jwk.kty}`);
  }

  throw new Error(`No key material on verification method ${fullId}`);
}
