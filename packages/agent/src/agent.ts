import { Agent as ApiAgent } from "@atproto/api";
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from "@atproto/xrpc";
import { schemas } from "@atiproto/lexicons";
import { ComNS } from "./namespaces/com.js";

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

export class Agent extends XrpcClient {
  com: ComNS;

  constructor(options: XrpcClient | FetchHandler | FetchHandlerOptions) {
    const client =
      options instanceof XrpcClient ? options : new ApiAgent(options);

    super(createFetchHandler(client), schemas);

    this.com = new ComNS(this);

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        return Reflect.get(client, prop, receiver);
      },
    });
  }
}
