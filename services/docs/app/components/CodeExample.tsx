import { CodeBlock } from "./CodeBlock";

interface CodeExampleProps {
  nsid: string;
  type: string;
  inputSchema?: Record<string, unknown>;
  paramsSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  recordSchema?: Record<string, unknown>;
}

function generateSampleValue(
  name: string,
  prop: Record<string, unknown>,
): string {
  const type = prop.type as string;
  const format = prop.format as string | undefined;
  const ref = prop.ref as string | undefined;

  if (format === "did") return '"did:plc:example123"';
  if (format === "at-uri")
    return '"at://did:plc:example123/com.example.post/abc"';
  if (format === "uri") return '"https://example.com/callback"';
  if (format === "datetime") return '"2026-01-01T00:00:00.000Z"';
  if (format === "cid") return '"bafyrei..."';
  if (type === "ref") return `{ $type: "${ref}", ... }`;
  if (type === "union") return "{ ... }";
  if (type === "array") return "[...]";
  if (name === "currency") return '"USD"';
  if (name === "interval") return '"monthly"';
  if (name === "amount" || name === "total") return "500";
  if (name === "limit") return "20";
  if (type === "integer") return "100";
  if (type === "boolean") return "true";
  if (type === "string") return `"example"`;
  return '""';
}

function buildObjectLiteral(
  schema: Record<string, unknown>,
  indent: string,
  onlyRequired: boolean,
): string {
  const props = schema.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  const required = (schema.required as string[]) ?? [];
  if (!props) return "{}";

  const keys =
    onlyRequired && required.length > 0
      ? required.filter((k) => k in props)
      : Object.keys(props);

  if (keys.length === 0) return "{}";

  const entries = keys.map(
    (name) => `${indent}  ${name}: ${generateSampleValue(name, props[name])}`,
  );
  return `{\n${entries.join(",\n")}\n${indent}}`;
}

function buildOutputPreview(
  schema: Record<string, unknown>,
  indent: string,
): string {
  const props = schema.properties as
    | Record<string, Record<string, unknown>>
    | undefined;
  const required = (schema.required as string[]) ?? [];
  if (!props) return "{ ... }";

  const keys =
    required.length > 0
      ? required.filter((k) => k in props)
      : Object.keys(props).slice(0, 4);

  if (keys.length === 0) return "{ ... }";

  const entries = keys.map(
    (name) => `${indent}  ${name}: ${generateSampleValue(name, props[name])}`,
  );
  return `{\n${entries.join(",\n")}\n${indent}}`;
}

export function CodeExample({
  nsid,
  type,
  inputSchema,
  paramsSchema,
  outputSchema,
  recordSchema,
}: CodeExampleProps) {
  const agentPath = nsid
    .replace(/^com\./, "")
    .split(".")
    .join(".");
  const methodName = nsid.split(".").pop()!;

  const lines: string[] = [
    'import { Agent } from "@atiproto/agent";',
    "",
    "// Create a TipAgent from any XrpcClient",
    "const paymentAgent = new Agent(authenticatedClient);",
    "",
  ];

  if (type === "record") {
    lines.push(`// ${nsid} record shape`);
    if (recordSchema) {
      lines.push(
        `const record = ${buildObjectLiteral(recordSchema, "", false)};`,
      );
    }
    return (
      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
        <CodeBlock code={lines.join("\n")} />
      </section>
    );
  }

  // Build the call
  const argSchema = paramsSchema ?? inputSchema;
  let callCode: string;
  if (argSchema) {
    const props = argSchema.properties as Record<string, unknown> | undefined;
    const required = (argSchema.required as string[]) ?? [];
    if (props && (required.length > 0 || Object.keys(props).length > 0)) {
      const args = buildObjectLiteral(argSchema, "", true);
      callCode = `const response = await paymentAgent.com.${agentPath}(${args});`;
    } else {
      callCode = `const response = await paymentAgent.com.${agentPath}();`;
    }
  } else {
    callCode = `const response = await paymentAgent.com.${agentPath}();`;
  }

  lines.push(`// Call ${methodName}`);
  lines.push(callCode);
  lines.push("");

  // Build output preview
  if (outputSchema) {
    const preview = buildOutputPreview(outputSchema, "//   ");
    lines.push(`// response.data → ${preview}`);
  } else {
    lines.push("console.log(response.data);");
  }

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
      <CodeBlock code={lines.join("\n")} />
    </section>
  );
}
