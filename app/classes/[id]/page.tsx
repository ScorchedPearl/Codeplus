import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowUpRight, Clock, Download, MapPin, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Markdown } from "@/components/notes/Markdown";
import { getBatches, getClass } from "@/lib/classes";
import { feedbackCookieName } from "@/lib/feedback";
import { addDays, dayKey, formatDay, formatTime, sessionsBetween } from "@/lib/calendar-utils";
import { FeedbackForm, FeedbackThanks } from "./FeedbackForm";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string }> };

const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = isUuid(id) ? await getClass(id) : null;
  return c ? { title: c.topic, description: c.description ?? undefined } : { title: "Class not found" };
}

export default async function ClassPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { day } = await searchParams;
  if (!isUuid(id)) notFound();
  const c = await getClass(id);
  if (!c) notFound();

  const first = dayKey(c.startTime);
  const sessions = sessionsBetween([c], first, addDays(c.repeatUntil ?? first, 1));
  const now = new Date();
  const started = sessions.filter((s) => new Date(s.start) <= now);
  const session =
    sessions.find((s) => s.day === day) ?? started.at(-1) ?? sessions[0];
  if (!session) notFound();

  const batch = (await getBatches()).find((b) => b.id === c.batchId);
  const hasStarted = new Date(session.start) <= now;
  const alreadySent = (await cookies()).has(feedbackCookieName(c.id, session.day));
  const dateLabel = formatDay(session.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="-mt-16 bg-glow pt-16">
      <Container className="max-w-3xl pt-10 sm:pt-14">
        <Link href="/calendar" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> Calendar
        </Link>

        <header className="mt-8">
          {batch && <p className="font-mono text-xs tracking-wider text-brand uppercase">{batch.name}</p>}
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{c.topic}</h1>
          <div className="mt-4 space-y-1.5 text-muted">
            <p className="flex items-center gap-2">
              <Clock size={15} className="shrink-0" />
              {dateLabel}, {formatTime(session.start)} – {formatTime(session.end)} IST
              {session.cancelled && (
                <span className="rounded-full bg-accent-tint px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink uppercase">
                  Cancelled
                </span>
              )}
            </p>
            {c.venue && (
              <p className="flex items-center gap-2">
                <MapPin size={15} className="shrink-0" /> {c.venue}
              </p>
            )}
            {c.tas.length > 0 && (
              <p className="flex items-center gap-2">
                <User size={15} className="shrink-0" /> {c.tas.join(", ")}
              </p>
            )}
          </div>
          {c.description && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{c.description}</p>}

          {(c.slides || c.link) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {c.slides && (
                <a
                  href={c.slides}
                  className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
                >
                  <Download size={16} /> Download slides
                </a>
              )}
              {c.link && (
                <a
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-5 py-2.5 text-sm text-ink hover:bg-card"
                >
                  Class material <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          )}
        </header>

        {sessions.length > 1 && started.length > 1 && (
          <nav aria-label="Session" className="mt-8 flex flex-wrap gap-2">
            {started.slice(-8).map((s) => (
              <Link
                key={s.key}
                href={`/classes/${c.id}?day=${s.day}`}
                aria-current={s.day === session.day ? "page" : undefined}
                className={clsx(
                  "rounded-full border px-3 py-1 text-sm",
                  s.day === session.day ? "border-brand/40 bg-brand-tint text-brand" : "border-line text-muted hover:text-ink",
                )}
              >
                {formatDay(s.day, { day: "numeric", month: "short" })}
              </Link>
            ))}
          </nav>
        )}

        {c.notes && (
          <section className="mt-12 border-t border-line pt-10">
            <p className="font-mono text-xs tracking-wider text-brand uppercase">Class notes</p>
            <div className="mt-4">
              <Markdown>{c.notes}</Markdown>
            </div>
          </section>
        )}

        <section id="feedback" className="mt-12 scroll-mt-24 border-t border-line pt-10">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Feedback</p>
          <h2 className="mt-2 mb-6 font-serif text-3xl text-ink">Tell us how the class went</h2>
          {session.cancelled ? (
            <p className="text-muted">This session was cancelled, so there&apos;s nothing to review.</p>
          ) : !hasStarted ? (
            <p className="text-muted">Feedback opens when the class starts.</p>
          ) : alreadySent ? (
            <FeedbackThanks />
          ) : (
            <FeedbackForm key={session.key} classId={c.id} day={session.day} />
          )}
        </section>
      </Container>
    </article>
  );
}
