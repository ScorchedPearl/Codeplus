import Link from "next/link";
import { ArrowRight, CalendarX, Clock, Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatEventDate, formatEventTime, getUpcomingEvents } from "@/lib/events";

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(3);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Coming up" title="Upcoming events" />
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:gap-2.5 transition-all">
            All events <ArrowRight size={16} />
          </Link>
        </div>

        {events.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-surface text-muted">
              <CalendarX size={20} />
            </span>
            <p className="mt-4 font-serif text-xl text-ink">No upcoming events yet</p>
            <p className="mt-1.5 text-sm text-muted">New contests and workshops will show up here as soon as they&apos;re announced.</p>
          </div>
        )}

        <div className="mt-10 grid gap-4 empty:hidden md:grid-cols-3">
          {events.map((event) => {
            const [weekday, day, month] = formatEventDate(event.startTime).replace(",", "").split(" ");
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-card/60 p-6 transition hover:-translate-y-0.5 hover:border-brand/25 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-surface px-3 py-2 text-center">
                    <p className="font-mono text-[10px] tracking-wider text-muted uppercase">{weekday}</p>
                    <p className="font-serif text-2xl leading-none text-ink">{day}</p>
                    <p className="font-mono text-[10px] tracking-wider text-muted uppercase">{month}</p>
                  </div>
                  {event.prizes?.length ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-1 text-xs text-accent-ink">
                      <Gift size={12} /> Prizes
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 font-serif text-xl leading-snug text-ink group-hover:text-brand">{event.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.description}</p>
                <div className="mt-auto pt-5">
                  <p className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                    <Clock size={13} className="text-muted" />
                    {formatEventTime(event.startTime, event.endTime)}
                  </p>
                  <p className="mt-1.5 truncate text-xs text-muted">By {event.organizers.join(", ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
