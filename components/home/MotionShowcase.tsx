"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SRC = "/motion/codeplus-motion.html?embed";

/**
 * The CodePlus motion graphic (public/motion/codeplus-motion.html) in an iframe.
 * It plays only while on screen, follows the site theme, and can be paused.
 */
export function MotionShowcase() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const send = (msg: Record<string, string>) => frame.current?.contentWindow?.postMessage(msg, window.location.origin);
  const theme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

  // The animation tells us when it has loaded
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.codeplus === "ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    // Respect reduced motion: don't autoplay, let people press play
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Play while at least half of it is visible
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    send({ codeplus: inView && !userPaused ? "play" : "pause" });
  }, [ready, inView, userPaused]);

  // Follow the site's light/dark toggle
  useEffect(() => {
    if (!ready) return;
    send({ codeplus: "theme", theme: theme() });
    const mo = new MutationObserver(() => send({ codeplus: "theme", theme: theme() }));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [ready]);

  return (
    <section className="hidden py-20 sm:py-24 lg:block">
      <Container>
        <SectionHeading
          eyebrow="CodePlus in 36 seconds"
          title="What we're about"
          intro="The club, the TAship model and what you get out of it."
          align="center"
        />

        <div className="relative mt-12 overflow-hidden rounded-3xl border border-line bg-bg">
          <iframe
            ref={frame}
            src={SRC}
            title="CodePlus: what we do (animation)"
            loading="lazy"
            onLoad={() => setReady(true)}
            className="block aspect-video w-full"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition hover:bg-surface"
          >
            {userPaused ? <Play size={14} /> : <Pause size={14} />} {userPaused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => {
              setUserPaused(false);
              send({ codeplus: "restart" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition hover:bg-surface"
          >
            <RotateCcw size={14} /> Replay
          </button>
        </div>
      </Container>
    </section>
  );
}
