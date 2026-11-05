import { Info } from "lucide-react";

/** A small labelled pill that shows a note on hover, or on tap/focus for touch and keyboard. */
export function InfoTip({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="group relative mt-4 inline-block">
      <button
        type="button"
        aria-describedby={id}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card/60 px-3 py-1 text-sm text-ink-soft transition hover:border-brand/30 focus-visible:border-brand/50"
      >
        <Info size={15} className="text-brand" /> {label}
      </button>
      <p
        id={id}
        role="tooltip"
        className="invisible absolute top-full left-0 z-20 mt-2 w-72 rounded-xl border border-line bg-card p-3.5 text-sm leading-relaxed text-ink-soft opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 sm:w-80"
      >
        {children}
      </p>
    </div>
  );
}
