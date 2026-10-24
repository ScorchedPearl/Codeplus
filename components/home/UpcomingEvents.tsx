import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyEvents, EventCard } from "@/components/events/EventCard";
import { getUpcomingEvents } from "@/lib/events";

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(3);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Coming up" title="Upcoming events" />
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-all hover:gap-2.5">
            All events <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10">
          {events.length === 0 ? (
            <EmptyEvents
              title="No upcoming events yet"
              body="New contests and workshops will show up here as soon as they're announced."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
