import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BatchNav } from "@/components/ui/BatchNav";
import { InfoTip } from "@/components/ui/InfoTip";
import { CourseMap } from "@/components/course/CourseMap";
import { getCoursePlan } from "@/lib/course-plan";
import { formatDay } from "@/lib/calendar-utils";

export const metadata: Metadata = {
  title: "Course plan",
  description: "Week by week, what each CodePlus batch learns, and how far each one has come.",
};

type Props = { searchParams: Promise<{ batch?: string }> };

const legend = [
  { label: "Done", dot: "bg-[#3a5dab]" },
  { label: "This week", dot: "border-[3px] border-accent bg-card" },
  { label: "Up next", dot: "border-2 border-brand/70 bg-card" },
  { label: "Coming up", dot: "border border-line bg-card" },
];

export default async function CoursePage({ searchParams }: Props) {
  const { batch: slug } = await searchParams;
  const plans = await getCoursePlan();
  // Open on a current batch unless one is picked; finished batches live under "Past batches"
  const plan = plans.find((p) => p.slug === slug) ?? plans.find((p) => !p.past) ?? plans[0];

  const total = plan?.weeks.length ?? 0;
  const percent = total ? Math.round(((plan?.done ?? 0) / total) * 100) : 0;
  const focus = plan?.weeks.find((w) => w.status === "current") ?? plan?.weeks.find((w) => w.status === "next");
  const finished = !!plan && total > 0 && plan.done === total;

  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-8 sm:pt-20">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Course plan</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">The road to your first contest</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Every week of the course on one map. It fills in as classes are completed. Tap a week for its notes and
            practice problems.
          </p>
          <InfoTip id="plan-note" label="Plan may change">
            This plan may change as the course goes on. Once it&apos;s complete, more topics will be added depending on the
            students&apos; enthusiasm.
          </InfoTip>

          {plans.length > 1 && (
            <BatchNav
              className="mt-8"
              items={plans.map((p) => ({
                key: p.id,
                label: p.name,
                href: `/course?batch=${p.slug}`,
                active: p.id === plan?.id,
                past: p.past,
              }))}
            />
          )}
        </Container>
      </section>

      <Container>
        {!plan ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-xl text-ink">The course plan is on its way</p>
            <p className="mt-1.5 text-sm text-muted">Classes will show up here once the timetable is out.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-line bg-card/60 p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs tracking-wider text-muted uppercase">Progress</p>
                    <p className="mt-2 font-serif text-4xl text-ink">
                      {plan.done}
                      <span className="text-2xl text-muted">
                        {" "}
                        / {total} week{total === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  <p className="font-serif text-3xl text-brand">{percent}%</p>
                </div>
                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${plan.name} progress`}>
                  <div className="course-bar h-full rounded-full bg-brand-gradient" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-line bg-card/60 p-6">
                {finished ? (
                  <>
                    <p className="font-mono text-xs tracking-wider text-brand uppercase">Complete</p>
                    <p className="mt-2 font-serif text-2xl text-ink">Every week is done. Well played!</p>
                  </>
                ) : focus ? (
                  <Link href={focus.href} className="group">
                    <p className={clsx("font-mono text-xs tracking-wider uppercase", focus.status === "current" ? "text-accent-ink" : "text-brand")}>
                      {focus.status === "current" ? "This week" : "Up next"} · {formatDay(focus.firstDay, { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-snug text-ink group-hover:text-brand">{focus.title}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand">
                      Notes and practice <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                    </p>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                {legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-2">
                    <span className={clsx("size-3.5 rounded-full", l.dot)} /> {l.label}
                  </li>
                ))}
              </ul>
              <Link href={`/calendar?batch=${plan.slug}`} className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
                <CalendarDays size={15} /> Exact times on the calendar
              </Link>
            </div>

            <div className="mt-14 rounded-3xl border border-line bg-surface/40 px-4 pt-14 pb-2 sm:px-8">
              <CourseMap weeks={plan.weeks} cols={4} className="hidden md:block" />
              <CourseMap weeks={plan.weeks} cols={2} className="md:hidden" />
            </div>
          </>
        )}
      </Container>
    </>
  );
}
