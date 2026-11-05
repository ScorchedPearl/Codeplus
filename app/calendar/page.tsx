import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { CalendarClock, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BatchNav } from "@/components/ui/BatchNav";
import { InfoTip } from "@/components/ui/InfoTip";
import { SessionCard } from "@/components/calendar/SessionCard";
import { MonthPicker } from "@/components/calendar/MonthPicker";
import { EventBlock, eventDays, eventTimeOn } from "@/components/calendar/EventBlock";
import { getEventsBetween } from "@/lib/events";
import { getBatchesWithStatus, getSessions } from "@/lib/classes";
import {
  addDays,
  addMonths,
  dayKey,
  formatDay,
  formatTime,
  formatWeekRange,
  isDayKey,
  isMonthKey,
  lastDayOfMonth,
  weekOf,
  type Session,
} from "@/lib/calendar-utils";

export const metadata: Metadata = {
  title: "Calendar",
  description: "When and where CodePlus classes happen, by batch.",
};

type Props = { searchParams: Promise<{ batch?: string; week?: string; view?: string; month?: string }> };

type View = "week" | "month";

// Batch colours in the month grid, in batch order
const BATCH_COLOURS = ["var(--brand)", "var(--accent)", "var(--brand-sky)", "var(--muted)"];

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = dayKey(new Date());
  const thisWeek = weekOf(today);
  const week = isDayKey(params.week) ? weekOf(params.week) : thisWeek;
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));

  const view: View = params.view === "month" ? "month" : "week";
  const thisMonth = today.slice(0, 7);
  const month = isMonthKey(params.month) ? params.month : thisMonth;
  // The month grid runs from the Monday on or before the 1st to the Sunday on or after the last day
  const gridStart = weekOf(`${month}-01`);
  const gridEnd = addDays(weekOf(lastDayOfMonth(month)), 7);
  const gridDays = Array.from({ length: (Date.parse(gridEnd) - Date.parse(gridStart)) / 86_400_000 }, (_, i) =>
    addDays(gridStart, i),
  );
  const [from, to] = view === "month" ? [gridStart, gridEnd] : [week, addDays(week, 7)];

  // One parallel round trip: all batches' sessions are fetched (the table is tiny) and filtered here,
  // so we don't have to wait for the batch list to know which batch id to ask for.
  const [batches, weekSessions, upcomingSessions, rangeEvents] = await Promise.all([
    getBatchesWithStatus(),
    getSessions(from, to),
    getSessions(today, addDays(today, 56)),
    getEventsBetween(from, to),
  ]);
  const batch = batches.find((b) => b.slug === params.batch);
  const batchNames = Object.fromEntries(batches.map((b) => [b.id, b.name]));
  const inBatch = (s: Session) => !batch || s.batchId === batch.id;
  const sessions = weekSessions.filter(inBatch);
  const upcoming = upcomingSessions.filter(inBatch);
  const next = upcoming.find((s) => !s.cancelled && new Date(s.end) > new Date());
  const shownDays = view === "month" ? gridDays : days;
  const byDay = Object.fromEntries(shownDays.map((d) => [d, sessions.filter((s) => s.day === d)]));
  // Events are for everyone, so they show whichever batch is picked; a multi-day event shows on each day
  const eventsByDay = Object.fromEntries(
    shownDays.map((d) => [d, rangeEvents.filter((e) => eventDays(e).first <= d && d <= eventDays(e).last)]),
  );
  const hasAnything = (d: string) => byDay[d].length + eventsByDay[d].length > 0;
  const colourOf = (s: Session) => BATCH_COLOURS.at(batches.findIndex((b) => b.id === s.batchId)) ?? "var(--muted)";

  const href = (p: { batch?: string; week?: string; view?: View; month?: string }) => {
    const q = new URLSearchParams();
    const b = "batch" in p ? p.batch : batch?.slug;
    const v = "view" in p ? p.view : view;
    if (b) q.set("batch", b);
    if (v === "month") {
      q.set("view", "month");
      const m = "month" in p ? p.month : month;
      if (m && m !== thisMonth) q.set("month", m);
    } else {
      const w = "week" in p ? p.week : week === thisWeek ? undefined : week;
      if (w) q.set("week", w);
    }
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
          <InfoTip id="tentative-note" label="Tentative dates">
            These dates are tentative. Classes run on weekends, but mid-semester exams fall in between: classes that clash
            with them will be rescheduled to weekdays, 9:00–11:00 PM, according to the academic planner. Any change shows
            up here.
          </InfoTip>

          <BatchNav className="mt-8" items={[
              { key: "all", label: "All batches", href: href({ batch: undefined }), active: !batch },
              ...batches.map((b) => ({ key: b.id, label: b.name, href: href({ batch: b.slug }), active: b.id === batch?.id, past: b.past })),
            ]} />
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

        {view === "month" ? (
          <>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <ViewSwitch view={view} weekHref={href({ view: "week", week: month === thisMonth ? undefined : `${month}-01` })} monthHref={href({ view: "month" })} />
            <h2 className="font-serif text-2xl text-ink">{formatDay(`${month}-01`, { month: "long", year: "numeric" })}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker month={month} thisMonth={thisMonth} batch={batch?.slug} />
            {month !== thisMonth && (
              <Link href={href({ month: thisMonth })} className="rounded-full px-3 py-1.5 text-sm text-brand hover:bg-surface">
                This month
              </Link>
            )}
            <Link
              href={href({ month: addMonths(month, -1) })}
              aria-label="Previous month"
              className="rounded-full border border-line p-2 text-ink-soft hover:bg-surface"
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={href({ month: addMonths(month, 1) })}
              aria-label="Next month"
              className="rounded-full border border-line p-2 text-ink-soft hover:bg-surface"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {(batch ? [batch] : batches.filter((b) => !b.past)).map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: BATCH_COLOURS.at(batches.findIndex((x) => x.id === b.id)) ?? "var(--muted)" }}
              />
              {b.name}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <Trophy size={13} className="text-accent" /> Events
          </li>
        </ul>

        {/* Month grid: chips on wider screens, dots on phones */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-7 border-b border-line bg-surface/70">
            {gridDays.slice(0, 7).map((d) => (
              <p key={d} className="py-2 text-center font-mono text-[11px] tracking-wider text-muted uppercase">
                {formatDay(d, { weekday: "short" })}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((d, i) => {
              const inMonth = d.startsWith(month);
              const list = byDay[d];
              const dayEvents = eventsByDay[d];
              const room = Math.max(0, 3 - dayEvents.length);
              const hidden = Math.max(0, dayEvents.length - 3) + Math.max(0, list.length - room);
              return (
                <div
                  key={d}
                  className={clsx(
                    "min-h-16 border-line p-1.5 sm:min-h-28 sm:p-2",
                    i % 7 !== 6 && "border-r",
                    i < gridDays.length - 7 && "border-b",
                    !inMonth && "bg-surface/40",
                  )}
                >
                  <Link
                    href={href({ view: "week", week: d })}
                    aria-label={formatDay(d, { weekday: "long", day: "numeric", month: "long" })}
                    className={clsx(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm hover:bg-surface",
                      d === today ? "bg-brand-gradient text-white hover:bg-none" : inMonth ? "text-ink" : "text-muted/60",
                    )}
                  >
                    {Number(d.slice(8))}
                  </Link>
                  <div className="mt-1 hidden space-y-1 sm:block">
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        href={`/events/${e.slug}`}
                        title={`${eventTimeOn(e, d)} · ${e.name}`}
                        className="flex items-center gap-1 truncate rounded-md border-l-[3px] border-accent bg-accent-tint/60 px-1.5 py-1 text-[11px] leading-tight text-accent-ink hover:bg-accent-tint"
                      >
                        <Trophy size={11} className="shrink-0" />
                        <span className="truncate">{e.name}</span>
                      </Link>
                    ))}
                    {list.slice(0, room).map((s) => (
                      <Link
                        key={s.key}
                        href={`/classes/${s.classId}?day=${s.day}`}
                        title={`${formatTime(s.start)} · ${s.topic}`}
                        className={clsx(
                          "block truncate rounded-md border-l-[3px] bg-card/80 px-1.5 py-1 text-[11px] leading-tight hover:bg-surface",
                          s.cancelled ? "text-muted line-through" : "text-ink-soft",
                        )}
                        style={{ borderLeftColor: colourOf(s) }}
                      >
                        <span className="font-mono text-muted">{formatTime(s.start).replace(":00", "")}</span> {s.topic.replace(/^Week \d+:\s*/, "")}
                      </Link>
                    ))}
                    {hidden > 0 && (
                      <Link href={href({ view: "week", week: d })} className="block px-1.5 text-[11px] text-brand hover:underline">
                        +{hidden} more
                      </Link>
                    )}
                  </div>
                  {list.length + dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                      {dayEvents.map((e) => (
                        <span key={e.id} className="size-1.5 rounded-full bg-accent" />
                      ))}
                      {list.map((s) => (
                        <span key={s.key} className="size-1.5 rounded-full" style={{ background: colourOf(s) }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phones: the month's classes as a list under the grid */}
        <div className="mt-8 space-y-8 sm:hidden">
          {gridDays
            .filter((d) => d.startsWith(month) && hasAnything(d))
            .map((d) => (
              <div key={d}>
                <DayHeading day={d} today={today} inline />
                <div className="mt-3 grid gap-3">
                  {eventsByDay[d].map((e) => (
                    <EventBlock key={e.id} event={e} day={d} />
                  ))}
                  {byDay[d].map((s) => (
                    <SessionCard key={s.key} session={s} batchName={showBatch(s)} />
                  ))}
                </div>
              </div>
            ))}
        </div>
        {!gridDays.some((d) => d.startsWith(month) && hasAnything(d)) && (
          <p className="mt-6 text-center text-sm text-muted">Nothing scheduled this month.</p>
        )}
          </>
        ) : (
          <>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <ViewSwitch view={view} weekHref={href({ view: "week" })} monthHref={href({ view: "month", month: week.slice(0, 7) })} />
            <h2 className="font-serif text-2xl text-ink">{formatWeekRange(week)}</h2>
          </div>
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

        {!days.some(hasAnything) ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-xl text-ink">Nothing scheduled this week</p>
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
                    {!hasAnything(d) ? (
                      <p className="py-2 text-center text-sm text-line">—</p>
                    ) : (
                      <>
                        {eventsByDay[d].map((e) => (
                          <EventBlock key={e.id} event={e} day={d} compact />
                        ))}
                        {byDay[d].map((s) => (
                          <SessionCard key={s.key} session={s} batchName={showBatch(s)} compact />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile & tablet: only days that have classes */}
            <div className="mt-6 space-y-8 lg:hidden">
              {days
                .filter(hasAnything)
                .map((d) => (
                  <div key={d}>
                    <DayHeading day={d} today={today} inline />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {eventsByDay[d].map((e) => (
                        <EventBlock key={e.id} event={e} day={d} />
                      ))}
                      {byDay[d].map((s) => (
                        <SessionCard key={s.key} session={s} batchName={showBatch(s)} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
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

function ViewSwitch({ view, weekHref, monthHref }: { view: View; weekHref: string; monthHref: string }) {
  return (
    <nav aria-label="Calendar view" className="flex rounded-full border border-line bg-card/60 p-0.5 text-sm">
      {(
        [
          ["week", "Week", weekHref],
          ["month", "Month", monthHref],
        ] as const
      ).map(([id, label, link]) => (
        <Link
          key={id}
          href={link}
          aria-current={view === id ? "page" : undefined}
          className={clsx(
            "rounded-full px-3.5 py-1 transition",
            view === id ? "bg-brand-gradient text-white" : "text-ink-soft hover:text-ink",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
