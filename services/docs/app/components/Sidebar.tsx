import type { NavItem } from "~/lib/lexicons.server";
import { NavTreeNode } from "./NavTree";

interface SidebarProps {
  navTree: NavItem[];
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ navTree, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-72 bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark overflow-y-auto transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1" data-testid="sidebar-nav">
          {navTree.map((section) => (
            <NavTreeNode
              key={section.label}
              item={section}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
