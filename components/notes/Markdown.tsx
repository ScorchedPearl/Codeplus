import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders class notes. Raw HTML in the Markdown is not rendered. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="notes">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
