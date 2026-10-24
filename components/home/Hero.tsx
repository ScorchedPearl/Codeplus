import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroGraphic } from "@/components/home/HeroGraphic";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden bg-glow pt-16">
      <Container className="grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pt-28 lg:pb-28">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-3 py-1 font-mono text-xs text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            {site.institute} · Competitive Programming
          </p>

          <h1 className="mt-6 font-serif text-[2.75rem] leading-[1.05] font-normal tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]">
            Learn to think
            <br />
            in <em className="text-gradient pr-1 font-medium">algorithms</em>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            CodePlus is IIITA&apos;s competitive programming club. Senior TAs teach weekly classes, run contests and mentor
            juniors until they&apos;re ready to mentor others.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/events">
              Upcoming events <ArrowRight size={16} />
            </Button>
            <Button href="/calendar" variant="secondary">
              See the timetable
            </Button>
          </div>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <HeroGraphic />
        </div>
      </Container>
    </section>
  );
}
