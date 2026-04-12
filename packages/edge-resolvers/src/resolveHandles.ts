import { EdgeDidResolver } from "./EdgeDidResolver.js";

/**
 * Batch-resolve multiple DIDs to handles.
 * Uses Promise.allSettled for fault tolerance — failed resolutions
 * fall back to the DID string.
 */
export async function resolveHandles(
  dids: string[],
  resolver: EdgeDidResolver = new EdgeDidResolver(),
): Promise<Map<string, string>> {
  const unique = [...new Set(dids)];
  const results = new Map<string, string>();

  const settled = await Promise.allSettled(
    unique.map(async (did) => {
      const handle = await resolver.resolveHandle(did);
      return { did, handle };
    }),
  );

  for (const result of settled) {
    if (result.status === "fulfilled") {
      results.set(result.value.did, result.value.handle);
    }
  }

  for (const did of unique) {
    if (!results.has(did)) {
      results.set(did, did);
    }
  }

  return results;
}
