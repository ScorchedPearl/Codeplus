import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { asc } from "drizzle-orm";
import { ChevronRight, History, Pencil, Plus, Repeat, Settings2 } from "lucide-react";
import { db } from "@/lib/db";
import { batches, classes } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { addDays, dayKey, dayStart, formatDay, formatTime, scheduleSummary, weekOf } from "@/lib/calendar-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { BatchForm } from "./forms";
import { deleteBatch } from "./actions";

export const metadata: Metadata = { title: "Timetable" };

const WEEK_RE = /^Week (\d+):\s*(.+)$/;

type ClassRow = typeof classes.$inferSelect;

/** A batch's classes grouped into weeks: by their "Week N:" name, or by calendar week when they have none */
function groupByWeek(list: ClassRow[]) {
  const groups = new Map<string, { label: string; rows: ClassRow[] }>();
  for (const c of list) {
    const m = c.topic.match(WEEK_RE);
    const key = m ? `n${m[1].padStart(3, "0")}` : `d${weekOf(dayKey(c.startTime))}`;
    const group = groups.get(key) ?? { label: m ? `Week ${m[1]}` : "", rows: [] };
    group.rows.push(c);
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.rows[0].startTime.getTime() - b.rows[0].startTime.getTime())
    .map((g, i) => ({ ...g, label: g.label || `Week ${i + 1}` }));
}

export default async function AdminTimetable({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; open?: string }>;
}) {
  await requireMember();
  const { saved, open } = await searchParams;
  const [batchRows, classRows] = await Promise.all([
    db.select().from(batches).orderBy(asc(batches.sortOrder), asc(batches.name)),
    db.select().from(classes).orderBy(asc(classes.startTime)),
  ]);
  const now = new Date();

  // A batch is past once all its classes are over (a weekly class counts until its last week)
  const isPast = (batchId: string) => {
    const own = classRows.filter((c) => c.batchId === batchId);
    return (
      own.length > 0 &&
      own.every((c) => (c.repeatUntil ? dayStart(addDays(c.repeatUntil, 1)) : c.endTime).getTime() <= now.getTime())
    );
  };
  const current = batchRows.filter((b) => !isPast(b.id));
  const past = batchRows.filter((b) => isPast(b.id));

  const renderBatch = (b: (typeof batchRows)[number]) => {
    const list = classRows.filter((c) => c.batchId === b.id);
    const weeks = groupByWeek(list);
    const doneWeeks = weeks.filter((w) => w.rows.every((c) => (c.repeatUntil ? false : c.endTime <= now))).length;
    const next = list.find((c) => c.endTime > now);

    return (
      <details
        key={b.id}
        id={`batch-${b.id}`}
        open={open === b.id}
        className="group scroll-mt-24 rounded-2xl border border-line bg-card/60 open:border-brand/30"
      >
        <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 transition hover:bg-surface/60 [&::-webkit-details-marker]:hidden">
          <ChevronRight size={18} className="shrink-0 text-muted transition group-open:rotate-90 group-open:text-brand" />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-xl text-ink">{b.name}</p>
            <p className="mt-0.5 text-sm text-muted">
              {list.length === 0
                ? "No classes yet"
                : `${weeks.length} week${weeks.length === 1 ? "" : "s"} · ${list.length} class${list.length === 1 ? "" : "es"}`}
              {next && ` · next ${formatDay(dayKey(next.startTime), { weekday: "short", day: "numeric", month: "short" })}`}
            </p>
          </div>
          {weeks.length > 0 && (
            <div className="hidden w-32 sm:block">
              <p className="text-right font-mono text-xs text-muted">
                {doneWeeks}/{weeks.length} weeks done
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(doneWeeks / weeks.length) * 100}%` }} />
              </div>
            </div>
          )}
        </summary>

        <div className="border-t border-line px-5 pt-4 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/timetable/new?batch=${b.id}`}
              className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              <Plus size={15} /> Add class to {b.name}
            </Link>
            <Link
              href={`/calendar?batch=${b.slug}`}
              target="_blank"
              className="rounded-full px-3 py-2 text-sm text-brand hover:bg-surface"
            >
              View on calendar
            </Link>
          </div>

          {weeks.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No classes in this batch yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {weeks.map((w) => {
                const first = dayKey(w.rows[0].startTime);
                const last = dayKey(w.rows.at(-1)!.startTime);
                const past = w.rows.every((c) => !c.repeatUntil && c.endTime <= now);
                return (
                  <section key={w.label + first}>
                    <h3 className="flex items-baseline gap-2 font-mono text-xs tracking-wider text-muted uppercase">
                      <span className={clsx(past ? "text-muted" : "text-brand")}>{w.label}</span>
                      <span>
                        {formatDay(first, { day: "numeric", month: "short" })}
                        {last !== first && ` – ${formatDay(last, { day: "numeric", month: "short" })}`}
                      </span>
                      {past && <span className="rounded-full bg-surface px-1.5 normal-case">done</span>}
                    </h3>
                    <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line">
                      {w.rows.map((c) => (
                        <li key={c.id} className={clsx("flex flex-wrap items-center gap-3 px-4 py-3", past && "opacity-70")}>
                          <span className="w-24 shrink-0 font-mono text-xs text-muted">
                            {formatDay(dayKey(c.startTime), { weekday: "short" })} {formatTime(c.startTime.toISOString())}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{c.topic.replace(WEEK_RE, "$2")}</p>
                            {(c.repeatUntil || c.cancelledDates.length > 0) && (
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                                {c.repeatUntil && <Repeat size={12} />}
                                {c.repeatUntil && scheduleSummary(c)}
                                {c.cancelledDates.length > 0 && ` · ${c.cancelledDates.length} cancelled`}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/admin/timetable/${c.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm text-ink-soft hover:bg-surface"
                          >
                            <Pencil size={13} /> Edit
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          <details className="group/settings mt-6 rounded-xl border border-line">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
              <Settings2 size={15} className="text-muted" /> Batch settings: rename, reorder or delete
              <ChevronRight size={15} className="ml-auto text-muted transition group-open/settings:rotate-90" />
            </summary>
            <div className="space-y-4 border-t border-line p-4">
              <BatchForm batch={b} />
              <form action={deleteBatch}>
                <input type="hidden" name="id" value={b.id} />
                <SubmitButton
                  variant="danger"
                  confirm={`Delete "${b.name}" and all ${list.length} of its classes? Contests for this batch become open to all batches.`}
                >
                  Delete batch
                </SubmitButton>
              </form>
            </div>
          </details>
        </div>
      </details>
    );
};

  return (
    <>
      <PageHeader
        title="Timetable & batches"
        intro="Open a batch to see and edit its classes. Everything here shows on the Calendar page. All times are IST."
        action={batchRows.length ? { href: "/admin/timetable/new", label: "New class" } : undefined}
      />
      {saved && <p className="mb-4 rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand">Saved. The calendar updates right away.</p>}

      <div className="space-y-3">
        {current.map(renderBatch)}

        {past.length > 0 && (
          <section className="pt-6">
            <h2 className="mb-1 flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase">
              <History size={14} /> Past batches
            </h2>
            <p className="mb-3 text-sm text-muted">
              Batches whose classes are all over. They stay on the site under &ldquo;Past batches&rdquo;.
            </p>
            <div className="space-y-3">{past.map(renderBatch)}</div>
          </section>
        )}

        <Panel title="Add a batch" className="mt-6">
          <BatchForm nextOrder={Math.max(0, ...batchRows.map((b) => b.sortOrder)) + 1} />
        </Panel>
      </div>
    </>
  );
}
