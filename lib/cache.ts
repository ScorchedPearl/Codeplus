import "server-only";
import { unstable_cache } from "next/cache";

// Every query is a round trip to the database, so public read queries are cached. Admin actions
// expire a tag with updateTag() when something changes; `revalidate` is only the fallback for
// changes made outside the site (the import script, SQL edits). Cached values must be JSON-safe.
export const tags = {
  events: "events",
  classes: "classes", // batches and the timetable
  leaderboard: "leaderboard",
} as const;

export function cached<A extends unknown[], R>(
  name: string,
  tag: (typeof tags)[keyof typeof tags],
  revalidate: number,
  fn: (...args: A) => Promise<R>,
) {
  return unstable_cache(fn, [name], { tags: [tag], revalidate });
}
