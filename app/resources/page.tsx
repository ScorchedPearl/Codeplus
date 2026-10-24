import type { Metadata } from "next";
import clsx from "clsx";
import {
  ArrowUpRight,
  BookOpenCheck,
  Globe,
  HandHeart,
  ListChecks,
  ListVideo,
  Mail,
  NotebookPen,
  Puzzle,
  SquarePlay,
  Terminal,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { resourceSections, type Resource, type ResourceKind } from "@/lib/resources";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description: "Setup guides, extensions and the best places to learn competitive programming, picked by CodePlus TAs.",
};

const kindIcon: Record<ResourceKind, LucideIcon> = {
  video: SquarePlay,
  playlist: ListVideo,
  channel: Tv,
  extension: Puzzle,
  website: Globe,
  blog: NotebookPen,
  tool: Terminal,
  sheet: ListChecks,
};

function ResourceRow({ item }: { item: Resource }) {
  const Icon = kindIcon[item.kind];
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-surface"
      >
        <span
          className={clsx(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
            item.mustFollow ? "bg-brand-tint text-brand" : "bg-surface text-muted group-hover:bg-surface-2",
          )}
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-ink group-hover:text-brand">{item.title}</span>
          {item.source && <span className="block truncate font-mono text-xs text-muted">{item.source}</span>}
        </span>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        />
      </a>
    </li>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-10 sm:pt-20">
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Resources & blogs</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Learn at your own pace</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Everything our TAs recommend, from setting up your editor to the problem sets worth grinding.
          </p>
          <nav aria-label="Jump to section" className="mt-8 flex flex-wrap gap-2">
            {[...resourceSections.map((s) => ({ id: s.id, label: s.title })), { id: "cses-solutions", label: "CSES solutions" }].map(
              (s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-full border border-line bg-card/60 px-3.5 py-1.5 text-sm text-ink-soft hover:border-brand/30 hover:text-ink"
                >
                  {s.label}
                </a>
              ),
            )}
          </nav>
        </Container>
      </section>

      <Container className="space-y-20">
        {resourceSections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <p className="font-mono text-xs tracking-wider text-brand uppercase">{section.eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">{section.title}</h2>
            <p className="mt-2 max-w-xl text-muted">{section.intro}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {section.groups.map((group) => (
                <div
                  key={group.title}
                  className={clsx(
                    "rounded-2xl border bg-card/60 p-3",
                    group.items.some((i) => i.mustFollow) ? "border-brand/30 md:col-span-2" : "border-line",
                  )}
                >
                  <div className="px-3 pt-3 pb-1">
                    <h3 className="flex items-center gap-2 font-serif text-xl text-ink">
                      {group.title}
                      {group.items.some((i) => i.mustFollow) && (
                        <span className="rounded-full bg-accent-tint px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink uppercase">
                          Start here
                        </span>
                      )}
                    </h3>
                    {group.note && <p className="mt-1 text-sm text-muted">{group.note}</p>}
                  </div>
                  <ul
                    className={clsx(
                      "mt-1",
                      group.items.some((i) => i.mustFollow) && "md:grid md:grid-cols-2 md:gap-x-2",
                    )}
                  >
                    {group.items.map((item) => (
                      <ResourceRow key={item.url + item.title} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section id="cses-solutions" className="scroll-mt-24">
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-dashed border-line p-8 sm:flex-row sm:items-center">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <BookOpenCheck size={22} />
            </span>
            <div className="flex-1">
              <h2 className="flex flex-wrap items-center gap-2 font-serif text-2xl text-ink">
                CSES solutions
                <span className="rounded-full bg-accent-tint px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent-ink uppercase">
                  Upcoming
                </span>
              </h2>
              <p className="mt-1.5 max-w-xl text-muted">
                Explained solutions to the CSES Problem Set, written by CodePlus TAs. Coming soon.
              </p>
            </div>
          </div>
        </section>

        <section id="contribute" className="scroll-mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/70 px-6 py-10 text-center sm:px-12">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <HandHeart size={22} />
            </span>
            <h2 className="mt-5 font-serif text-3xl text-ink">Want to contribute a resource?</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Found a blog, video, problem set or tool that helped you level up? Send it our way and we&apos;ll add it to the
              list.
            </p>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("CodePlus resource suggestion")}&body=${encodeURIComponent("Resource name:\nLink:\nWhy it's useful:\n")}`}
              className="bg-brand-gradient mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
            >
              <Mail size={16} /> Contact us
            </a>
          </div>
        </section>
      </Container>
    </>
  );
}
