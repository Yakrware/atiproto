# @atiproto/edge-resolver-cache

Tiered edge cache (Cloudflare Cache API + in-memory) for ATProto DID and handle resolvers on Cloudflare Workers.

[![npm](https://img.shields.io/npm/v/@atiproto/edge-resolver-cache)](https://www.npmjs.com/package/@atiproto/edge-resolver-cache)

- [Documentation](https://atiproto.com/docs/edge-resolver-cache)
- [GitHub](https://github.com/Yakrware/atiproto)

## Installation

```bash
npm install @atiproto/edge-resolver-cache
```

## Usage

Use with `@atiproto/edge-oauth-client` to add resolver caching:

```typescript
import { EdgeOAuthClient } from "@atiproto/edge-oauth-client";
import { createDidCache, createHandleCache } from "@atiproto/edge-resolver-cache";

const client = new EdgeOAuthClient({
  clientMetadata: { /* ... */ },
  stateStore: myStateStore,
  sessionStore: mySessionStore,
  didCache: createDidCache(),
  handleCache: createHandleCache(),
});
```

### Cache tiers

Each factory returns a `SimpleStore` with two tiers:

| Tier | Backend | Latency | Lifetime | Cost |
|------|---------|---------|----------|------|
| L1 | In-memory (`SimpleStoreMemory`) | ~0ms | Worker isolate lifetime | Free |
| L2 | Cloudflare Cache API | <1ms | Regional, survives isolate restarts | Free |

### Default TTLs

| Cache | L1 (memory) | L2 (Cache API) |
|-------|-------------|----------------|
| DID documents | 1 hour, ~50MB max | 24 hours |
| Handle resolution | 10 minutes, 1000 entries max | 1 hour |

### Using individual components

```typescript
import { CacheApiSimpleStore, TieredSimpleStore } from "@atiproto/edge-resolver-cache";
import { SimpleStoreMemory } from "@atproto-labs/simple-store-memory";

// Cache API store only (no memory tier)
const cacheOnly = new CacheApiSimpleStore({
  prefix: "my-prefix:",
  ttlSeconds: 3600,
  cacheName: "my-cache",
});

// Custom tiered configuration
const tiered = new TieredSimpleStore(
  new SimpleStoreMemory({ max: 500, ttl: 300_000 }),
  new CacheApiSimpleStore({ prefix: "custom:", ttlSeconds: 7200 }),
);
```

## License

MIT
