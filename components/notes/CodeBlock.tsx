"use client";

import { isValidElement, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const LABELS: Record<string, string> = { cpp: "C++", c: "C", python: "Python", java: "Java", js: "JavaScript", javascript: "JavaScript", bash: "Terminal" };

export function CodeBlock({ children }: { children: React.ReactNode }) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const className = isValidElement<{ className?: string }>(children) ? (children.props.className ?? "") : "";
  const language = className.match(/language-(\S+)/)?.[1];

  const copy = async () => {
    await navigator.clipboard.writeText(pre.current?.textContent ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block">
      <div className="code-bar">
        <span>{(language && LABELS[language]) ?? language ?? "Code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={pre}>{children}</pre>
    </div>
  );
}
