import { allSchemas, schemas } from "@atiproto/lexicons";

export interface NavItem {
  label: string;
  href?: string;
  type?: "query" | "procedure" | "record" | "permission-set" | "object";
  children?: NavItem[];
}

export interface SearchEntry {
  nsid: string;
  description: string;
  type: string;
  authority: "com.atiproto" | "network.attested";
}

const PREFIXES = ["com.atiproto.", "network.attested."] as const;

// Schemas pulled from upstream authorities purely as build-time refs
// (e.g. `com.atproto.repo.strongRef` via `goat lex pull`). Not part of our
// documented surface; the docs hide them.
function isVendoredDependency(nsid: string): boolean {
  return (
    !nsid.startsWith("com.atiproto.") && !nsid.startsWith("network.attested.")
  );
}

function stripPrefix(nsid: string): string {
  for (const p of PREFIXES) {
    if (nsid.startsWith(p)) return nsid.slice(p.length);
  }
  return nsid;
}

function getAuthority(nsid: string): "com.atiproto" | "network.attested" {
  return nsid.startsWith("network.attested.")
    ? "network.attested"
    : "com.atiproto";
}

function getMainDef(schema: (typeof allSchemas)[number]) {
  return schema.defs?.main as Record<string, unknown> | undefined;
}

function getType(def: Record<string, unknown>): string {
  return (def.type as string) ?? "unknown";
}

function getDescription(def: Record<string, unknown>): string {
  return (def.description as string) ?? "";
}

