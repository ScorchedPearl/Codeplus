"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A month-and-year picker: a pill button that opens a year switcher over a grid of months. */
export function MonthPicker({ month, thisMonth, batch }: { month: string; thisMonth: string; batch?: string }) {
  const router = useRouter();
  const [year, m] = month.split("-").map(Number);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [alignLeft, setAlignLeft] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Close on a click outside or Escape; reopen on the month being shown
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (y: number, mm: number) => {
    setOpen(false);
    const q = new URLSearchParams({ view: "month", month: `${y}-${String(mm).padStart(2, "0")}` });
    if (batch) q.set("batch", batch);
    router.push(`/calendar?${q}`);
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setViewYear(year);
          // Open towards whichever side has room for the 256px panel
          setAlignLeft((button.current?.getBoundingClientRect().right ?? 0) < 272);
          setOpen((o) => !o);
        }}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border bg-card/60 py-1.5 pr-3 pl-3.5 text-sm text-ink transition",
          open ? "border-brand/50" : "border-line hover:border-brand/30",
        )}
      >
        <CalendarDays size={15} className="text-brand" />
        {LONG.at(m - 1)} {year}
        <ChevronDown size={14} className={clsx("text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a month"
          className={clsx("absolute top-full z-30 mt-2 w-64", alignLeft ? "left-0" : "right-0", " rounded-2xl border border-line bg-card p-3 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35)]")}
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              aria-label="Previous year"
              className="rounded-full p-1.5 text-ink-soft hover:bg-surface"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif text-lg text-ink" aria-live="polite">
              {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              aria-label="Next year"
              className="rounded-full p-1.5 text-ink-soft hover:bg-surface"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((name, i) => {
              const key = `${viewYear}-${String(i + 1).padStart(2, "0")}`;
              const selected = key === month;
              const isNow = key === thisMonth;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => go(viewYear, i + 1)}
                  aria-current={selected ? "date" : undefined}
                  aria-label={`${LONG.at(i)} ${viewYear}`}
                  className={clsx(
                    "relative rounded-xl py-2 text-sm transition",
                    selected ? "bg-brand-gradient text-white" : "text-ink-soft hover:bg-surface hover:text-ink",
                  )}
                >
                  {name}
                  {isNow && !selected && (
                    <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
