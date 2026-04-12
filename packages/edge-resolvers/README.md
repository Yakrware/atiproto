# @atiproto/edge-resolvers

Edge-compatible DID and handle resolvers for Cloudflare Workers.

[![npm](https://img.shields.io/npm/v/@atiproto/edge-resolvers)](https://www.npmjs.com/package/@atiproto/edge-resolvers)

- [Documentation](https://atiproto.com/docs/edge-oauth)
- [GitHub](https://github.com/Yakrware/atiproto)

## Installation

```bash
npm install @atiproto/edge-resolvers
```

## Usage

```typescript
import { EdgeDidResolver, EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";

// DID resolution (did:plc and did:web)
const didResolver = new EdgeDidResolver({
  plcUrl: "https://plc.directory",
  timeout: 3000,
});
const doc = await didResolver.resolve("did:plc:example123");

// Handle resolution via XRPC
const handleResolver = new EdgeXrpcHandleResolver("https://public.api.bsky.app");
const did = await handleResolver.resolve("user.bsky.social");

// Use with EdgeOAuthClient
const oauthDidResolver = didResolver.asOAuthResolver();
```

## Resolvers

- **EdgeDidResolver** - Resolves `did:plc` and `did:web` using fetch (no Node.js HTTP)
- **EdgeXrpcHandleResolver** - Resolves handles via `com.atproto.identity.resolveHandle`
- **resolveHandles** - Batch-resolve multiple DIDs to handles with fault tolerance

## License

MIT
