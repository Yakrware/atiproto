import { PropertyTable, extractProperties } from "./PropertyTable";

interface LexiconSchemaProps {
  title: string;
  schema: Record<string, unknown>;
}

export function LexiconSchema({ title, schema }: LexiconSchemaProps) {
  const required = (schema.required as string[]) ?? [];
  const properties = extractProperties(schema, required);

  if (properties.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <PropertyTable properties={properties} />
    </section>
  );
}