export function buildNavTree(): NavItem[] {
  const guides: NavItem[] = [
    { label: "Get Started", href: "/docs/get-started" },
    { label: "Checkout Flow", href: "/docs/checkout" },
    { label: "Stripe Connect", href: "/docs/stripe-connect" },
    { label: "Edge OAuth Client", href: "/docs/edge-oauth" },
  ];

  const packages: NavItem[] = [
    {
      label: "atproto-attestation",
      children: [
        { label: "Get Started", href: "/docs/atproto-attestation" },
        {
          label: "Attestation",
          href: "/docs/atproto-attestation/Attestation",
        },
        { label: "verify", href: "/docs/atproto-attestation/verify" },
        {
          label: "KeyResolver & RecordResolver",
          href: "/docs/atproto-attestation/resolvers",
        },
        {
          label: "did:key utilities",
          href: "/docs/atproto-attestation/keys",
        },
      ],
    },
  ];

  const edgePackages: NavItem[] = [
    {
      label: "edge-oauth-client",
      children: [
        { label: "Get Started", href: "/docs/edge-oauth-client" },
        {
          label: "EdgeOAuthClient",
          href: "/docs/edge-oauth-client/EdgeOAuthClient",
        },
        {
          label: "EdgeRuntimeImplementation",
          href: "/docs/edge-oauth-client/EdgeRuntimeImplementation",
        },
        {
          label: "getKeyset",
          href: "/docs/edge-oauth-client/getKeyset",
        },
        {
          label: "patchGlobalRequestObject",
          href: "/docs/edge-oauth-client/patchGlobalRequestObject",
        },
      ],
    },
    {
      label: "edge-resolvers",
      children: [
        { label: "Get Started", href: "/docs/edge-resolvers" },
        {
          label: "EdgeDidResolver",
          href: "/docs/edge-resolvers/EdgeDidResolver",
        },
        {
          label: "EdgeDidPlcResolver",
          href: "/docs/edge-resolvers/EdgeDidPlcResolver",
        },
        {
          label: "EdgeDidWebResolver",
          href: "/docs/edge-resolvers/EdgeDidWebResolver",
        },
        {
          label: "EdgeXrpcHandleResolver",
          href: "/docs/edge-resolvers/EdgeXrpcHandleResolver",
        },
        { label: "timed", href: "/docs/edge-resolvers/timed" },
        {
          label: "resolveHandles",
          href: "/docs/edge-resolvers/resolveHandles",
        },
      ],
    },
    {
      label: "kv-oauth-state-store",
      children: [
        { label: "Get Started", href: "/docs/kv-oauth-state-store" },
        {
          label: "KvStateStore",
          href: "/docs/kv-oauth-state-store/KvStateStore",
        },
        {
          label: "KvSessionStore",
          href: "/docs/kv-oauth-state-store/KvSessionStore",
        },
      ],
    },
    {
      label: "edge-resolver-cache",
      children: [
        { label: "Get Started", href: "/docs/edge-resolver-cache" },
        {
          label: "CacheApiStore",
          href: "/docs/edge-resolver-cache/CacheApiStore",
        },
        {
          label: "TieredStore",
          href: "/docs/edge-resolver-cache/TieredStore",
        },
        {
          label: "createDidCache",
          href: "/docs/edge-resolver-cache/createDidCache",
        },
        {
          label: "createHandleCache",
          href: "/docs/edge-resolver-cache/createHandleCache",
        },
      ],
    },
  ];

  const records: NavItem[] = [];
  const permissionSets: NavItem[] = [];
  // Group methods by namespace, but keep the two authorities separate so the
  // nav reflects that `network.attested.*` is an upstream protocol vocabulary,
  // not part of our PoS surface.
  const apiNamespaceMap = new Map<string, NavItem[]>();
  const attestedNamespaceMap = new Map<string, NavItem[]>();
  const attestedRecords: NavItem[] = [];
  const objectDefs: NavItem[] = [];
  const attestedObjectDefs: NavItem[] = [];

  for (const schema of allSchemas) {
    if (isVendoredDependency(schema.id)) continue;
    const def = getMainDef(schema);
    if (!def) continue;

    const type = getType(def);
    const shortId = stripPrefix(schema.id);
    const authority = getAuthority(schema.id);

    if (type === "record") {
      const entry: NavItem = {
        label: shortId,
        href: `/docs/lexicon/${schema.id}`,
        type: "record",
      };
      if (authority === "network.attested") {
        attestedRecords.push(entry);
      } else {
        records.push(entry);
      }
      continue;
    }

    if (type === "object") {
      const entry: NavItem = {
        label: shortId,
        href: `/docs/lexicon/${schema.id}`,
        type: "object",
      };
      if (authority === "network.attested") {
        attestedObjectDefs.push(entry);
      } else {
        objectDefs.push(entry);
      }
      continue;
    }

    if (type === "permission-set") {
      const title = (def.title as string) ?? shortId;
      permissionSets.push({
        label: title,
        href: `/docs/lexicon/${schema.id}`,
        type: "permission-set",
      });
      continue;
    }

    if (type !== "query" && type !== "procedure") continue;

    const parts = shortId.split(".");
    const method = parts.pop()!;
    const ns = parts.join(".") || "(root)";
    const map =
      authority === "network.attested" ? attestedNamespaceMap : apiNamespaceMap;

    if (!map.has(ns)) map.set(ns, []);
    map.get(ns)!.push({
      label: method,
      href: `/docs/lexicon/${schema.id}`,
      type: type as "query" | "procedure",
    });
  }

  const apiGroups: NavItem[] = Array.from(apiNamespaceMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ns, children]) => ({
      label: ns,
      children: children.sort((a, b) => a.label.localeCompare(b.label)),
    }));

  const attestedApiGroups: NavItem[] = Array.from(
    attestedNamespaceMap.entries(),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ns, children]) => ({
      label: ns,
      children: children.sort((a, b) => a.label.localeCompare(b.label)),
    }));

  const attestedChildren: NavItem[] = [];
  if (attestedRecords.length > 0) {
    attestedChildren.push({
      label: "Records",
      children: attestedRecords.sort((a, b) => a.label.localeCompare(b.label)),
    });
  }
  if (attestedObjectDefs.length > 0) {
    attestedChildren.push({
      label: "Types",
      children: attestedObjectDefs.sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    });
  }
  attestedChildren.push(...attestedApiGroups);

  const tree: NavItem[] = [
    { label: "Guides", children: guides },
    { label: "Packages", children: packages },
    { label: "Edge OAuth Packages", children: edgePackages },
    {
      label: "Record Types",
      children: records.sort((a, b) => a.label.localeCompare(b.label)),
    },
  ];

  if (objectDefs.length > 0) {
    tree.push({
      label: "Types",
      children: objectDefs.sort((a, b) => a.label.localeCompare(b.label)),
    });
  }

  tree.push(
    {
      label: "Permission Sets",
      children: permissionSets.sort((a, b) => a.label.localeCompare(b.label)),
    },
    { label: "API Reference", children: apiGroups },
  );

  if (attestedChildren.length > 0) {
    tree.push({
      label: "network.attested",
      children: attestedChildren,
    });
  }

  return tree;
}

export function buildSearchIndex(): SearchEntry[] {
  return allSchemas
    .filter((schema) => !isVendoredDependency(schema.id))
    .map((schema) => {
      const def = getMainDef(schema);
      return {
        nsid: schema.id,
        description: def ? getDescription(def) : "",
        type: def ? getType(def) : "unknown",
        authority: getAuthority(schema.id),
      };
    });
}

export function computeVersion(): string {
  const ids = allSchemas
    .filter((s) => !isVendoredDependency(s.id))
    .map((s) => s.id)
    .sort()
    .join(",");
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    hash = ((hash << 5) - hash + ids.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function findSchema(nsid: string) {
  return allSchemas.find((s) => s.id === nsid) ?? null;
}

export { allSchemas, schemas };
