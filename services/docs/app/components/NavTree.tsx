import { useState } from "react";
import { Link, useLocation } from "react-router";
import type { NavItem } from "~/lib/lexicons.server";

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    query: "bg-badge-query/15 text-badge-query",
    procedure: "bg-badge-procedure/15 text-badge-procedure",
    record: "bg-badge-record/15 text-badge-record",
    "permission-set": "bg-badge-permission/15 text-badge-permission",
  };
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors[type] ?? ""}`}
    >
      {type === "procedure"
        ? "proc"
        : type === "permission-set"
          ? "perm"
          : type}
    </span>
  );
}

export function NavTreeNode({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = item.href === location.pathname;
  const hasActiveChild = item.children?.some(
    (c) =>
      c.href === location.pathname ||
      c.children?.some((gc) => gc.href === location.pathname),
  );
  const [open, setOpen] = useState(hasActiveChild ?? true);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 w-full text-left py-1.5 px-2 text-sm rounded hover:bg-surface-alt dark:hover:bg-surface-alt-dark transition-colors ${
            depth === 0
              ? "font-semibold text-text dark:text-text-dark"
              : "text-text-muted dark:text-text-muted-dark"
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>{item.label}</span>
        </button>
        {open && (
          <div className="ml-3 border-l border-border dark:border-border-dark pl-2">
            {item.children.map((child) => (
              <NavTreeNode
                key={child.label}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href!}
      onClick={onNavigate}
      className={`flex items-center gap-2 py-1.5 px-2 text-sm rounded transition-colors ${
        isActive
          ? "bg-primary/10 text-primary dark:text-primary-dark font-medium"
          : "text-text-muted dark:text-text-muted-dark hover:bg-surface-alt dark:hover:bg-surface-alt-dark hover:text-text dark:hover:text-text-dark"
      }`}
    >
      <span className="truncate">{item.label}</span>
      {item.type && <TypeBadge type={item.type} />}
    </Link>
  );
}
