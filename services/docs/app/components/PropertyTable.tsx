import { Link } from "react-router";

const LEXICON_PREFIX = "com.atiproto.";

interface Property {
  name: string;
  type: string;
  required: boolean;
  format?: string;
  ref?: string;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  arrayItems?: { type: string; ref?: string; refs?: string[] };
}

interface PropertyTableProps {
  properties: Property[];
}

function isLinkableRef(ref: string): boolean {
  return ref.startsWith(LEXICON_PREFIX) && !ref.startsWith("#");
}

function RefLink({ ref: refId }: { ref: string }) {
  if (isLinkableRef(refId)) {
    return (
      <Link
        to={`/docs/lexicon/${refId}`}
        className="text-primary dark:text-primary-dark hover:underline"
      >
        {refId}
      </Link>
    );
  }
  return <>{refId}</>;
}

function TypeDisplay({ prop }: { prop: Property }) {
  // Enum values
  if (prop.enum) {
    return <>{prop.enum.map((e) => `"${e}"`).join(" | ")}</>;
  }

  // Array with item details
  if (prop.type === "array" && prop.arrayItems) {
    const items = prop.arrayItems;
    if (items.type === "ref" && items.ref) {
      return (
        <>
          {"array<"}
          <RefLink ref={items.ref} />
          {">"}
        </>
      );
    }
    if (items.type === "union" && items.refs) {
      return (
        <>
          {"array<"}
          {items.refs.map((r, i) => (
            <span key={r}>
              {i > 0 && " | "}
              <RefLink ref={r} />
            </span>
          ))}
          {">"}
        </>
      );
    }
    return <>array&lt;{items.type}&gt;</>;
  }

  // Plain ref
  if (prop.type === "ref" && prop.ref) {
    return <RefLink ref={prop.ref} />;
  }

  // Basic type with format
  let t = prop.type;
  if (prop.format && prop.type !== "ref") t = `${t} (${prop.format})`;
  return <>{t}</>;
}

export function PropertyTable({ properties }: PropertyTableProps) {
  if (properties.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border dark:border-border-dark text-left">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Required</th>
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr
              key={prop.name}
              className="border-b border-border/50 dark:border-border-dark/50"
            >
              <td className="py-2 pr-4 font-mono text-xs">{prop.name}</td>
              <td className="py-2 pr-4 font-mono text-xs text-primary dark:text-primary-dark">
                <TypeDisplay prop={prop} />
              </td>
              <td className="py-2 pr-4">
                {prop.required ? (
                  <span className="text-badge-record text-xs font-medium">
                    required
                  </span>
                ) : (
                  <span className="text-text-muted dark:text-text-muted-dark text-xs">
                    optional
                  </span>
                )}
              </td>
              <td className="py-2 text-text-muted dark:text-text-muted-dark text-xs">
                {prop.description}
                {(prop.minimum !== undefined || prop.maximum !== undefined) && (
                  <span className="ml-1 text-primary dark:text-primary-dark">
                    {prop.minimum !== undefined && prop.maximum !== undefined
                      ? `(range: ${prop.minimum}–${prop.maximum})`
                      : prop.minimum !== undefined
                        ? `(min: ${prop.minimum})`
                        : `(max: ${prop.maximum})`}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function extractProperties(
  schema: Record<string, unknown>,
  requiredFields: string[] = [],
): Property[] {
  const properties = schema.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!properties) return [];

  return Object.entries(properties).map(([name, prop]) => {
    const type = (prop.type as string) ?? "unknown";
    const items = prop.items as Record<string, unknown> | undefined;

    let arrayItems: Property["arrayItems"];
    if (type === "array" && items) {
      arrayItems = {
        type: (items.type as string) ?? "unknown",
        ref: items.ref as string | undefined,
        refs: items.refs as string[] | undefined,
      };
    }

    return {
      name,
      type,
      required: requiredFields.includes(name),
      format: prop.format as string | undefined,
      ref: (prop.ref as string) ?? undefined,
      description: prop.description as string | undefined,
      enum: prop.enum as string[] | undefined,
      minimum: prop.minimum as number | undefined,
      maximum: prop.maximum as number | undefined,
      arrayItems,
    };
  });
}
