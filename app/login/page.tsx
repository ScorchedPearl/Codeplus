import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getCurrentMember } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Member sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentMember()) redirect("/admin");

  return (
    <section className="-mt-16 bg-glow pt-16">
      <Container className="flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-card/80 p-8">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Lock size={18} />
          </span>
          <h1 className="mt-5 font-serif text-3xl text-ink">Member sign in</h1>
          <p className="mt-1.5 mb-6 text-sm text-muted">For CodePlus members only. Ask a coordinator if you need an account.</p>
          <LoginForm />
        </div>
      </Container>
    </section>
  );
}
