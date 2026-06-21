import type { RecordMap, RecordResolver } from "@atiproto/atproto-attestation";

export type { RecordMap, RecordResolver };

/**
 * Parsed pieces of an `at://{repo}/{collection}/{rkey}` URI.
 */
export interface ParsedAtUri {
  repo: string;
  collection: string;
  rkey: string;
}

export function parseAtUri(uri: string): ParsedAtUri {
  if (!uri.startsWith("at://")) {
    throw new Error(`Not an at:// URI: ${uri}`);
  }
  const [repo, collection, rkey] = uri.slice("at://".length).split("/");
  if (!repo || !collection || !rkey) {
    throw new Error(`Malformed at:// URI: ${uri}`);
  }
  return { repo, collection, rkey };
}
