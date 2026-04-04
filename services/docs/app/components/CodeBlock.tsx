import { useCallback, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border dark:border-border-dark">
      {language && (
        <div className="px-3 py-1 bg-surface-alt dark:bg-surface-alt-dark text-xs text-text-muted dark:text-text-muted-dark border-b border-border dark:border-border-dark">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-1 right-2 p-1.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-surface-alt dark:bg-surface-alt-dark hover:bg-border dark:hover:bg-border-dark"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="p-4 overflow-x-auto text-sm bg-surface-alt/50 dark:bg-surface-alt-dark/50">
        <code>{code}</code>
      </pre>
    </div>
  );
}
