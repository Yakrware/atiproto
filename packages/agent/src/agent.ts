import { Agent as ApiAgent } from "@atproto/api";
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerObject,
  type FetchHandlerOptions,
} from "@atproto/xrpc";
import { schemas } from "@atiproto/lexicons";
import { ComNS } from "./namespaces/com.js";

// Mirrors @atproto/api's SessionManager interface; declared locally to avoid
// importing from @atproto/api's internal dist directory.
interface SessionManager extends FetchHandlerObject {
  readonly did?: string;
}

const SERVICE_DID = "did:web:atiproto.com";
const SERVICE_TYPE = "payments";

function createFetchHandler(client: XrpcClient): FetchHandler {
  if (client instanceof ApiAgent) {
    const proxied = client.withProxy(SERVICE_TYPE, SERVICE_DID);
    return (url, init) => proxied.fetchHandler(url, init);
  }

  return (url, init) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("atproto-proxy")) {
      headers.set("atproto-proxy", `${SERVICE_DID}#${SERVICE_TYPE}`);
    }
    return client.fetchHandler(url, { ...init, headers });
  };
}

type ComOf<T> = T extends { com: infer C extends object } ? C : {};

export class Agent<TClient extends XrpcClient = ApiAgent> extends XrpcClient {
  com: ComNS & ComOf<TClient>;

  constructor(options: TClient);
  constructor(options: SessionManager | FetchHandler | FetchHandlerOptions);
  constructor(
    options: SessionManager | XrpcClient | FetchHandler | FetchHandlerOptions,
  ) {
    const client =
      options instanceof XrpcClient ? options : new ApiAgent(options);

    super(createFetchHandler(client), schemas);

    this.com = new ComNS(this, client) as ComNS & ComOf<TClient>;

    // Root proxy: our own properties take priority, everything else falls
    // through to the underlying client.
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        return Reflect.get(client, prop, receiver);
      },
    });
  }
}
