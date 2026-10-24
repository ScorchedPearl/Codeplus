import "server-only";
import { asc, count, desc, eq, isNull, max, min, or, sql, sum, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { contestResults, contests } from "@/lib/db/schema";

export type ContestSummary = {
  id: string;
  slug: string;
  name: string;
  heldOn: string;
  url: string | null;
  batchId: string | null;
  participants: number;
};

export type OverallRow = {
  handle: string;
  points: number;
  penalty: number;
  contests: number;
  bestRank: number;
};

export type ContestRow = { handle: string; rank: number; points: number; penalty: number; solved: number };

// Batch view = that batch's contests plus contests open to everyone.
const forBatch = (batchId?: string) =>
  batchId ? (or(eq(contests.batchId, batchId), isNull(contests.batchId)) as SQL) : undefined;

export async function getContests(batchId?: string): Promise<ContestSummary[]> {
  return db
    .select({
      id: contests.id,
      slug: contests.slug,
      name: contests.name,
      heldOn: contests.heldOn,
      url: contests.url,
      batchId: contests.batchId,
      participants: count(contestResults.id),
    })
    .from(contests)
    .leftJoin(contestResults, eq(contestResults.contestId, contests.id))
    .where(forBatch(batchId))
    .groupBy(contests.id)
    .orderBy(desc(contests.heldOn), desc(contests.createdAt));
}

/** Codeforces points added up across contests; lower total penalty breaks ties. */
export async function getOverallStandings(batchId?: string, limit?: number): Promise<OverallRow[]> {
  const key = sql`lower(${contestResults.handle})`;
  const points = sum(contestResults.points).mapWith(Number);
  const penalty = sum(contestResults.penalty).mapWith(Number);

  const query = db
    .select({
      handle: max(contestResults.handle).mapWith(String),
      points,
      penalty,
      contests: count(contestResults.id),
      bestRank: min(contestResults.rank).mapWith(Number),
    })
    .from(contestResults)
    .innerJoin(contests, eq(contests.id, contestResults.contestId))
    .where(forBatch(batchId))
    .groupBy(key)
    .orderBy(desc(points), asc(penalty), asc(key));

  return limit ? query.limit(limit) : query;
}

export async function getContestStandings(contestId: string): Promise<ContestRow[]> {
  return db
    .select({
      handle: contestResults.handle,
      rank: contestResults.rank,
      points: contestResults.points,
      penalty: contestResults.penalty,
      solved: contestResults.solved,
    })
    .from(contestResults)
    .where(eq(contestResults.contestId, contestId))
    .orderBy(asc(contestResults.rank), asc(contestResults.penalty));
}
