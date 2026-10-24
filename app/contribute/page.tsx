import type { Metadata } from "next";
import { ArrowUpRight, Bug, Code2, Construction, Lightbulb, Library } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contribute",
  description: "The CodePlus website is open source and under construction. Here's how to help build it.",
};

const issue = (template: string) => `${site.github}/issues/new?template=${template}`;

const ways = [
  {
    icon: Bug,
    title: "Report a bug",
    body: "Something broken or looking off? Tell us which page and what happened.",
    href: issue("bug_report.yml"),
    cta: "Open a bug report",
  },
  {
    icon: Lightbulb,
    title: "Suggest a feature",
    body: "An idea that would make the site more useful for students or TAs.",
    href: issue("feature_request.yml"),
    cta: "Share an idea",
  },
  {
    icon: Library,
    title: "Add a resource",
    body: "A blog, video, sheet or tool that helped you. Suggest it, or add it to lib/resources.ts yourself.",
    href: issue("resource_suggestion.yml"),
    cta: "Suggest a resource",
  },
  {
    icon: Code2,
    title: "Write code",
    body: "Pick an open issue, especially ones labelled good first issue, and send a pull request.",
    href: `${site.github}/issues`,
    cta: "Browse issues",
  },
];

const setup = [
  { cmd: `git clone ${site.github}.git`, note: "or fork it first" },
  { cmd: "cd Codeplus && npm install" },
  { cmd: "cp .env.example .env.local", note: "add your own free Supabase database" },
  { cmd: "npm run db:migrate" },
  { cmd: "npm run dev", note: "open localhost:3000" },
];

const stack = ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Drizzle ORM", "Vercel"];

export default function ContributePage() {
  return (
    <>
      <section className="-mt-16 bg-glow pt-16">
        <Container className="pt-16 pb-12 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-tint px-3 py-1 font-mono text-xs text-accent-ink">
            <Construction size={14} /> Under construction
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-ink sm:text-6xl">
            This website is <em className="text-gradient pr-1">open source</em>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            The CodePlus site is still being built, and it&apos;s being built in the open. Students, TAs and anyone who
            wants to help can report bugs, suggest ideas, add resources or write code.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
            >
              <GitHubMark /> View on GitHub
            </a>
            <a
              href={`${site.github}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-5 py-2.5 text-sm text-ink hover:bg-card"
            >
              Contributing guide <ArrowUpRight size={15} />
            </a>
          </div>
        </Container>
      </section>

      <Container className="space-y-20">
        <section>
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Ways to help</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">You don&apos;t need to be a web developer</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ways.map(({ icon: Icon, title, body, href, cta }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-2xl border border-line bg-card/60 p-6 transition hover:-translate-y-0.5 hover:border-brand/25 hover:bg-card"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-brand">
                  {cta} <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="font-mono text-xs tracking-wider text-brand uppercase">Run it locally</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">Up and running in five commands</h2>
            <p className="mt-3 max-w-md leading-relaxed text-muted">
              You&apos;ll need Node.js 22+ and a free Supabase project for the database. The README has the details,
              including every environment variable.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {stack.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <figure className="overflow-hidden rounded-2xl border border-line bg-card/70">
            <figcaption className="border-b border-line bg-surface/70 px-4 py-2.5 font-mono text-xs text-muted">terminal</figcaption>
            <ol className="space-y-3 p-5 font-mono text-[13px] leading-6 sm:text-sm">
              {setup.map((s) => (
                <li key={s.cmd} className="flex flex-wrap gap-x-3">
                  <span className="text-muted select-none">$</span>
                  <code className="min-w-0 break-all text-ink">{s.cmd}</code>
                  {s.note && <span className="text-muted/80 italic"># {s.note}</span>}
                </li>
              ))}
            </ol>
          </figure>
        </section>

        <section className="rounded-3xl border border-line bg-surface/60 px-6 py-10 text-center sm:px-12">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">Before you start</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted">
            Read the{" "}
            <a href={`${site.github}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              contributing guide
            </a>{" "}
            and the{" "}
            <a href={`${site.github}/blob/main/CODE_OF_CONDUCT.md`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              code of conduct
            </a>
            . Found a security problem? Please email{" "}
            <a href={`mailto:${site.email}`} className="text-brand hover:underline">
              {site.email}
            </a>{" "}
            instead of opening a public issue.
          </p>
        </section>
      </Container>
    </>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
