import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SessionCard } from "@/components/calendar/SessionCard";
import { getBatches, getSessions } from "@/lib/classes";
import {
  addDays,
  dayKey,
  formatDay,
  formatTime,
  formatWeekRange,
  isDayKey,
  weekOf,
  type Session,
} from "@/lib/calendar-utils";

export const metadata: Metadata = {
  title: "Calendar",
  description: "When and where CodePlus classes happen, by batch.",
};

type Props = { searchParams: Promise<{ batch?: string; week?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const batches = await getBatches();
  const batch = batches.find((b) => b.slug === params.batch);
  const batchNames = Object.fromEntries(batches.map((b) => [b.id, b.name]));

  const today = dayKey(new Date());
  const thisWeek = weekOf(today);
  const week = isDayKey(params.week) ? weekOf(params.week) : thisWeek;
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));

  const [sessions, upcoming] = await Promise.all([
    getSessions(week, addDays(week, 7), batch?.id),
    getSessions(today, addDays(today, 56), batch?.id),
  ]);
  const next = upcoming.find((s) => !s.cancelled && new Date(s.end) > new Date());
  const byDay = Object.fromEntries(days.map((d) => [d, sessions.filter((s) => s.day === d)]));

  const href = (p: { batch?: string; week?: string }) => {
    const q = new URLSearchParams();
    const b = "batch" in p ? p.batch : batch?.slug;
    const w = "week" in p ? p.week : week === thisWeek ? undefined : week;
    if (b) q.set("batch", b);
    if (w) q.set("week", w);
    const s = q.toString();
    return s ? `/calendar?${s}` : "/calendar";
  };
  const showBatch = (s: Session) => (batch ? undefined : batchNames[s.batchId]);

  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-8 sm:pt-20">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Calendar</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Class timetable</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">Pick your batch to see when and where classes happen. All times are in IST.</p>

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
        {next && (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-brand/30 bg-brand-tint/40 p-5 sm:flex-row sm:items-center">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <CalendarClock size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs tracking-wider text-brand uppercase">Next class</p>
              <p className="mt-0.5 font-serif text-xl text-ink">{next.topic}</p>
            </div>
            <p className="text-sm text-ink-soft sm:text-right">
              {next.day === today ? "Today" : formatDay(next.day, { weekday: "long", day: "numeric", month: "short" })},{" "}
              {formatTime(next.start)}
              {next.venue && <span className="block text-muted">{next.venue}</span>}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="font-serif text-2xl text-ink">{formatWeekRange(week)}</h2>
          <div className="flex items-center gap-1">
            {week !== thisWeek && (
              <Link href={href({ week: undefined })} className="mr-1 rounded-full px-3 py-1.5 text-sm text-brand hover:bg-surface">
                This week
              </Link>
            )}
            <Link
              href={href({ week: addDays(week, -7) })}
              aria-label="Previous week"
              className="rounded-full border border-line p-2 text-ink-soft hover:bg-surface"
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={href({ week: addDays(week, 7) })}
              aria-label="Next week"
              className="rounded-full border border-line p-2 text-ink-soft hover:bg-surface"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-xl text-ink">No classes this week</p>
            <p className="mt-1.5 max-w-md text-sm text-muted">
              {batch ? `Nothing is scheduled for ${batch.name} this week.` : "Nothing is scheduled this week."} Check the
              next week, or come back once the timetable is out.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: one column per day */}
            <div className="mt-6 hidden grid-cols-7 gap-3 lg:grid">
              {days.map((d) => (
                <div key={d} className="min-w-0">
                  <DayHeading day={d} today={today} />
                  <div className="mt-3 space-y-2.5">
                    {byDay[d].length === 0 ? (
                      <p className="py-2 text-center text-sm text-line">—</p>
                    ) : (
                      byDay[d].map((s) => <SessionCard key={s.key} session={s} batchName={showBatch(s)} compact />)
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile & tablet: only days that have classes */}
            <div className="mt-6 space-y-8 lg:hidden">
              {days
                .filter((d) => byDay[d].length > 0)
                .map((d) => (
                  <div key={d}>
                    <DayHeading day={d} today={today} inline />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {byDay[d].map((s) => (
                        <SessionCard key={s.key} session={s} batchName={showBatch(s)} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}

function DayHeading({ day, today, inline }: { day: string; today: string; inline?: boolean }) {
  const isToday = day === today;
  return (
    <div className={clsx("flex items-baseline gap-2", !inline && "flex-col items-center gap-0.5 text-center")}>
      <span className={clsx("font-mono text-[11px] tracking-wider uppercase", isToday ? "text-brand" : "text-muted")}>
        {formatDay(day, { weekday: "short" })}
      </span>
      <span
        className={clsx(
          "inline-flex items-center justify-center font-serif",
          inline ? "text-xl" : "size-9 rounded-full text-lg",
          isToday ? (inline ? "text-brand" : "bg-brand-gradient text-white") : "text-ink",
        )}
      >
        {inline ? formatDay(day, { day: "numeric", month: "long" }) : formatDay(day, { day: "numeric" })}
      </span>
      {isToday && inline && <span className="font-mono text-[11px] text-brand uppercase">Today</span>}
    </div>
  );
}
