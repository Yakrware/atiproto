import { parseAtUri, type RecordMap, type RecordResolver } from "./types.js";

/**
 * Minimal XRPC-shaped agent. Matches `@atiproto/agent.Agent`,
 * `@atproto/api.Agent`, and bare `@atproto/xrpc.XrpcClient`.
 */
export interface RecordResolverAgent {
  call(
    nsid: string,
    params?: unknown,
    data?: unknown,
  ): Promise<{ data: unknown }>;
}

/**
 * Builds a RecordResolver that routes `getRecord` through an existing
 * XRPC client. Auth, retries, and proxying live on the client.
 */
export function createAgentRecordResolver(
  agent: RecordResolverAgent,
): RecordResolver {
  return async (uri) => {
    const { repo, collection, rkey } = parseAtUri(uri);
    const res = await agent.call("com.atproto.repo.getRecord", {
      repo,
      collection,
      rkey,
    });
    const data = res.data as { value?: RecordMap } | undefined;
    if (!data?.value || typeof data.value !== "object") {
      throw new Error(`getRecord response missing value: ${uri}`);
    }
    return data.value;
  };
}
