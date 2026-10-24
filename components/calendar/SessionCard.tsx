import clsx from "clsx";
import { ArrowUpRight, MapPin, User } from "lucide-react";
import { formatTime, type Session } from "@/lib/calendar-utils";

export function SessionCard({ session, batchName, compact }: { session: Session; batchName?: string; compact?: boolean }) {
  const past = new Date(session.end) < new Date();

  return (
    <article
      className={clsx(
        "rounded-xl border p-3.5 transition",
        session.cancelled ? "border-dashed border-line bg-transparent" : "border-line bg-card/70",
        past && !session.cancelled && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <p className={clsx("font-mono text-xs", session.cancelled ? "text-muted line-through" : "text-brand")}>
          {formatTime(session.start)}
          {!compact && ` – ${formatTime(session.end)}`}
        </p>
        {session.cancelled && (
          <span className="rounded-full bg-accent-tint px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink uppercase">
            Cancelled
          </span>
        )}
      </div>
      <h3
        className={clsx(
          "mt-1.5 font-serif leading-snug",
          compact ? "text-base" : "text-lg",
          session.cancelled ? "text-muted line-through" : "text-ink",
        )}
      >
        {session.topic}
      </h3>
      {!compact && session.description && <p className="mt-1 text-sm text-muted">{session.description}</p>}

      <div className="mt-2 space-y-1 text-xs text-muted">
        {batchName && <p className="font-mono tracking-wider uppercase">{batchName}</p>}
        {session.venue && (
          <p className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{session.venue}</span>
          </p>
        )}
        {session.tas.length > 0 && (
          <p className="flex items-center gap-1.5">
            <User size={12} className="shrink-0" />
            <span className="truncate">{session.tas.join(", ")}</span>
          </p>
        )}
      </div>

      {session.link && !session.cancelled && (
        <a
          href={session.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          Class material <ArrowUpRight size={12} />
        </a>
      )}
    </article>
  );
}
