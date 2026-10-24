import type { Metadata } from "next";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { getBatches } from "@/lib/classes";
import { toIstInput } from "@/lib/admin-utils";
import { addDays, dayKey, formatDay, sessionsBetween } from "@/lib/calendar-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { ClassForm } from "../forms";
import { deleteClass, toggleCancelled } from "../actions";

export const metadata: Metadata = { title: "Edit class" };

export default async function EditClass({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [[c], batches] = await Promise.all([db.select().from(classes).where(eq(classes.id, id)).limit(1), getBatches()]);
  if (!c) notFound();

  // Upcoming weeks of a repeating class, to cancel or restore individually
  const today = dayKey(new Date());
  const sessions = c.repeatUntil
    ? sessionsBetween([c], today, addDays(c.repeatUntil, 1)).slice(0, 16)
    : [];

  return (
    <>
      <PageHeader title="Edit class" />
      <ClassForm
        batches={batches}
        initial={{
          id: c.id,
          batchId: c.batchId,
          topic: c.topic,
          description: c.description ?? "",
          tas: c.tas.join(", "),
          venue: c.venue ?? "",
          link: c.link ?? "",
          startTime: toIstInput(c.startTime),
          endTime: toIstInput(c.endTime),
          repeatUntil: c.repeatUntil ?? "",
        }}
      />

      {c.repeatUntil && (
        <Panel title="Upcoming weeks" className="mt-10">
          <p className="mb-4 text-sm text-muted">Cancel a single week (a holiday, exams) without changing the rest.</p>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted">No upcoming sessions.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {sessions.map((s) => (
                <li
                  key={s.key}
                  className={clsx(
                    "flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5",
                    s.cancelled ? "border-dashed border-line" : "border-line bg-card/60",
                  )}
                >
                  <span className={clsx("text-sm", s.cancelled ? "text-muted line-through" : "text-ink")}>
                    {formatDay(s.day, { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <form action={toggleCancelled}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="day" value={s.day} />
                    <button className={clsx("text-xs font-medium", s.cancelled ? "text-brand" : "text-accent-ink")}>
                      {s.cancelled ? "Restore" : "Cancel"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <Panel title="Delete class" className="mt-6">
        <p className="mb-4 text-sm text-muted">Removes every session of this class from the calendar.</p>
        <form action={deleteClass}>
          <input type="hidden" name="id" value={c.id} />
          <SubmitButton variant="danger" confirm={`Delete "${c.topic}" and all its sessions?`}>
            Delete class
          </SubmitButton>
        </form>
      </Panel>
    </>
  );
}
