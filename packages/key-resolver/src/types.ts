import type { KeyData, KeyResolver } from "@atiproto/atproto-attestation";

export type { KeyData, KeyResolver };

/**
 * Minimal structural DID document shape — enough to find a verification
 * method by id and read out the embedded key material.
 */
export interface DidDocument {
  id?: string;
  verificationMethod?: VerificationMethod[];
}

export interface VerificationMethod {
  id: string;
  type?: string;
  controller?: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: PublicKeyJwk;
}

export interface PublicKeyJwk {
  kty: string;
  alg?: string;
  crv?: string;
  x?: string;
  y?: string;
}
