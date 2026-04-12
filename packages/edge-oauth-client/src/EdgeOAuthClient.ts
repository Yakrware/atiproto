import { OAuthClient, type OAuthClientOptions } from "@atproto/oauth-client";
import {
  EdgeDidResolver,
  EdgeXrpcHandleResolver,
} from "@atiproto/edge-resolvers";
import { EdgeRuntimeImplementation } from "./EdgeRuntimeImplementation.js";

export interface EdgeOAuthClientOptions extends Omit<
  OAuthClientOptions,
  "stateStore" | "sessionStore" | "responseMode" | "runtimeImplementation"
> {
  stateStore: OAuthClientOptions["stateStore"];
  sessionStore: OAuthClientOptions["sessionStore"];
  responseMode?: OAuthClientOptions["responseMode"];
  runtimeImplementation?: OAuthClientOptions["runtimeImplementation"];
}

/**
 * Edge-compatible ATProto OAuth client for Cloudflare Workers.
 *
 * Provides sensible defaults for edge runtimes: edge DID resolvers,
 * XRPC handle resolution, and WebCrypto runtime.
 * All defaults can be overridden via the options.
 */
export class EdgeOAuthClient extends OAuthClient {
  constructor(options: EdgeOAuthClientOptions) {
    super({
      ...options,
      responseMode: options.responseMode ?? "query",
      didResolver:
        options.didResolver ?? new EdgeDidResolver().asOAuthResolver(),
      handleResolver: options.handleResolver ?? new EdgeXrpcHandleResolver(),
      fetch:
        options.fetch ??
        ((input, init) => {
          if (init?.redirect === "error") init.redirect = "follow";
          return fetch(input, init);
        }),
      runtimeImplementation:
        options.runtimeImplementation ?? new EdgeRuntimeImplementation(),
    });
  }
}
