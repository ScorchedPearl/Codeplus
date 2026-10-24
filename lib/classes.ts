import "server-only";
import { and, asc, eq, gte, isNull, lt, or, gt, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { batches, classes } from "@/lib/db/schema";
import { dayStart, sessionsBetween, type Batch, type Session } from "@/lib/calendar-utils";

export async function getBatches(): Promise<Batch[]> {
  return db
    .select({ id: batches.id, slug: batches.slug, name: batches.name })
    .from(batches)
    .orderBy(asc(batches.sortOrder), asc(batches.name));
}

/** Sessions on IST days [from, to), optionally for one batch. */
export async function getSessions(from: string, to: string, batchId?: string): Promise<Session[]> {
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
