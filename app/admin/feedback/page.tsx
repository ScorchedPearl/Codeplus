import type { Metadata } from "next";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { getAllFeedback } from "@/lib/feedback";
import { formatDay } from "@/lib/calendar-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { deleteFeedback } from "./actions";

export const metadata: Metadata = { title: "Feedback" };

const paceLabels: Record<string, string> = { slow: "Too slow", right: "Just right", fast: "Too fast" };

export default async function AdminFeedback() {
  await requireMember();
  const rows = await getAllFeedback();

  const sessions = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.classId}:${r.day}`;
    sessions.set(key, [...(sessions.get(key) ?? []), r]);
  }

  return (
    <>
      <PageHeader title="Feedback" intro="What students said about each class. Only signed-in members can see this page." />

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">
          No feedback yet. Students can send it from each class page once the class has started.
        </p>
      ) : (
        <div className="space-y-6">
          {[...sessions.entries()].map(([key, list]) => {
            const { classId, day, topic, batch } = list[0];
            const average = list.reduce((s, r) => s + r.rating, 0) / list.length;
            const paceCounts = Object.keys(paceLabels)
              .map((p) => ({ label: paceLabels[p], n: list.filter((r) => r.pace === p).length }))
              .filter((p) => p.n > 0);
            const comments = list.filter((r) => r.liked || r.improve);

            return (
              <Panel key={key}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl text-ink">
                      <Link href={`/classes/${classId}?day=${day}`} className="hover:text-brand">
                        {topic}
                      </Link>
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {formatDay(day, { day: "numeric", month: "short", year: "numeric" })} · {batch}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1.5 font-serif text-3xl text-ink">
                      <Star size={20} className="fill-accent text-accent" /> {average.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted">
                      {list.length} response{list.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = list.filter((r) => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-2 font-mono text-xs text-muted">
                        <span className="w-3 text-right">{star}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${(n / list.length) * 100}%` }} />
                        </div>
                        <span className="w-5 text-right">{n}</span>
                      </div>
                    );
                  })}
                </div>

                {paceCounts.length > 0 && (
                  <p className="mt-3 text-sm text-muted">Pace: {paceCounts.map((p) => `${p.label} (${p.n})`).join(" · ")}</p>
                )}

                {comments.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {comments.map((r) => (
                      <li key={r.id} className="rounded-xl bg-surface/60 p-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-xs text-muted">
                            {r.rating}/5 · {r.name ?? "Anonymous"}
                          </p>
                          <form action={deleteFeedback}>
                            <input type="hidden" name="id" value={r.id} />
                            <SubmitButton variant="danger" className="px-2.5! py-1!" confirm="Delete this feedback?">
                              <Trash2 size={13} />
                              <span className="sr-only">Delete</span>
                            </SubmitButton>
                          </form>
                        </div>
                        {r.liked && (
                          <p className="mt-2 whitespace-pre-line text-ink-soft">
                            <span className="text-brand">Worked well: </span>
                            {r.liked}
                          </p>
                        )}
                        {r.improve && (
                          <p className="mt-2 whitespace-pre-line text-ink-soft">
                            <span className="text-accent-ink">Could be better: </span>
                            {r.improve}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
