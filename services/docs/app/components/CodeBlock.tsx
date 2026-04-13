import { useCallback, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import type { Language } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const LANGUAGE_MAP: Record<string, Language> = {
  jsonc: "json",
  typescript: "typescript",
  bash: "bash",
  json: "json",
  tsx: "tsx",
  jsx: "jsx",
  javascript: "javascript",
  js: "javascript",
  ts: "typescript",
};

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = code.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lang = LANGUAGE_MAP[language] ?? "typescript";

  return (
    <div className="relative group rounded-lg overflow-hidden border border-[#181a1f]">
      {language && (
        <div className="px-3 py-1.5 bg-[#21252b] text-xs text-[#636d83] border-b border-[#181a1f] font-mono">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-1 right-2 p-1.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-[#21252b] hover:bg-[#2c313a] text-[#abb2bf]"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <Highlight theme={themes.oneDark} code={code.trim()} language={lang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 overflow-x-auto text-sm leading-relaxed"
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
