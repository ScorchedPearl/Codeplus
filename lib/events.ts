import "server-only";
import { and, asc, desc, eq, gt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import type { ClubEvent } from "@/lib/event-utils";

function toClubEvent(row: typeof events.$inferSelect): ClubEvent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    description: row.description,
    blogLink: row.blogLink,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    organizers: row.organizers,
    prizes: row.prizes?.length ? row.prizes : null,
  };
}

/** Ongoing and upcoming events, soonest first. */
export async function getUpcomingEvents(limit?: number): Promise<ClubEvent[]> {
  const query = db.select().from(events).where(gt(events.endTime, new Date())).orderBy(asc(events.startTime));
  const rows = limit ? await query.limit(limit) : await query;
  return rows.map(toClubEvent);
}

/** Events happening right now, ending soonest first. */
export async function getOngoingEvents(): Promise<ClubEvent[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(events)
    .where(and(lte(events.startTime, now), gt(events.endTime, now)))
    .orderBy(asc(events.endTime));
  return rows.map(toClubEvent);
}

/** Events that haven't started yet, soonest first. */
export async function getNotStartedEvents(): Promise<ClubEvent[]> {
  const rows = await db.select().from(events).where(gt(events.startTime, new Date())).orderBy(asc(events.startTime));
  return rows.map(toClubEvent);
}

/** Finished events, most recent first. */
export async function getPastEvents(): Promise<ClubEvent[]> {
  const rows = await db.select().from(events).where(lte(events.endTime, new Date())).orderBy(desc(events.startTime));
  return rows.map(toClubEvent);
}

export async function getEventBySlug(slug: string): Promise<ClubEvent | null> {
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return row ? toClubEvent(row) : null;
}
