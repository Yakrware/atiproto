export {
  Attestation,
  type AttestationAgent,
  type AttestationKeys,
  type AttestationOptions,
  type InlineAttestation,
  type RemoteAttestation,
  type SignatureEntry,
  type SignatureMetadata,
  type SignInput,
} from "./attestation.js";
export {
  verify,
  type KeyResolver,
  type RecordResolver,
  type VerifyEntryResult,
  type VerifyInput,
  type VerifyResult,
} from "./verify.js";
export {
  createAttestationCid,
  createDagCborCid,
  isAttestationCidString,
  normalizeSignature,
  signBytes,
  verifyBytes,
  type RecordMap,
} from "./crypto.js";
export {
  formatDidKey,
  formatPrivateMultibase,
  parseDidKey,
  parsePrivateMultibase,
  type KeyData,
  type KeyType,
} from "./key.js";
