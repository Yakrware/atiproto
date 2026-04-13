import type { ReactNode } from "react";
import { ExternalLinkIcon } from "~/components/icons/ExternalLinkIcon";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 text-primary dark:text-primary-dark hover:underline ${className ?? ""}`}
    >
      {children}
      <ExternalLinkIcon className="w-3 h-3 shrink-0" />
    </a>
  );
}
