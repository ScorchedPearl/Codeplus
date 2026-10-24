import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHeader({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {intro && <p className="mt-1.5 max-w-xl text-sm text-muted">{intro}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          <Plus size={16} /> {action.label}
        </Link>
      )}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-card/60 p-5 sm:p-6 ${className ?? ""}`}>
      {title && <h2 className="mb-4 font-serif text-xl text-ink">{title}</h2>}
      {children}
    </section>
  );
}
