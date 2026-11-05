"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronDown, History } from "lucide-react";

export type BatchLink = { key: string; label: string; href: string; active: boolean };

/** "Past batches" pill that opens a list of finished batches */
export function PastBatchesMenu({ items }: { items: BatchLink[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = items.find((i) => i.active);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition",
          current
            ? "border-transparent bg-brand-gradient text-white"
            : "border-line bg-card/60 text-ink-soft hover:border-brand/30 hover:text-ink",
        )}
      >
        <History size={14} />
        {current ? current.label : "Past batches"}
        <ChevronDown size={14} className={clsx("transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-30 mt-2 min-w-56 rounded-xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35)]"
        >
          <p className="px-3 pt-1.5 pb-1 font-mono text-[10px] tracking-wider text-muted uppercase">Past batches</p>
          {items.map((i) => (
            <Link
              key={i.key}
              href={i.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface",
                i.active ? "text-brand" : "text-ink-soft hover:text-ink",
              )}
            >
              {i.label}
              {i.active && <Check size={15} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
