import Link from "next/link";
import clsx from "clsx";
import { PastBatchesMenu, type BatchLink } from "@/components/ui/PastBatchesMenu";

/**
 * The batch switcher used across the site: current batches as pills, finished ones in a "Past batches" menu.
 * `items` may start with an "All batches" entry (never past).
 */
export function BatchNav({ items, className }: { items: (BatchLink & { past?: boolean })[]; className?: string }) {
  const current = items.filter((i) => !i.past);
  const past = items.filter((i) => i.past);

  return (
    <nav aria-label="Batch" className={clsx("flex flex-wrap gap-2", className)}>
      {current.map((i) => (
        <Link
          key={i.key}
          href={i.href}
          aria-current={i.active ? "page" : undefined}
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm transition",
            i.active
              ? "border-transparent bg-brand-gradient text-white"
              : "border-line bg-card/60 text-ink-soft hover:border-brand/30 hover:text-ink",
          )}
        >
          {i.label}
        </Link>
      ))}
      {past.length > 0 && <PastBatchesMenu items={past} />}
    </nav>
  );
}
