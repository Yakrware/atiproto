import { LexiconSchema } from "./LexiconSchema";
import { PermissionSetDetail } from "./PermissionSetDetail";
import { CodeExample } from "./CodeExample";

interface LexiconDetailProps {
  lexicon: {
    id: string;
    defs: Record<string, Record<string, unknown>>;
  };
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    query: "bg-badge-query text-white",
    procedure: "bg-badge-procedure text-white",
    record: "bg-badge-record text-white",
    "permission-set": "bg-badge-permission text-white",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] ?? "bg-gray-500 text-white"}`}
    >
      {type}
    </span>
  );
}

export function LexiconDetail({ lexicon }: LexiconDetailProps) {
  const mainDef = lexicon.defs.main;
  if (!mainDef) return <p>No definition found.</p>;

  const type = mainDef.type as string;
  const description = mainDef.description as string | undefined;

  const inputSchema = (mainDef.input as Record<string, unknown>)?.schema as
    | Record<string, unknown>
    | undefined;
  const outputSchema = (mainDef.output as Record<string, unknown>)?.schema as
    | Record<string, unknown>
    | undefined;
  const paramsSchema = mainDef.parameters as
    | Record<string, unknown>
    | undefined;
  const recordSchema = mainDef.record as Record<string, unknown> | undefined;

  // Collect additional type defs (e.g. subscriptionTier, cartItem)
  const additionalDefs = Object.entries(lexicon.defs).filter(
    ([key]) => key !== "main",
  );

  return (
    <article>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold font-mono" data-testid="lexicon-id">
          {lexicon.id}
        </h1>
        <TypeBadge type={type} />
      </div>

      {type !== "permission-set" && description && (
        <p className="text-text-muted dark:text-text-muted-dark mb-6">
          {description}
        </p>
      )}

      {type === "permission-set" && <PermissionSetDetail mainDef={mainDef} />}

      {type === "record" && recordSchema && (
        <LexiconSchema title="Record Schema" schema={recordSchema} />
      )}

      {paramsSchema && (
        <LexiconSchema title="Parameters" schema={paramsSchema} />
      )}

      {inputSchema && <LexiconSchema title="Input" schema={inputSchema} />}

      {outputSchema && <LexiconSchema title="Output" schema={outputSchema} />}

      {additionalDefs.map(([name, def]) => (
        <LexiconSchema
          key={name}
          title={`Type: ${name}`}
          schema={def as Record<string, unknown>}
        />
      ))}

      {type !== "permission-set" && (
        <CodeExample
          nsid={lexicon.id}
          type={type}
          inputSchema={inputSchema}
          paramsSchema={paramsSchema}
          outputSchema={outputSchema}
          recordSchema={recordSchema}
        />
      )}
    </article>
  );
}
