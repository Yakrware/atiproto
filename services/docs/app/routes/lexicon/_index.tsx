import { Link, useRouteLoaderData } from "react-router";
import type { SearchEntry } from "~/lib/search";

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    query: "bg-badge-query/15 text-badge-query",
    procedure: "bg-badge-procedure/15 text-badge-procedure",
    record: "bg-badge-record/15 text-badge-record",
    "permission-set": "bg-badge-permission/15 text-badge-permission",
    object:
      "bg-surface-alt dark:bg-surface-alt-dark text-text-muted dark:text-text-muted-dark border border-border dark:border-border-dark",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] ?? ""}`}
    >
      {type === "procedure" ? "procedure" : type}
    </span>
  );
}

const PREFIXES = ["com.atiproto.", "network.attested."] as const;

function stripPrefix(nsid: string): string {
  for (const p of PREFIXES) {
    if (nsid.startsWith(p)) return nsid.slice(p.length);
  }
  return nsid;
}

export default function LexiconIndex() {
  const parentData = useRouteLoaderData("routes/index") as
    | { searchIndex: SearchEntry[] }
    | undefined;
  const entries = parentData?.searchIndex ?? [];

  const ours = entries.filter((e) => e.authority === "com.atiproto");
  const attested = entries.filter((e) => e.authority === "network.attested");

  const records = ours.filter((e) => e.type === "record");
  const objectDefs = ours.filter((e) => e.type === "object");
  const permissionSets = ours.filter((e) => e.type === "permission-set");
  const methods = ours.filter(
    (e) => e.type === "query" || e.type === "procedure",
  );
  const attestedRecords = attested.filter((e) => e.type === "record");
  const attestedObjectDefs = attested.filter((e) => e.type === "object");
  const attestedMethods = attested.filter(
    (e) => e.type === "query" || e.type === "procedure",
  );

  function groupByNamespace(items: SearchEntry[]): Map<string, SearchEntry[]> {
    const map = new Map<string, SearchEntry[]>();
    for (const entry of items) {
      const parts = stripPrefix(entry.nsid).split(".");
      parts.pop();
      const ns = parts.join(".") || "(root)";
      if (!map.has(ns)) map.set(ns, []);
      map.get(ns)!.push(entry);
    }
    return map;
  }

  const groups = groupByNamespace(methods);
  const attestedGroups = groupByNamespace(attestedMethods);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Lexicon Reference</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Full surface for the atiproto PoS (`com.atiproto.*`) plus the shared
        broker / attestation protocol (`network.attested.*`).
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Record Types</h2>
        <div className="grid gap-3">
          {records.map((entry) => (
            <Link
              key={entry.nsid}
              to={`/docs/lexicon/${entry.nsid}`}
              className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-medium">
                  {entry.nsid}
                </span>
                <TypeBadge type={entry.type} />
              </div>
              <p className="text-sm text-text-muted dark:text-text-muted-dark">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {objectDefs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Types</h2>
          <div className="grid gap-3">
            {objectDefs.map((entry) => (
              <Link
                key={entry.nsid}
                to={`/docs/lexicon/${entry.nsid}`}
                className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-medium">
                    {entry.nsid}
                  </span>
                  <TypeBadge type={entry.type} />
                </div>
                <p className="text-sm text-text-muted dark:text-text-muted-dark">
                  {entry.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {permissionSets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Permission Sets</h2>
          <div className="grid gap-3">
            {permissionSets.map((entry) => (
              <Link
                key={entry.nsid}
                to={`/docs/lexicon/${entry.nsid}`}
                className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-medium">
                    {entry.nsid}
                  </span>
                  <TypeBadge type={entry.type} />
                </div>
                <p className="text-sm text-text-muted dark:text-text-muted-dark">
                  {entry.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ns, nsEntries]) => (
          <section key={ns} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{ns}</h2>
            <div className="grid gap-3">
              {nsEntries.map((entry) => (
                <Link
                  key={entry.nsid}
                  to={`/docs/lexicon/${entry.nsid}`}
                  className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">
                      {entry.nsid}
                    </span>
                    <TypeBadge type={entry.type} />
                  </div>
                  <p className="text-sm text-text-muted dark:text-text-muted-dark">
                    {entry.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

      {(attestedRecords.length > 0 ||
        attestedObjectDefs.length > 0 ||
        attestedGroups.size > 0) && (
        <section className="mt-12 pt-8 border-t border-border dark:border-border-dark">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">network.attested</h2>
            <AuthorityBadge authority="network.attested" />
          </div>
          <p className="text-text-muted dark:text-text-muted-dark mb-6">
            Shared cross-party protocol vocabulary. Both brokers and
            point-of-sale services implement subsets of this namespace. We ship
            our proposed drafts here while we coordinate upstream with
            attested.network.
          </p>

          {attestedRecords.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Records</h3>
              <div className="grid gap-3">
                {attestedRecords.map((entry) => (
                  <Link
                    key={entry.nsid}
                    to={`/docs/lexicon/${entry.nsid}`}
                    className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">
                        {entry.nsid}
                      </span>
                      <TypeBadge type={entry.type} />
                    </div>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                      {entry.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {attestedObjectDefs.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Types</h3>
              <div className="grid gap-3">
                {attestedObjectDefs.map((entry) => (
                  <Link
                    key={entry.nsid}
                    to={`/docs/lexicon/${entry.nsid}`}
                    className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">
                        {entry.nsid}
                      </span>
                      <TypeBadge type={entry.type} />
                    </div>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark">
                      {entry.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {Array.from(attestedGroups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ns, nsEntries]) => (
              <section key={ns} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  {ns === "(root)"
                    ? "network.attested"
                    : `network.attested.${ns}`}
                </h3>
                <div className="grid gap-3">
                  {nsEntries.map((entry) => (
                    <Link
                      key={entry.nsid}
                      to={`/docs/lexicon/${entry.nsid}`}
                      className="block p-4 rounded-lg border border-border dark:border-border-dark hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">
                          {entry.nsid}
                        </span>
                        <TypeBadge type={entry.type} />
                      </div>
                      <p className="text-sm text-text-muted dark:text-text-muted-dark">
                        {entry.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </section>
      )}
    </div>
  );
}

function AuthorityBadge({
  authority,
}: {
  authority: "com.atiproto" | "network.attested";
}) {
  const isAttested = authority === "network.attested";
  const styles = isAttested
    ? "bg-primary/10 text-primary border-primary/40"
    : "bg-surface-alt dark:bg-surface-alt-dark text-text-muted dark:text-text-muted-dark border-border dark:border-border-dark";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${styles}`}>
      {authority}
    </span>
  );
}
