# @atiproto/kv-oauth-state-store

Cloudflare KV-backed state and session stores for `@atproto/oauth-client`.

[![npm](https://img.shields.io/npm/v/@atiproto/kv-oauth-state-store)](https://www.npmjs.com/package/@atiproto/kv-oauth-state-store)

- [Documentation](https://atiproto.com/docs/edge-oauth)
- [GitHub](https://github.com/Yakrware/atiproto)

## Installation

```bash
npm install @atiproto/kv-oauth-state-store @atproto/oauth-client
```

## Usage

```typescript
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";

const stateStore = new KvStateStore(env.OAUTH_STATE_KV, {
  prefix: "oauth_state:",  // default
  ttlSeconds: 600,         // default: 10 minutes
});

const sessionStore = new KvSessionStore(env.OAUTH_SESSION_KV, {
  prefix: "oauth_session:", // default
  ttlSeconds: 604800,       // default: 7 days
});
```

Add KV bindings in your `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    { "binding": "OAUTH_STATE_KV", "id": "<your-kv-id>" },
    { "binding": "OAUTH_SESSION_KV", "id": "<your-kv-id>" }
  ]
}
```

## License

MIT
