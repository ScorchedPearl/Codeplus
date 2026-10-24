import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Handle } from "@/components/leaderboard/Handle";
import { getOverallStandings } from "@/lib/leaderboard";
import { getCfUsers } from "@/lib/codeforces";

/** Top 5 overall; hidden until the first contest is imported. */
export async function LeaderboardPreview() {
  const rows = await getOverallStandings(undefined, 5);
  if (rows.length === 0) return null;
  const users = await getCfUsers(rows.map((r) => r.handle));

  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Leaderboard" title="Top of the table" />
          <Link href="/leaderboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-all hover:gap-2.5">
            Full standings <ArrowRight size={16} />
          </Link>
        </div>
        <ol className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/60">
          {rows.map((r, i) => (
            <li key={r.handle} className="flex items-center gap-4 px-5 py-4">
              <span className={`w-6 font-mono text-sm ${i === 0 ? "text-accent" : "text-muted"}`}>{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">
                <Handle handle={r.handle} user={users[r.handle.toLowerCase()]} />
              </span>
              <span className="text-sm text-muted">
                {r.contests} contest{r.contests === 1 ? "" : "s"}
              </span>
              <span className="w-16 text-right font-serif text-xl text-ink tabular-nums">{Math.round(r.points)}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
