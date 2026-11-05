import "server-only";
import { cache } from "react";
import { and, asc, eq, gte, isNull, lt, or, gt, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { batches, classes } from "@/lib/db/schema";
import { cached, tags } from "@/lib/cache";
import { dayStart, sessionsBetween, type Batch, type Session } from "@/lib/calendar-utils";

async function loadBatches(): Promise<Batch[]> {
  return db
    .select({ id: batches.id, slug: batches.slug, name: batches.name })
    .from(batches)
    .orderBy(asc(batches.sortOrder), asc(batches.name));
}

async function loadClass(id: string) {
  const [row] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  return row ?? null;
}

/** Sessions on IST days [from, to), optionally for one batch. */
async function loadSessions(from: string, to: string, batchId?: string): Promise<Session[]> {
  const windowStart = dayStart(from);
  const windowEnd = dayStart(to);

  const overlapsWindow = or(
    and(isNull(classes.repeatUntil), gt(classes.endTime, windowStart)),
    gte(classes.repeatUntil, from),
  ) as SQL;
  const conditions = [lt(classes.startTime, windowEnd), overlapsWindow];
  if (batchId) conditions.push(eq(classes.batchId, batchId));

  const rows = await db
    .select()
    .from(classes)
    .where(and(...conditions));
  return sessionsBetween(rows, from, to);
}

async function loadAllClasses() {
  return db.select().from(classes).orderBy(asc(classes.startTime));
}

const TTL = 300;
export const getBatches = cached("classes:batches", tags.classes, TTL, loadBatches);
export const getSessions = cached("classes:sessions", tags.classes, TTL, loadSessions);
const cachedClass = cached("classes:by-id", tags.classes, TTL, loadClass);
const cachedAllClasses = cached("classes:all", tags.classes, TTL, loadAllClasses);

/** Every class, oldest first, with dates turned back into Dates after the JSON cache. */
export const getAllClasses = cache(async () =>
  (await cachedAllClasses()).map((row) => ({ ...row, startTime: new Date(row.startTime), endTime: new Date(row.endTime) })),
);

/** Cached like the rest. The data cache stores JSON, so the dates are turned back into Dates here. */
export const getClass = cache(async (id: string) => {
  const row = await cachedClass(id);
  if (!row) return null;
  return {
    ...row,
    startTime: new Date(row.startTime),
    endTime: new Date(row.endTime),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
});
