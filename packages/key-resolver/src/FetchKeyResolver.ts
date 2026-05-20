import { parseDidKey } from "@atiproto/atproto-attestation";
import { extractKeyFromDidDoc } from "./extractKey.js";
import type { DidDocument, KeyData } from "./types.js";

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

/**
 * Resolves keys by fetching the issuer's DID document over the network.
 *
 * Supports `did:key:` (no fetch — parsed locally), `did:plc:…#<fragment>`
 * (PLC directory), and `did:web:…#<fragment>` (well-known did.json). The
 * caller's reference string determines which fragment to extract from
 * the resolved document.
 */
export class FetchKeyResolver {
  private readonly plcUrl: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: FetchKeyResolverOptions = {}) {
    this.plcUrl = options.plcUrl ?? DEFAULT_PLC_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.fetchImpl = options.fetch ?? fetch;
  }

  /**
   * Fetch the raw DID document for a given DID. Exposed so that
   * EdgeKeyResolver (and other cache wrappers) can share the network
   * code path without re-implementing it.
   */
  fetchDidDocument = async (did: string): Promise<DidDocument> => {
    const url = this.docUrl(did);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await this.fetchImpl(url, {
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

  resolve = async (ref: string): Promise<KeyData> => {
    if (ref.startsWith("did:key:")) return parseDidKey(ref);

    const [did, fragment] = ref.split("#");
    if (!did || !fragment) {
      throw new Error(`Cannot resolve key without DID + fragment: ${ref}`);
    }
    const doc = await this.fetchDidDocument(did);
    return extractKeyFromDidDoc(doc, did, fragment);
  };

  private docUrl(did: string): string {
    if (did.startsWith("did:plc:")) {
      return `${this.plcUrl}/${did}`;
    }
    if (did.startsWith("did:web:")) {
      const host = did.slice("did:web:".length);
      return `https://${host}${DID_WEB_DOC_PATH}`;
    }
    throw new Error(`Unsupported DID method: ${did}`);
  }
}
