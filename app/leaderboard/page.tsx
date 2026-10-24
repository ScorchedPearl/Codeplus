import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Handle } from "@/components/leaderboard/Handle";
import { getBatches } from "@/lib/classes";
import { getContestStandings, getContests, getOverallStandings } from "@/lib/leaderboard";
import { getCfUsers } from "@/lib/codeforces";
import { formatDay } from "@/lib/calendar-utils";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "CodePlus contest standings, using Codeforces points.",
};

type Props = { searchParams: Promise<{ batch?: string; contest?: string }> };

const fmtPoints = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));

export default async function LeaderboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const batches = await getBatches();
  const batch = batches.find((b) => b.slug === params.batch);
  const contestList = await getContests(batch?.id);
  const contest = contestList.find((c) => c.slug === params.contest);

  const href = (p: { batch?: string; contest?: string }) => {
    const q = new URLSearchParams();
    const b = "batch" in p ? p.batch : batch?.slug;
    if (b) q.set("batch", b);
    if (p.contest) q.set("contest", p.contest);
    const s = q.toString();
    return s ? `/leaderboard?${s}` : "/leaderboard";
  };

  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-8 sm:pt-20">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Leaderboard</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Standings</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Codeforces points from every CodePlus contest, added up. Handles are coloured by current Codeforces rating.
          </p>

          <nav aria-label="Batch" className="mt-8 flex flex-wrap gap-2">
            {[{ slug: undefined, name: "All batches" }, ...batches].map((b) => {
              const active = b.slug === batch?.slug;
              return (
                <Link
                  key={b.slug ?? "all"}
                  href={href({ batch: b.slug })}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "rounded-full border px-4 py-1.5 text-sm transition",
                    active
                      ? "border-transparent bg-brand-gradient text-white"
                      : "border-line bg-card/60 text-ink-soft hover:border-brand/30 hover:text-ink",
                  )}
                >
                  {b.name}
                </Link>
              );
            })}
          </nav>
        </Container>
      </section>

      <Container>
        {contestList.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-surface text-muted">
              <Trophy size={20} />
            </span>
            <p className="mt-4 font-serif text-xl text-ink">No contests yet</p>
            <p className="mt-1.5 max-w-md text-sm text-muted">
              Results will show up here after each CodePlus contest.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <nav aria-label="Standings view" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
              <ViewLink href={href({})} active={!contest} title="Overall" subtitle={`${contestList.length} contest${contestList.length === 1 ? "" : "s"}`} />
              <p className="hidden px-3 pt-4 pb-1 font-mono text-[11px] tracking-wider text-muted uppercase lg:block">Contests</p>
              {contestList.map((c) => (
                <ViewLink
                  key={c.id}
                  href={href({ contest: c.slug })}
                  active={contest?.id === c.id}
                  title={c.name}
                  subtitle={`${formatDay(c.heldOn, { day: "numeric", month: "short", year: "numeric" })} · ${c.participants}`}
                />
              ))}
            </nav>

            <div className="min-w-0">{contest ? <ContestView contest={contest} /> : <OverallView batchId={batch?.id} />}</div>
          </div>
        )}
      </Container>
    </>
  );
}

function ViewLink({ href, active, title, subtitle }: { href: string; active: boolean; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "shrink-0 rounded-xl border px-3 py-2 transition lg:border-transparent",
        active ? "border-brand/30 bg-brand-tint lg:border-brand/30" : "border-line hover:bg-surface",
      )}
    >
      <span className={clsx("block truncate text-sm", active ? "text-brand" : "text-ink")}>{title}</span>
      <span className="block font-mono text-[11px] text-muted">{subtitle}</span>
    </Link>
  );
}

async function OverallView({ batchId }: { batchId?: string }) {
  const rows = await getOverallStandings(batchId);
  const users = await getCfUsers(rows.map((r) => r.handle));
  const podium = rows.slice(0, 3);

  return (
    <>
      <div className="hidden gap-3 sm:grid sm:grid-cols-3">
        {podium.map((r, i) => (
          <div
            key={r.handle}
            className={clsx(
              "rounded-2xl border p-5",
              i === 0 ? "border-accent/40 bg-accent-tint/50" : "border-line bg-card/60",
            )}
          >
            <p className={clsx("font-mono text-xs tracking-wider uppercase", i === 0 ? "text-accent-ink" : "text-muted")}>
              {["1st", "2nd", "3rd"][i]}
            </p>
            <p className="mt-2 truncate text-lg">
              <Handle handle={r.handle} user={users[r.handle.toLowerCase()]} />
            </p>
            <p className="mt-1 font-serif text-3xl text-ink">
              {fmtPoints(r.points)} <span className="font-sans text-sm text-muted">pts</span>
            </p>
          </div>
        ))}
      </div>

      <Table
        head={["#", "Handle", "Contests", "Best rank", "Penalty", "Points"]}
        rows={rows.map((r, i) => [
          i + 1,
          <Handle key="h" handle={r.handle} user={users[r.handle.toLowerCase()]} />,
          r.contests,
          r.bestRank,
          r.penalty,
          <span key="p" className="font-semibold text-ink">{fmtPoints(r.points)}</span>,
        ])}
      />
    </>
  );
}

async function ContestView({ contest }: { contest: Awaited<ReturnType<typeof getContests>>[number] }) {
  const rows = await getContestStandings(contest.id);
  const users = await getCfUsers(rows.map((r) => r.handle));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">{contest.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {formatDay(contest.heldOn, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} ·{" "}
            {contest.participants} participants
          </p>
        </div>
        {contest.url && (
          <a
            href={contest.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:bg-surface"
          >
            View on Codeforces <ArrowUpRight size={14} />
          </a>
        )}
      </div>

      <Table
        head={["Rank", "Handle", "Solved", "Penalty", "Points"]}
        rows={rows.map((r) => [
          r.rank,
          <Handle key="h" handle={r.handle} user={users[r.handle.toLowerCase()]} />,
          r.solved,
          r.penalty,
          <span key="p" className="font-semibold text-ink">{fmtPoints(r.points)}</span>,
        ])}
      />
    </>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-surface/70">
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={clsx(
                  "px-4 py-3 font-mono text-[11px] font-normal tracking-wider text-muted uppercase",
                  i === 1 ? "text-left" : i === 0 ? "w-14 text-left" : "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} className="border-t border-line transition hover:bg-surface/50">
              {cells.map((c, i) => (
                <td
                  key={i}
                  className={clsx(
                    "px-4 py-3 tabular-nums",
                    i === 0 && "font-mono text-muted",
                    i === 1 ? "text-left" : i === 0 ? "text-left" : "text-right text-ink-soft",
                  )}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
