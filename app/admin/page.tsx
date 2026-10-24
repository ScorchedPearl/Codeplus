import Link from "next/link";
import { count, gt } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { classes, contests, events, members } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminHome() {
  await requireMember();
  const [[upcoming], [classCount], [contestCount], [memberCount]] = await Promise.all([
    db.select({ n: count() }).from(events).where(gt(events.endTime, new Date())),
    db.select({ n: count() }).from(classes),
    db.select({ n: count() }).from(contests),
    db.select({ n: count() }).from(members),
  ]);

  const cards = [
    { href: "/admin/events", label: "Upcoming events", n: upcoming.n, cta: "Add an event" },
    { href: "/admin/timetable", label: "Classes in the timetable", n: classCount.n, cta: "Edit timetable" },
    { href: "/admin/leaderboard", label: "Contests on the leaderboard", n: contestCount.n, cta: "Upload a ranklist" },
    { href: "/admin/members", label: "Member accounts", n: memberCount.n, cta: "Manage members" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" intro="Changes you make here show up on the public site within a minute." />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-line bg-card/60 p-6 transition hover:border-brand/30 hover:bg-card"
          >
            <p className="font-serif text-4xl text-ink">{c.n}</p>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              {c.cta} <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
