import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Seniors become TAs",
    body: "Strong problem solvers from senior batches are selected as Teaching Assistants.",
  },
  {
    title: "TAs teach and organise",
    body: "They run classes, set contests and workshops, and mentor juniors one-on-one.",
  },
  {
    title: "Juniors grow into TAs",
    body: "Today's learners become the next batch of mentors, and the cycle continues.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface/60 py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHeading
          eyebrow="The TAship model"
          title={
            <>
              Taught by students who <em className="text-gradient">just did it</em>
            </>
          }
          intro="The people teaching you were sitting in your seat a year or two ago, so they know which topics trip people up and how to explain them."
        />
        <ol className="relative space-y-8 border-l border-line pl-8">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="absolute -left-[3.05rem] flex size-9 items-center justify-center rounded-full border border-line bg-bg font-mono text-xs text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-xl text-ink">{step.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
