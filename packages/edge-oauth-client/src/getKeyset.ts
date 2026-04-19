import { Keyset } from "@atproto/jwk";
import { JoseKey } from "@atproto/jwk-jose";

let cached: Promise<Keyset | null> | undefined;

/**
 * Builds a Keyset from a single private JWK (JSON string) and caches the
 * resulting Promise in module scope.
 *
 * A confidential OAuth client needs a stable signing key to authenticate at
 * the token endpoint. Parsing the JWK and constructing the Keyset are async
 * operations, so the Promise is memoized: subsequent calls reuse the same
 * Keyset for the lifetime of the Worker isolate, avoiding redundant key
 * parsing on every request. Passing an empty or undefined jwk resolves to
 * null, which signals a public client to the OAuth client.
 *
 * A module-level cache is appropriate because a Worker instance is expected
 * to serve exactly one client identity; multiple keysets per process are
 * not supported.
 */
export function getKeyset(jwk: string | undefined): Promise<Keyset | null> {
  if (cached) return cached;
  const raw = jwk?.trim();
  cached = raw
    ? JoseKey.fromJWK(raw).then((key) => new Keyset([key]))
    : Promise.resolve(null);
  return cached;
}
