"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { endSession, startSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
// Compared against when the email doesn't exist, so response time doesn't reveal which emails have accounts
const dummyHash = hashPassword("codeplus-timing-equaliser");

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fail = { error: "That email and password don't match.", email };
  if (!email || !password) return fail;

  const [m] = await db
    .select()
    .from(members)
    .where(eq(sql`lower(${members.email})`, email))
    .limit(1);

  if (!m) {
    await verifyPassword(password, await dummyHash);
    return fail;
  }
  if (m.lockedUntil && m.lockedUntil > new Date()) {
    return { error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, email };
  }

  if (!(await verifyPassword(password, m.passwordHash))) {
    const fails = m.failedLogins + 1;
    await db
      .update(members)
      .set({
        failedLogins: fails >= MAX_FAILS ? 0 : fails,
        lockedUntil: fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      })
      .where(eq(members.id, m.id));
    return fail;
  }

  await db.update(members).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(members.id, m.id));
  await startSession(m.id, m.sessionVersion);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
