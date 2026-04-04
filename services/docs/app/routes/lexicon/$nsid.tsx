import type { Route } from "./+types/$nsid";
import { findSchema } from "~/lib/lexicons.server";
import { LexiconDetail } from "~/components/LexiconDetail";

export function loader({ params }: Route.LoaderArgs) {
  const schema = findSchema(params.nsid);
  if (!schema) {
    throw new Response("Lexicon not found", { status: 404 });
  }
  return { lexicon: schema };
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
}

export default function LexiconPage({ loaderData }: Route.ComponentProps) {
  return (
    <LexiconDetail
      lexicon={loaderData.lexicon as { id: string; defs: Record<string, Record<string, unknown>> }}
    />
  );
}
