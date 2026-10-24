import Image from "next/image";
import clsx from "clsx";
import { ChevronDown, History, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { previousTeams, team, type TeamMember } from "@/lib/team";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function Avatar({ member, size }: { member: TeamMember; size: "lg" | "md" }) {
  const box = size === "lg" ? "size-20 text-2xl" : "size-14 text-lg";
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt=""
        width={80}
        height={80}
        className={clsx(box, "rounded-full object-cover ring-4 ring-bg")}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={clsx(
        box,
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-tint to-surface-2 font-serif text-brand ring-4 ring-bg",
      )}
    >
      {initials(member.name)}
    </span>
  );
}

export function Team() {
  const coordinators = team.filter((m) => m.role === "Coordinator");
  const seniors = team.filter((m) => m.role === "Senior Member");

  return (
    <section className="bg-surface/60 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="The team"
          title="The people behind CodePlus"
          intro="Coordinators and senior members who run the classes, set the problems and keep the club going."
          align="center"
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {coordinators.map((m) => (
            <article key={m.name} className="flex items-center gap-5 rounded-2xl border border-line bg-card/70 p-6">
              <Avatar member={m} size="lg" />
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-wider text-accent uppercase">{m.role}</p>
                <h3 className="mt-1 font-serif text-xl text-ink">{m.name}</h3>
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-sm text-muted hover:text-brand"
                  >
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {seniors.map((m) => (
            <article
              key={m.name}
              className="flex flex-col items-center rounded-2xl border border-line bg-card/60 px-4 py-6 text-center"
            >
              <Avatar member={m} size="md" />
              <h3 className="mt-4 font-serif text-lg leading-tight text-ink">{m.name}</h3>
              <p className="mt-1 font-mono text-[11px] tracking-wider text-muted uppercase">{m.role}</p>
            </article>
          ))}
        </div>

        {previousTeams.length > 0 && (
          <details className="group mx-auto mt-10 max-w-3xl">
            <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-card/60 px-5 py-2.5 text-sm text-ink-soft transition hover:border-brand/30 hover:text-ink">
              <History size={16} />
              <span className="group-open:hidden">See previous teams</span>
              <span className="hidden group-open:inline">Hide previous teams</span>
              <ChevronDown size={16} className="transition group-open:rotate-180" />
            </summary>

            <div className="mt-6 space-y-4">
              {previousTeams.map((t) =>
                t.members.length === 0 ? (
                  <div
                    key={t.label}
                    className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-10 text-center"
                  >
                    <p className="font-serif text-xl text-ink">{t.label}</p>
                    <span className="mt-3 rounded-full bg-accent-tint px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent-ink uppercase">
                      Upcoming
                    </span>
                    <p className="mt-3 text-sm text-muted">We&apos;re putting this together. Check back soon.</p>
                  </div>
                ) : (
                  <div key={t.label} className="rounded-2xl border border-line bg-card/60 p-6">
                    <p className="text-center font-serif text-xl text-ink">{t.label}</p>
                    <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {t.members.map((m) => (
                        <li key={m.name} className="flex flex-col items-center text-center">
                          <Avatar member={m} size="md" />
                          <p className="mt-3 font-serif text-ink">{m.name}</p>
                          <p className="font-mono text-[11px] tracking-wider text-muted uppercase">{m.role}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          </details>
        )}
      </Container>
    </section>
  );
}
