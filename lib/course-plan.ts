import "server-only";
import { getAllClasses, getBatches } from "@/lib/classes";
import { addDays, dayKey, sessionsBetween, weekOf, type Session } from "@/lib/calendar-utils";

export type WeekStatus = "done" | "current" | "next" | "upcoming";

export type PlanWeek = {
  key: string;
  number: number | null;
  title: string;
  goal: string | null;
  firstDay: string;
  lastDay: string;
  href: string;
  status: WeekStatus;
  isContest: boolean;
};

export type BatchPlan = { id: string; slug: string; name: string; weeks: PlanWeek[]; done: number };

// Classes named "Week 3: Sorting" are one step of the plan, so a week's Saturday class and Sunday
// practice share a step. Classes without a week number are grouped by calendar week instead: a
// Saturday and Sunday class on the same topic are one week of the course.
const WEEK_RE = /^Week (\d+):\s*(.+)$/;
const GOAL_PREFIX = /^By the end of this week you can:\s*/i;

function statusOf(sessions: Session[], now: Date): Exclude<WeekStatus, "next"> {
  const held = sessions.filter((s) => !s.cancelled);
  if (held.length && held.every((s) => new Date(s.end) <= now)) return "done";
  if (held.some((s) => new Date(s.start) <= now)) return "current";
  return "upcoming";
}

export async function getCoursePlan(now = new Date()): Promise<BatchPlan[]> {
  const [batches, rows] = await Promise.all([getBatches(), getAllClasses()]);

  return batches
    .map((batch) => {
      const own = rows.filter((r) => r.batchId === batch.id);
      if (own.length === 0) return null;
      const from = dayKey(own[0].startTime);
      const to = own.reduce((last, r) => {
        const end = r.repeatUntil ?? dayKey(r.startTime);
        return end > last ? end : last;
      }, from);

      const groups = new Map<string, Session[]>();
      for (const s of sessionsBetween(own, from, addDays(to, 1))) {
        const m = s.topic.match(WEEK_RE);
        const key = m ? `week-${m[1]}` : `cal-${weekOf(s.day)}`;
        groups.set(key, [...(groups.get(key) ?? []), s]);
      }

      const weeks: PlanWeek[] = [...groups.entries()].map(([key, sessions]) => {
        const first = sessions[0];
        const m = first.topic.match(WEEK_RE);
        const title = m ? m[2] : [...new Set(sessions.map((s) => s.topic))].join(" · ");
        const goal = first.description?.replace(GOAL_PREFIX, "") ?? null;
        return {
          key,
          number: m ? Number(m[1]) : null,
          title,
          goal: goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : null,
          firstDay: first.day,
          lastDay: sessions.at(-1)!.day,
          href: `/classes/${first.classId}?day=${first.day}`,
          status: statusOf(sessions, now),
          isContest: /contest|mock/i.test(title),
        };
      });
      weeks.sort((a, b) => a.firstDay.localeCompare(b.firstDay));
      // Weeks without a "Week N" name are numbered by their place in the plan
      weeks.forEach((w, i) => {
        w.number ??= i + 1;
      });
      if (!weeks.some((w) => w.status === "current")) {
        const next = weeks.find((w) => w.status === "upcoming");
        if (next) next.status = "next";
      }

      return { ...batch, weeks, done: weeks.filter((w) => w.status === "done").length };
    })
    .filter((b): b is BatchPlan => b !== null);
}
