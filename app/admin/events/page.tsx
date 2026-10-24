import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/events/EventCard";
import { eventStatus, formatEventDate, formatEventTime } from "@/lib/event-utils";

export const metadata: Metadata = { title: "Events" };

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireMember();
  const { saved } = await searchParams;
  const rows = await db.select().from(events).orderBy(desc(events.startTime));

  return (
    <>
      <PageHeader title="Events" intro="Contests, workshops and sessions shown on the Events page." action={{ href: "/admin/events/new", label: "New event" }} />
      {saved && <p className="mb-4 rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand">Saved. The public pages update within a minute.</p>}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">No events yet. Create the first one.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/60">
          {rows.map((e) => {
            const startTime = e.startTime.toISOString();
            const endTime = e.endTime.toISOString();
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{e.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatEventDate(startTime)} · {formatEventTime(startTime, endTime)}
                  </p>
                </div>
                <StatusBadge status={eventStatus({ startTime, endTime })} />
                <Link
                  href={`/admin/events/${e.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft hover:bg-surface"
                >
                  <Pencil size={14} /> Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
