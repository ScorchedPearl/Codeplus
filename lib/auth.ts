import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

export const SESSION_COOKIE = "cp_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

type Payload = { sub: string; ver: number; exp: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to a long random string");
  return s;
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encode(p: Payload) {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return p.exp > Date.now() / 1000 ? p : null;
  } catch {
    return null;
  }
}

export async function startSession(memberId: string, version: number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  (await cookies()).set(SESSION_COOKIE, encode({ sub: memberId, ver: version, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type CurrentMember = { id: string; email: string; name: string };

/** The signed-in member, or null. Checks the database so removed members and reset passwords lose access at once. */
export const getCurrentMember = cache(async (): Promise<CurrentMember | null> => {
  const p = decode((await cookies()).get(SESSION_COOKIE)?.value);
  if (!p) return null;
  const [m] = await db
    .select({ id: members.id, email: members.email, name: members.name, ver: members.sessionVersion })
    .from(members)
    .where(eq(members.id, p.sub))
    .limit(1);
  if (!m || m.ver !== p.ver) return null;
  return { id: m.id, email: m.email, name: m.name };
});

/** Use at the top of every admin page and server action. */
export async function requireMember(): Promise<CurrentMember> {
  const m = await getCurrentMember();
  if (!m) redirect("/login");
  return m;
}
