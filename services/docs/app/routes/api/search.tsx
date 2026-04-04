import { buildSearchIndex, computeVersion } from "~/lib/lexicons.server";

export function loader() {
  return Response.json(
    {
      version: computeVersion(),
      entries: buildSearchIndex(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
