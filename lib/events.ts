import "server-only";
import { and, asc, desc, eq, gt, lt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { cached, tags } from "@/lib/cache";
import type { ClubEvent } from "@/lib/event-utils";
import { dayStart } from "@/lib/calendar-utils";

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
async function loadGetUpcomingEvents(limit?: number): Promise<ClubEvent[]> {
  const query = db.select().from(events).where(gt(events.endTime, new Date())).orderBy(asc(events.startTime));
  const rows = limit ? await query.limit(limit) : await query;
  return rows.map(toClubEvent);
}

/** Events happening right now, ending soonest first. */
async function loadGetOngoingEvents(): Promise<ClubEvent[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(events)
    .where(and(lte(events.startTime, now), gt(events.endTime, now)))
    .orderBy(asc(events.endTime));
  return rows.map(toClubEvent);
}

/** Events that haven't started yet, soonest first. */
async function loadGetNotStartedEvents(): Promise<ClubEvent[]> {
  const rows = await db.select().from(events).where(gt(events.startTime, new Date())).orderBy(asc(events.startTime));
  return rows.map(toClubEvent);
}

/** Finished events, most recent first. */
async function loadGetPastEvents(): Promise<ClubEvent[]> {
  const rows = await db.select().from(events).where(lte(events.endTime, new Date())).orderBy(desc(events.startTime));
  return rows.map(toClubEvent);
}

async function loadGetEventBySlug(slug: string): Promise<ClubEvent | null> {
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return row ? toClubEvent(row) : null;
}

/** Events overlapping the IST days [from, to), soonest first. */
async function loadGetEventsBetween(from: string, to: string): Promise<ClubEvent[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(lt(events.startTime, dayStart(to)), gt(events.endTime, dayStart(from))))
    .orderBy(asc(events.startTime));
  return rows.map(toClubEvent);
}

const TTL = 60; // seconds: "ongoing" and "upcoming" depend on the clock

/** Ongoing and upcoming events, soonest first. */
export const getUpcomingEvents = cached("events:upcoming", tags.events, TTL, loadGetUpcomingEvents);
/** Events happening right now, ending soonest first. */
export const getOngoingEvents = cached("events:ongoing", tags.events, TTL, loadGetOngoingEvents);
/** Events that haven't started yet, soonest first. */
export const getNotStartedEvents = cached("events:not-started", tags.events, TTL, loadGetNotStartedEvents);
/** Finished events, most recent first. */
export const getPastEvents = cached("events:past", tags.events, TTL, loadGetPastEvents);
/** Events overlapping the IST days [from, to), soonest first. */
export const getEventsBetween = cached("events:between", tags.events, TTL, loadGetEventsBetween);
export const getEventBySlug = cached("events:by-slug", tags.events, TTL, loadGetEventBySlug);
