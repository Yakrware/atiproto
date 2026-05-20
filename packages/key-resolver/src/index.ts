export { createDidKeyResolver } from "./createDidKeyResolver.js";
export {
  createFetchKeyResolver,
  createDidDocumentFetcher,
  type DidDocumentFetcher,
  type FetchKeyResolverOptions,
} from "./createFetchKeyResolver.js";
export {
  createCachedKeyResolver,
  type CachedKeyResolverOptions,
} from "./createCachedKeyResolver.js";
export { extractKeyFromDidDoc } from "./extractKey.js";
export type {
  DidDocument,
  KeyData,
  KeyResolver,
  PublicKeyJwk,
  VerificationMethod,
} from "./types.js";
