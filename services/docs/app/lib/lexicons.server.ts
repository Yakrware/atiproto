import { schemas } from "@atiproto/lexicons";

export interface NavItem {
  label: string;
  href?: string;
  type?: "query" | "procedure" | "record";
  children?: NavItem[];
}

export interface SearchEntry {
  nsid: string;
  description: string;
  type: string;
}

const PREFIX = "com.atiproto.";

function getMainDef(schema: (typeof schemas)[number]) {
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
  ];

  const records: NavItem[] = [];
  const namespaceMap = new Map<string, NavItem[]>();

  for (const schema of schemas) {
    const def = getMainDef(schema);
    if (!def) continue;

    const type = getType(def);
    const shortId = schema.id.startsWith(PREFIX)
      ? schema.id.slice(PREFIX.length)
      : schema.id;

    if (type === "record") {
      records.push({
        label: shortId,
        href: `/docs/lexicon/${schema.id}`,
        type: "record",
      });
      continue;
    }

    const parts = shortId.split(".");
    const method = parts.pop()!;
    const ns = parts.join(".");

    if (!namespaceMap.has(ns)) {
      namespaceMap.set(ns, []);
    }
    namespaceMap.get(ns)!.push({
      label: method,
      href: `/docs/lexicon/${schema.id}`,
      type: type as "query" | "procedure",
    });
  }

  const apiGroups: NavItem[] = Array.from(namespaceMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ns, children]) => ({
      label: ns,
      children: children.sort((a, b) => a.label.localeCompare(b.label)),
    }));

  return [
    { label: "Guides", children: guides },
    {
      label: "Record Types",
      children: records.sort((a, b) => a.label.localeCompare(b.label)),
    },
    { label: "API Reference", children: apiGroups },
  ];
}

export function buildSearchIndex(): SearchEntry[] {
  return schemas.map((schema) => {
    const def = getMainDef(schema);
    return {
      nsid: schema.id,
      description: def ? getDescription(def) : "",
      type: def ? getType(def) : "unknown",
    };
  });
}

export function computeVersion(): string {
  const ids = schemas.map((s) => s.id).sort().join(",");
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    hash = ((hash << 5) - hash + ids.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function findSchema(nsid: string) {
  return schemas.find((s) => s.id === nsid) ?? null;
}

export { schemas };
