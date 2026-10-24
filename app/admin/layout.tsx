import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/login/actions";
import { LogOut } from "lucide-react";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · CodePlus" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMember();

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-xs tracking-wider text-brand uppercase">Admin</p>
          <p className="mt-1 text-sm text-muted">
            Signed in as <span className="text-ink">{me.name}</span>
          </p>
        </div>
        <form action={logout}>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:bg-surface">
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
