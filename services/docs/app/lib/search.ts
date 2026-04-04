import type { SearchEntry } from "./lexicons.server";

export type { SearchEntry };

export function fuzzyMatch(query: string, entries: SearchEntry[]): SearchEntry[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const scored = entries
    .map((entry) => {
      const nsid = entry.nsid.toLowerCase();
      const lastSegment = nsid.split(".").pop() ?? "";
      const desc = entry.description.toLowerCase();

      let score = 0;
      if (lastSegment.startsWith(q)) score = 100;
      else if (lastSegment.includes(q)) score = 80;
      else if (nsid.includes(q)) score = 60;
      else if (desc.includes(q)) score = 40;
      else {
        // Check if all query chars appear in order
        let qi = 0;
        for (let i = 0; i < nsid.length && qi < q.length; i++) {
          if (nsid[i] === q[qi]) qi++;
        }
        if (qi === q.length) score = 20;
      }

      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.entry);
}
