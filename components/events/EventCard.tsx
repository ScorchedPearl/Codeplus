import Link from "next/link";
import clsx from "clsx";
import { Clock, Gift } from "lucide-react";
import { dateTile, eventStatus, formatEventTime, type ClubEvent } from "@/lib/event-utils";

export function EventCard({ event }: { event: ClubEvent }) {
  const { weekday, day, month } = dateTile(event.startTime);
  const status = eventStatus(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={clsx(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-card/60 transition hover:-translate-y-0.5 hover:border-brand/25 hover:bg-card",
        status === "past" && "opacity-80 hover:opacity-100",
      )}
    >
      {event.image && (
        // eslint-disable-next-line @next/next/no-img-element -- posters can come from any host
        <img src={event.image} alt="" className="aspect-[16/9] w-full border-b border-line object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-xl bg-surface px-3 py-2 text-center">
            <p className="font-mono text-[10px] tracking-wider text-muted uppercase">{weekday}</p>
            <p className="font-serif text-2xl leading-none text-ink">{day}</p>
            <p className="font-mono text-[10px] tracking-wider text-muted uppercase">{month}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {status === "ongoing" && <StatusBadge status="ongoing" />}
            {event.prizes && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-1 text-xs text-accent-ink">
                <Gift size={12} /> Prizes
              </span>
            )}
          </div>
        </div>
        <h3 className="mt-5 font-serif text-xl leading-snug text-ink group-hover:text-brand">{event.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.description}</p>
        <div className="mt-auto pt-5">
          <p className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
            <Clock size={13} className="text-muted" />
            {formatEventTime(event.startTime, event.endTime)}
          </p>
          {event.organizers.length > 0 && (
            <p className="mt-1.5 truncate text-xs text-muted">By {event.organizers.join(", ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function StatusBadge({ status }: { status: "upcoming" | "ongoing" | "past" }) {
  const styles = {
    upcoming: "bg-brand-tint text-brand",
    ongoing: "bg-accent-tint text-accent-ink",
    past: "bg-surface text-muted",
  }[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase", styles)}>
      {status === "ongoing" && <span className="size-1.5 animate-pulse rounded-full bg-accent" />}
      {status === "ongoing" ? "Live now" : status}
    </span>
  );
}

export function EmptyEvents({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <p className="font-serif text-xl text-ink">{title}</p>
      <p className="mt-1.5 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
