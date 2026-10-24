import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { AddMemberForm, ChangeOwnPasswordForm, RemoveMemberForm, ResetPasswordForm } from "./forms";

export const metadata: Metadata = { title: "Members" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : "never";

export default async function AdminMembers() {
  const me = await requireMember();
  const rows = await db
    .select({ id: members.id, name: members.name, email: members.email, lastLoginAt: members.lastLoginAt })
    .from(members)
    .orderBy(asc(members.name));

  return (
    <>
      <PageHeader
        title="Members"
        intro="Everyone here can sign in and edit the site. There's no public sign-up: accounts only get created on this page."
      />

      <Panel title="Accounts">
        <ul className="divide-y divide-line">
          {rows.map((m) => (
            <li key={m.id} className="py-3">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium text-ink">{m.name}</span>
                  {m.id === me.id && (
                    <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] text-brand uppercase">You</span>
                  )}
                  <span className="text-sm text-muted">{m.email}</span>
                  <span className="ml-auto font-mono text-xs text-muted">last sign-in: {fmt(m.lastLoginAt)}</span>
                </summary>
                {m.id !== me.id && (
                  <div className="mt-4 grid gap-6 rounded-xl bg-surface/60 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <ResetPasswordForm id={m.id} name={m.name} />
                    <RemoveMemberForm id={m.id} name={m.name} />
                  </div>
                )}
              </details>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Add a member" className="mt-6">
        <AddMemberForm />
      </Panel>

      <Panel title="Your password" className="mt-6">
        <ChangeOwnPasswordForm />
      </Panel>
    </>
  );
}
