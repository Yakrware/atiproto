import { parseAtUri, type RecordMap } from "./types.js";

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
 * Resolves `at://` URIs to record values via an existing XRPC client.
 * Auth, retries, and proxying live on the client — this resolver just
 * routes the `com.atproto.repo.getRecord` call through it.
 */
export class AgentRecordResolver {
  constructor(private readonly agent: RecordResolverAgent) {}

  resolve = async (uri: string): Promise<RecordMap> => {
    const { repo, collection, rkey } = parseAtUri(uri);
    const res = await this.agent.call("com.atproto.repo.getRecord", {
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
