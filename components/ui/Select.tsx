"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

/**
 * A dropdown in the site's own style. The browser's native <select> list can't be styled, so this draws its own
 * and submits through a hidden input, which makes it a drop-in replacement inside forms.
 */
export function Select({
  name,
  options,
  defaultValue,
  className,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (i: number) => {
    const o = options.at(i);
    if (o) setValue(o.value);
    setOpen(false);
    button.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setActive(Math.max(0, options.findIndex((o) => o.value === value)));
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={clsx("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => {
          setActive(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen((o) => !o);
        }}
        onKeyDown={onKeyDown}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-bg px-3.5 py-2.5 text-left text-sm text-ink transition",
          open ? "border-brand/50 ring-2 ring-brand/20" : "border-line hover:border-brand/30",
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown size={15} className={clsx("shrink-0 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              onPointerEnter={() => setActive(i)}
              onClick={(e) => {
                // Inside a <label>, a click would also re-click the button and reopen the list
                e.preventDefault();
                pick(i);
              }}
              className={clsx(
                "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                i === active ? "bg-surface text-ink" : "text-ink-soft",
                o.value === value && "text-brand",
              )}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={15} className="shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
