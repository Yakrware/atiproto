import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fuzzyMatch, type SearchEntry } from "~/lib/search";

const STORAGE_KEY = "atiproto-docs-search";
const VERSION_KEY = "atiproto-docs-search-version";

interface SearchBarProps {
  searchIndex: SearchEntry[];
  version: string;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    query: "text-badge-query",
    procedure: "text-badge-procedure",
    record: "text-badge-record",
  };
  return (
    <span className={`text-[10px] font-medium ${colors[type] ?? ""}`}>
      {type === "procedure" ? "proc" : type}
    </span>
  );
}

export function SearchBar({ searchIndex, version }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [index, setIndex] = useState<SearchEntry[]>(searchIndex);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cachedVersion = localStorage.getItem(VERSION_KEY);
    if (cachedVersion === version) {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setIndex(JSON.parse(cached));
        return;
      }
    }
    localStorage.setItem(VERSION_KEY, version);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchIndex));
    setIndex(searchIndex);
  }, [searchIndex, version]);

  useEffect(() => {
    setResults(fuzzyMatch(query, index));
    setActiveIndex(-1);
  }, [query, index]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        navigate(`/docs/lexicon/${results[activeIndex].nsid}`);
        setOpen(false);
        setQuery("");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [results, activeIndex, navigate]
  );

  return (
    <div className="relative" data-testid="search-bar">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search lexicons..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-alt-dark placeholder-text-muted dark:placeholder-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
          data-testid="search-input"
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute top-full mt-1 left-0 right-0 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
          data-testid="search-results"
        >
          {results.slice(0, 15).map((entry, i) => (
            <Link
              key={entry.nsid}
              to={`/docs/lexicon/${entry.nsid}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className={`block px-3 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-primary/10 text-primary dark:text-primary-dark"
                  : "hover:bg-surface-alt dark:hover:bg-surface-alt-dark"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{entry.nsid}</span>
                <TypeBadge type={entry.type} />
              </div>
              {entry.description && (
                <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5 truncate">
                  {entry.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
