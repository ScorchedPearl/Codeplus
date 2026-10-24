import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function JoinCta() {
  return (
    <section className="pt-20 sm:pt-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 [background:radial-gradient(40%_60%_at_15%_10%,rgb(255_255_255/0.5),transparent_70%),radial-gradient(35%_50%_at_90%_100%,rgb(217_137_91/0.7),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight text-white sm:text-4xl">
              Your first contest is closer than you think.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Classes are open to IIITA students. Pick your batch on the calendar and come to the next session.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#2f4fa3] transition hover:bg-white/90"
              >
                Find your class <ArrowRight size={16} />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Start with resources
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
