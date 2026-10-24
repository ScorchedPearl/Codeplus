import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { EmptyEvents, EventCard } from "@/components/events/EventCard";
import { getNotStartedEvents, getOngoingEvents, getPastEvents } from "@/lib/events";

export const metadata: Metadata = { title: "Events", description: "Contests, workshops and sessions run by CodePlus." };
export const revalidate = 60;

type Tab = "ongoing" | "upcoming" | "past";

const empty: Record<Tab, { title: string; body: string }> = {
  ongoing: { title: "Nothing happening right now", body: "Check the upcoming tab for what's next." },
  upcoming: {
    title: "No upcoming events yet",
    body: "New contests and workshops will show up here as soon as they're announced.",
  },
  past: { title: "No past events yet", body: "Once events wrap up, you'll find them here." },
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: tabParam } = await searchParams;
  const [ongoing, upcoming] = await Promise.all([getOngoingEvents(), getNotStartedEvents()]);

  // Open on "Ongoing" while something is live, otherwise on "Upcoming"
  const defaultTab: Tab = ongoing.length ? "ongoing" : "upcoming";
  const tab: Tab = tabParam === "ongoing" || tabParam === "upcoming" || tabParam === "past" ? tabParam : defaultTab;
  const events = tab === "ongoing" ? ongoing : tab === "upcoming" ? upcoming : await getPastEvents();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "ongoing", label: "Ongoing", count: ongoing.length },
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past" },
  ];

  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-10 sm:pt-20">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Events</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Contests, workshops & more</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Everything CodePlus runs, from weekly contests to deep-dive workshops. All times are in IST.
          </p>
        </Container>
      </section>

      <Container>
        <nav aria-label="Event filter" className="flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === defaultTab ? "/events" : `/events?tab=${t.id}`}
              aria-current={tab === t.id ? "page" : undefined}
              className={clsx(
                "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition",
                tab === t.id ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {t.label}
              {!!t.count && (
                <span className="rounded-full bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">{t.count}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          {events.length === 0 ? (
            <EmptyEvents {...empty[tab]} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
