import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("docs", "routes/index.tsx", [
    index("routes/_index.tsx"),
    route("get-started", "routes/get-started.tsx"),
    route("checkout", "routes/checkout.tsx"),
    route("stripe-connect", "routes/stripe-connect.tsx"),
    route("edge-oauth", "routes/edge-oauth.tsx"),

    // atproto-attestation
    route("atproto-attestation", "routes/atproto-attestation/_index.tsx"),
    route(
      "atproto-attestation/Attestation",
      "routes/atproto-attestation/Attestation.tsx",
    ),
    route(
      "atproto-attestation/verify",
      "routes/atproto-attestation/verify.tsx",
    ),
    route(
      "atproto-attestation/resolvers",
      "routes/atproto-attestation/resolvers.tsx",
    ),
    route("atproto-attestation/keys", "routes/atproto-attestation/keys.tsx"),

    // key-resolver
    route("key-resolver", "routes/key-resolver/_index.tsx"),
    route(
      "key-resolver/DidKeyResolver",
      "routes/key-resolver/DidKeyResolver.tsx",
    ),
    route(
      "key-resolver/FetchKeyResolver",
      "routes/key-resolver/FetchKeyResolver.tsx",
    ),
    route(
      "key-resolver/EdgeKeyResolver",
      "routes/key-resolver/EdgeKeyResolver.tsx",
    ),

    // record-resolver
    route("record-resolver", "routes/record-resolver/_index.tsx"),
    route(
      "record-resolver/FetchRecordResolver",
      "routes/record-resolver/FetchRecordResolver.tsx",
    ),
    route(
      "record-resolver/AgentRecordResolver",
      "routes/record-resolver/AgentRecordResolver.tsx",
    ),
    route(
      "record-resolver/EdgeRecordResolver",
      "routes/record-resolver/EdgeRecordResolver.tsx",
    ),

    // edge-oauth-client
    route("edge-oauth-client", "routes/edge-oauth-client/_index.tsx"),
    route(
      "edge-oauth-client/EdgeOAuthClient",
      "routes/edge-oauth-client/EdgeOAuthClient.tsx",
    ),
    route(
      "edge-oauth-client/EdgeRuntimeImplementation",
      "routes/edge-oauth-client/EdgeRuntimeImplementation.tsx",
    ),
    route(
      "edge-oauth-client/getKeyset",
      "routes/edge-oauth-client/getKeyset.tsx",
    ),
    route(
      "edge-oauth-client/patchGlobalRequestObject",
      "routes/edge-oauth-client/patchGlobalRequestObject.tsx",
    ),

    // edge-resolvers
    route("edge-resolvers", "routes/edge-resolvers/_index.tsx"),
    route(
      "edge-resolvers/EdgeDidResolver",
      "routes/edge-resolvers/EdgeDidResolver.tsx",
    ),
    route(
      "edge-resolvers/EdgeDidPlcResolver",
      "routes/edge-resolvers/EdgeDidPlcResolver.tsx",
    ),
    route(
      "edge-resolvers/EdgeDidWebResolver",
      "routes/edge-resolvers/EdgeDidWebResolver.tsx",
    ),
    route(
      "edge-resolvers/EdgeXrpcHandleResolver",
      "routes/edge-resolvers/EdgeXrpcHandleResolver.tsx",
    ),
    route("edge-resolvers/timed", "routes/edge-resolvers/timed.tsx"),
    route(
      "edge-resolvers/resolveHandles",
      "routes/edge-resolvers/resolveHandles.tsx",
    ),

    // kv-oauth-state-store
    route("kv-oauth-state-store", "routes/kv-oauth-state-store/_index.tsx"),
    route(
      "kv-oauth-state-store/KvStateStore",
      "routes/kv-oauth-state-store/KvStateStore.tsx",
    ),
    route(
      "kv-oauth-state-store/KvSessionStore",
      "routes/kv-oauth-state-store/KvSessionStore.tsx",
    ),

    // edge-resolver-cache
    route("edge-resolver-cache", "routes/edge-resolver-cache/_index.tsx"),
    route(
      "edge-resolver-cache/CacheApiStore",
      "routes/edge-resolver-cache/CacheApiStore.tsx",
    ),
    route(
      "edge-resolver-cache/TieredStore",
      "routes/edge-resolver-cache/TieredStore.tsx",
    ),
    route(
      "edge-resolver-cache/createDidCache",
      "routes/edge-resolver-cache/createDidCache.tsx",
    ),
    route(
      "edge-resolver-cache/createHandleCache",
      "routes/edge-resolver-cache/createHandleCache.tsx",
    ),

    route("lexicon", "routes/lexicon/_index.tsx"),
    route("lexicon/:nsid", "routes/lexicon/$nsid.tsx"),
    route("api/search", "routes/api/search.tsx"),
  ]),
] satisfies RouteConfig;
