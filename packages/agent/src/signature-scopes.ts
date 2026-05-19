/**
 * Collections whose records carry `signatures[]`. Each entry is the list
 * of record keys included in the canonical signing payload — the agent
 * hands this list to `Attestation.sign(...)` so the signed CID only
 * covers fields the lexicon actually protects.
 */
export const signature_scope_collections = {
  "com.atiproto.cart": [
    "subject",
    "items",
    "currency",
    "total",
    "status",
    "createdAt",
    "expiresAt",
    "completedAt",
    "payment",
  ],
  "com.atiproto.item": [
    "subject",
    "amount",
    "quantity",
    "status",
    "message",
    "createdAt",
    "completedAt",
  ],
  "com.atiproto.subscription": [
    "subject",
    "amount",
    "interval",
    "status",
    "message",
    "createdAt",
    "completedAt",
  ],
  "network.attested.payment": ["status", "broker", "subject", "createdAt"],
} as const;

export type SignatureScopes = keyof typeof signature_scope_collections;

export function hasSignatureScope(nsid: string): nsid is SignatureScopes {
  return nsid in signature_scope_collections;
}
