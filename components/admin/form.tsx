"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
  confirm,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "secondary";
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60",
        variant === "primary" && "bg-brand-gradient text-white hover:brightness-110",
        variant === "secondary" && "border border-line bg-card text-ink hover:bg-surface",
        variant === "danger" && "border border-[#e5383b]/40 text-[#e5383b] hover:bg-[#e5383b]/10",
        className,
      )}
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-lg bg-accent-tint px-3 py-2 text-sm text-accent-ink">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand">
        {state.ok}
      </p>
    );
  return null;
}
