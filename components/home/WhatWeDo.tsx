import { BookOpen, Trophy, Wrench, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const items = [
  {
    icon: BookOpen,
    title: "Training sessions",
    body: "Weekly classes that build from basics and STL to graphs, DP and number theory, taught by senior TAs.",
  },
  {
    icon: Trophy,
    title: "Contests",
    body: "Regular Codeforces-style contests to practise under time pressure, with a running leaderboard.",
  },
  {
    icon: Wrench,
    title: "Workshops",
    body: "Deep dives on a single topic or technique, with problems to try during the session.",
  },
  {
    icon: Users,
    title: "Mentorship",
    body: "Seniors who've been where you are, ready to review your approach and help when you're stuck.",
  },
];

export function WhatWeDo() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="Everything you need to get good at CP"
          intro="CodePlus runs on a Teaching Assistantship model: seniors who are strong problem solvers are selected as TAs and take charge of the club's teaching."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="group rounded-2xl border border-line bg-card/60 p-6 transition hover:-translate-y-0.5 hover:border-brand/25 hover:bg-card"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
