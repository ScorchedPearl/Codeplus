import Image from "next/image";
import clsx from "clsx";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { team, type TeamMember } from "@/lib/team";

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
      </Container>
    </section>
  );
}
