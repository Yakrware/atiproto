import { Link, useRouteLoaderData } from "react-router";
import type { SearchEntry } from "~/lib/search";

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    query: "bg-badge-query/15 text-badge-query",
    procedure: "bg-badge-procedure/15 text-badge-procedure",
    record: "bg-badge-record/15 text-badge-record",
    "permission-set": "bg-badge-permission/15 text-badge-permission",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] ?? ""}`}
    >
      {type === "procedure" ? "procedure" : type}
    </span>
  );
}

export default function LexiconIndex() {
  const parentData = useRouteLoaderData("routes/index") as
    | { searchIndex: SearchEntry[] }
    | undefined;
  const entries = parentData?.searchIndex ?? [];

  const records = entries.filter((e) => e.type === "record");
  const permissionSets = entries.filter((e) => e.type === "permission-set");
  const methods = entries.filter(
    (e) => e.type !== "record" && e.type !== "permission-set",
  );

  // Group methods by namespace
  const groups = new Map<string, SearchEntry[]>();
  for (const entry of methods) {
    const parts = entry.nsid.replace("com.atiproto.", "").split(".");
    parts.pop();
    const ns = parts.join(".");
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns)!.push(entry);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Lexicon Reference</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Complete API reference for the atiproto tipping and subscription
        service.
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
    </div>
  );
}
