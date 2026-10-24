import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarPlus, Clock, Download, Gift, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/events/EventCard";
import { getEventBySlug } from "@/lib/events";
import { eventStatus, formatEventLongDate, formatEventTime, googleCalendarUrl } from "@/lib/event-utils";
import { site } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.name,
    description: event.description.slice(0, 160),
    openGraph: event.image ? { images: [event.image] } : undefined,
  };
}

export default async function EventPage({ params }: Props) {
  const event = await getEventBySlug((await params).slug);
  if (!event) notFound();

  const status = eventStatus(event);
  const pageUrl = `${site.url}/events/${event.slug}`;

  return (
    <article className="-mt-16 bg-glow pt-16">
      <Container className="max-w-6xl pt-10 sm:pt-14">
        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> All events
        </Link>

        {/* Phone: title, poster & actions, description. Desktop: poster column on the left, text on the right. */}
        <div className="mt-8 grid gap-8 [grid-template-areas:'header'_'aside'_'body'] lg:grid-cols-[340px_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:[grid-template-areas:'aside_header'_'aside_body']">
          <header className="[grid-area:header]">
            <StatusBadge status={status} />
            <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{event.name}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
              <span>{formatEventLongDate(event.startTime)}</span>
              <span aria-hidden className="text-line">•</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-sm">
                <Clock size={14} />
                {formatEventTime(event.startTime, event.endTime)}
              </span>
            </p>
          </header>

          <div className="max-w-3xl space-y-4 text-lg leading-relaxed whitespace-pre-line text-ink-soft [grid-area:body]">
            {event.description}
          </div>

          <aside className="space-y-6 self-start [grid-area:aside] lg:sticky lg:top-24">
            {event.image && (
              <a href={event.image} target="_blank" rel="noreferrer" title="Open full poster" className="block max-w-sm lg:max-w-none">
                {/* Plain <img>: posters can be hosted anywhere */}
                <img
                  src={event.image}
                  alt={`${event.name} poster`}
                  className="w-full rounded-2xl border border-line transition hover:opacity-90"
                />
              </a>
            )}

            <div className="flex flex-col gap-2">
              {event.blogLink && (
                <a
                  href={event.blogLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
                >
                  Read the blog <ArrowUpRight size={16} />
                </a>
              )}
              {status !== "past" && (
                <>
                  <a
                    href={googleCalendarUrl(event, pageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-card/70 px-5 py-2.5 text-sm text-ink hover:bg-card"
                  >
                    <CalendarPlus size={16} /> Add to Google Calendar
                  </a>
                  <a
                    href={`/events/${event.slug}/event.ics`}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm text-muted hover:text-ink"
                  >
                    <Download size={15} /> Download .ics
                  </a>
                </>
              )}
            </div>

            {event.organizers.length > 0 && (
              <div className="rounded-2xl border border-line bg-card/60 p-5">
                <h2 className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase">
                  <Users size={14} /> Organisers
                </h2>
                <ul className="mt-3 space-y-1.5 text-ink">
                  {event.organizers.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {event.prizes && (
              <div className="rounded-2xl border border-line bg-accent-tint/50 p-5">
                <h2 className="flex items-center gap-2 font-mono text-xs tracking-wider text-accent-ink uppercase">
                  <Gift size={14} /> Prizes
                </h2>
                <ul className="mt-3 space-y-1.5 text-ink">
                  {event.prizes.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
