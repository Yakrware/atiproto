import { Outlet } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/index";
import { buildNavTree, buildSearchIndex, computeVersion } from "~/lib/lexicons.server";
import { Sidebar } from "~/components/Sidebar";
import { SearchBar } from "~/components/SearchBar";
import { ThemeToggle } from "~/components/ThemeToggle";

export function loader() {
  return {
    navTree: buildNavTree(),
    searchIndex: buildSearchIndex(),
    version: computeVersion(),
  };
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
}

export default function DocsLayout({ loaderData }: Route.ComponentProps) {
  const { navTree, searchIndex, version } = loaderData;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="h-full flex items-center gap-4 px-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-surface-alt dark:hover:bg-surface-alt-dark"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Home link */}
          <a
            href="/"
            className="text-lg font-bold shrink-0 hover:text-primary dark:hover:text-primary-dark transition-colors"
          >
            atiproto
          </a>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchBar searchIndex={searchIndex} version={version} />
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar navTree={navTree} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="pt-14 lg:pl-72">
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
