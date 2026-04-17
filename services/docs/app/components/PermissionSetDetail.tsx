import { Link } from "react-router";

interface Permission {
  type: string;
  resource: string;
  collection?: string[];
  lxm?: string[];
  inheritAud?: boolean;
}

export function PermissionSetDetail({
  mainDef,
}: {
  mainDef: Record<string, unknown>;
}) {
  const title = mainDef.title as string | undefined;
  const detail = mainDef.detail as string | undefined;
  const permissions = (mainDef.permissions as Permission[]) ?? [];

  const repoPerms = permissions.filter((p) => p.resource === "repo");
  const rpcPerms = permissions.filter((p) => p.resource === "rpc");

  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {detail && (
        <p className="text-text-muted dark:text-text-muted-dark">{detail}</p>
      )}

      {repoPerms.map((perm, i) => (
        <section key={`repo-${i}`} className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Record Collections</h3>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
            Grants read/write access to these record collections in the user's
            PDS:
          </p>
          <div className="grid gap-1.5">
            {perm.collection?.map((col) => (
              <Link
                key={col}
                to={`/docs/lexicon/${col}`}
                className="font-mono text-sm text-primary dark:text-primary-dark hover:underline"
              >
                {col}
              </Link>
            ))}
          </div>
        </section>
      ))}

      {rpcPerms.map((perm, i) => (
        <section key={`rpc-${i}`} className="mt-4">
          <h3 className="text-lg font-semibold mb-3">RPC Endpoints</h3>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">
            Grants access to call these endpoints
            {perm.inheritAud ? " (inherits audience from the auth token)" : ""}:
          </p>
          <div className="grid gap-1.5">
            {perm.lxm?.map((endpoint) => (
              <Link
                key={endpoint}
                to={`/docs/lexicon/${endpoint}`}
                className="font-mono text-sm text-primary dark:text-primary-dark hover:underline"
              >
                {endpoint}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
