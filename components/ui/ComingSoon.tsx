import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function ComingSoon({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="-mt-16 bg-glow pt-16">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-brand uppercase">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-muted">{body}</p>
        <p className="mt-8 rounded-full border border-line bg-card/60 px-3 py-1 font-mono text-xs text-muted">
          status: <span className="text-accent">in progress</span>
        </p>
        <Button href="/" variant="secondary" className="mt-8">
          Back to home
        </Button>
      </Container>
    </section>
  );
}
