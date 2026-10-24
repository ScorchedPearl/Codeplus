"use server";

import { revalidatePath } from "next/cache";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { requireMember, startSession } from "@/lib/auth";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";

export type FormState = { error?: string; ok?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function addMember(_prev: FormState, form: FormData): Promise<FormState> {
  await requireMember();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!name) return { error: "Add their name." };
  if (!EMAIL_RE.test(email)) return { error: "That doesn't look like an email address." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const [exists] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(sql`lower(${members.email})`, email))
    .limit(1);
  if (exists) return { error: "There's already an account with that email." };

  await db.insert(members).values({ name, email, passwordHash: await hashPassword(password) });
  revalidatePath("/admin/members");
  return { ok: `Account created for ${name}. Share the password with them privately.` };
}

export async function resetPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireMember();
  const id = String(form.get("id") ?? "");
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const [m] = await db
    .update(members)
    .set({
      passwordHash: await hashPassword(password),
      sessionVersion: sql`${members.sessionVersion} + 1`,
      failedLogins: 0,
      lockedUntil: null,
    })
    .where(eq(members.id, id))
    .returning({ name: members.name, ver: members.sessionVersion });
  if (!m) return { error: "That member no longer exists." };

  // Resetting your own password signs out other devices but keeps this one signed in
  if (id === me.id) await startSession(me.id, m.ver);
  return { ok: `Password updated for ${m.name}. They've been signed out everywhere.` };
}

export async function changeOwnPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireMember();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  const [m] = await db.select().from(members).where(eq(members.id, me.id)).limit(1);
  if (!m || !(await verifyPassword(current, m.passwordHash))) return { error: "Your current password isn't right." };

  const [updated] = await db
    .update(members)
    .set({ passwordHash: await hashPassword(next), sessionVersion: sql`${members.sessionVersion} + 1` })
    .where(eq(members.id, me.id))
    .returning({ ver: members.sessionVersion });
  await startSession(me.id, updated.ver);
  return { ok: "Password changed. Other devices have been signed out." };
}

export async function removeMember(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireMember();
  const id = String(form.get("id") ?? "");
  if (id === me.id) return { error: "You can't remove your own account. Ask another member." };
  const [{ n }] = await db.select({ n: count() }).from(members);
  if (n <= 1) return { error: "Keep at least one member account." };

  await db.delete(members).where(eq(members.id, id));
  revalidatePath("/admin/members");
  return { ok: "Removed. They can no longer sign in." };
}
