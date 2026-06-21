import { parseDidKey } from "@atiproto/atproto-attestation";
import { extractKeyFromDidDoc } from "./extractKey.js";
import type { DidDocument, KeyResolver } from "./types.js";

export interface FetchKeyResolverOptions {
  /** PLC directory base URL. Default: `https://plc.directory`. */
  plcUrl?: string;
  /** Request timeout in milliseconds. Default: `3000`. */
  timeout?: number;
  /** Override the global `fetch` (for tests, custom transports). */
  fetch?: typeof fetch;
}

const DEFAULT_PLC_URL = "https://plc.directory";
const DEFAULT_TIMEOUT = 3000;
const DID_WEB_DOC_PATH = "/.well-known/did.json";

export type DidDocumentFetcher = (did: string) => Promise<DidDocument>;

function docUrl(did: string, plcUrl: string): string {
  if (did.startsWith("did:plc:")) {
    return `${plcUrl}/${did}`;
  }
  if (did.startsWith("did:web:")) {
    return `https://${did.slice("did:web:".length)}${DID_WEB_DOC_PATH}`;
  }
  throw new Error(`Unsupported DID method: ${did}`);
}

/**
 * Builds a low-level fetcher for DID documents. Exposed so that
 * `createCachedKeyResolver` (and custom cache wrappers) can share the
 * network code path.
 */
export function createDidDocumentFetcher(
  options: FetchKeyResolverOptions = {},
): DidDocumentFetcher {
  const plcUrl = options.plcUrl ?? DEFAULT_PLC_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const fetchImpl = options.fetch ?? fetch;

  return async (did) => {
    const url = docUrl(did, plcUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetchImpl(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { accept: "application/did+ld+json,application/json" },
      });
      if (!res.ok) {
        throw new Error(`DID resolution failed (${url} -> ${res.status})`);
      }
      return (await res.json()) as DidDocument;
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Builds a KeyResolver that fetches the issuer's DID document over the
 * network. Supports `did:key:` (no fetch, parsed locally), `did:plc:`
 * (PLC directory), and `did:web:` (well-known did.json). The
 * reference's fragment determines which verification method to read.
 */
export function createFetchKeyResolver(
  options: FetchKeyResolverOptions = {},
): KeyResolver {
  const fetchDoc = createDidDocumentFetcher(options);
  return async (ref) => {
    if (ref.startsWith("did:key:")) return parseDidKey(ref);
    const [did, fragment] = ref.split("#");
    if (!did || !fragment) {
      throw new Error(`Cannot resolve key without DID + fragment: ${ref}`);
    }
    const doc = await fetchDoc(did);
    return extractKeyFromDidDoc(doc, did, fragment);
  };
}
