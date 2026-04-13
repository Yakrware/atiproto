import type { ReactNode } from "react";
import { LinkIcon } from "~/components/icons/LinkIcon";

type HeadingLevel = "h1" | "h2" | "h3";

interface AnchorHeadingProps {
  as: HeadingLevel;
  id?: string;
  className?: string;
  children: ReactNode;
}

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in (children as object)
  ) {
    return extractText(
      (children as { props: { children: ReactNode } }).props.children,
    );
  }
  return "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function AnchorHeading({
  as: Tag,
  id,
  className,
  children,
}: AnchorHeadingProps) {
  const slug = id ?? slugify(extractText(children));

  return (
    <Tag id={slug} className={`group ${className ?? ""}`}>
      <a href={`#${slug}`} className="inline-flex items-center gap-2">
        {children}
        <LinkIcon className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-text-muted dark:text-text-muted-dark" />
      </a>
    </Tag>
  );
}
