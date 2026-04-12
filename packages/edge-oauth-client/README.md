# @atiproto/edge-oauth-client

Edge-compatible ATProto OAuth client for Cloudflare Workers.

[![npm](https://img.shields.io/npm/v/@atiproto/edge-oauth-client)](https://www.npmjs.com/package/@atiproto/edge-oauth-client)

- [Documentation](https://atiproto.com/docs/edge-oauth)
- [GitHub](https://github.com/Yakrware/atiproto)

## Installation

```bash
npm install @atiproto/edge-oauth-client @atiproto/kv-oauth-state-store @atproto/oauth-client
```

## Usage

```typescript
import { EdgeOAuthClient, patchGlobalRequestObject } from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";

patchGlobalRequestObject();

const client = new EdgeOAuthClient({
  clientMetadata: {
    client_id: "https://your-app.example.com/oauth/client-metadata.json",
    client_name: "My App",
    client_uri: "https://your-app.example.com",
    redirect_uris: ["https://your-app.example.com/oauth/callback"],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  },
  stateStore: new KvStateStore(env.OAUTH_STATE_KV),
  sessionStore: new KvSessionStore(env.OAUTH_SESSION_KV),
});

// Start OAuth flow
const url = await client.authorize(handle, { scope: "atproto transition:generic" });

// Handle callback
const { session } = await client.callback(params);
```

See the [full documentation](https://atiproto.com/docs/edge-oauth) for wrangler configuration, authorization flow, session restoration, and custom resolvers.

## License

MIT
