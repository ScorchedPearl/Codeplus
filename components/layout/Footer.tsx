import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { nav, site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const socials = Object.entries(site.socials).filter(([, url]) => url);

  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The competitive programming and DSA teaching club of {site.institute}. Run by students, for students.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs tracking-wider text-muted uppercase">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs tracking-wider text-muted uppercase">Reach us</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-muted" />
              <a href={`mailto:${site.email}`} className="break-all hover:text-brand">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-muted" />
              <span>
                {site.institute}, {site.location}
              </span>
            </li>
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer" className="capitalize hover:text-brand">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CodePlus, IIIT Allahabad ·{" "}
            <a href={site.github} target="_blank" rel="noreferrer" className="hover:text-brand">
              Open source on GitHub
            </a>
          </p>
          <p className="font-mono">while (true) {"{ learn(); compete(); }"}</p>
        </Container>
      </div>
    </footer>
  );
}
