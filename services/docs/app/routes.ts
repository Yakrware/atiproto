import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("docs", "routes/index.tsx", [
    index("routes/_index.tsx"),
    route("get-started", "routes/get-started.tsx"),
    route("checkout", "routes/checkout.tsx"),
    route("stripe-connect", "routes/stripe-connect.tsx"),
    route("edge-oauth", "routes/edge-oauth.tsx"),
    route("lexicon", "routes/lexicon/_index.tsx"),
    route("lexicon/:nsid", "routes/lexicon/$nsid.tsx"),
    route("api/search", "routes/api/search.tsx"),
  ]),
] satisfies RouteConfig;
