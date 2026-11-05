import Link from "next/link";
import clsx from "clsx";
import { Trophy } from "lucide-react";
import { dayKey, formatTime } from "@/lib/calendar-utils";
import type { ClubEvent } from "@/lib/event-utils";

/** IST days an event touches, first to last */
export function eventDays(e: ClubEvent) {
  return { first: dayKey(new Date(e.startTime)), last: dayKey(new Date(new Date(e.endTime).getTime() - 1)) };
}

/** When the event runs on this particular day of a multi-day event */
export function eventTimeOn(e: ClubEvent, day: string) {
  const { first, last } = eventDays(e);
  if (first === last) return `${formatTime(e.startTime)} – ${formatTime(e.endTime)}`;
  if (day === first) return `From ${formatTime(e.startTime)}`;
  if (day === last) return `Until ${formatTime(e.endTime)}`;
  return "All day";
}

/** An event (contest, workshop…) in the calendar's week view, styled apart from classes */
export function EventBlock({ event, day, compact }: { event: ClubEvent; day: string; compact?: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="block rounded-xl border border-accent/40 bg-accent-tint/50 p-3.5 transition hover:border-accent/70"
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-accent-ink uppercase">
        <Trophy size={12} /> Event
      </p>
      <p className={clsx("mt-1.5 font-serif leading-snug text-ink", compact ? "text-base" : "text-lg")}>{event.name}</p>
      <p className="mt-1 font-mono text-xs text-accent-ink">{eventTimeOn(event, day)}</p>
    </Link>
  );
}
