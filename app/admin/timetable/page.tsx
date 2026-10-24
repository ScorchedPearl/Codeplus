import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Pencil, Repeat } from "lucide-react";
import { db } from "@/lib/db";
import { batches, classes } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { scheduleSummary } from "@/lib/calendar-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { BatchForm } from "./forms";
import { deleteBatch } from "./actions";

export const metadata: Metadata = { title: "Timetable" };

export default async function AdminTimetable({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireMember();
  const { saved } = await searchParams;
  const [batchRows, classRows] = await Promise.all([
    db.select().from(batches).orderBy(asc(batches.sortOrder), asc(batches.name)),
    db.select().from(classes).orderBy(asc(classes.startTime)),
  ]);

  return (
    <>
      <PageHeader
        title="Timetable & batches"
        intro="Add as many batches as you need, then their classes. Everything here shows on the Calendar page. All times are IST."
        action={batchRows.length ? { href: "/admin/timetable/new", label: "New class" } : undefined}
      />
      {saved && <p className="mb-4 rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand">Saved. The calendar updates right away.</p>}

      <div className="space-y-6">
        {batchRows.map((b) => {
          const list = classRows.filter((c) => c.batchId === b.id);
          return (
            <Panel key={b.id} title={b.name}>
              {list.length === 0 ? (
                <p className="text-sm text-muted">No classes yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {list.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{c.topic}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          {c.repeatUntil && <Repeat size={12} />}
                          {scheduleSummary(c)}
                          {c.cancelledDates.length > 0 && ` · ${c.cancelledDates.length} cancelled`}
                        </p>
                      </div>
                      <Link
                        href={`/admin/timetable/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft hover:bg-surface"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <details className="mt-4 border-t border-line pt-4">
                <summary className="cursor-pointer text-sm text-muted hover:text-ink">Rename or remove batch</summary>
                <div className="mt-4 space-y-4">
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
            </Panel>
          );
        })}

        <Panel title="Add a batch">
          <BatchForm nextOrder={Math.max(0, ...batchRows.map((b) => b.sortOrder)) + 1} />
        </Panel>
      </div>
    </>
  );
}
