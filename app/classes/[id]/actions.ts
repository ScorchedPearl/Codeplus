"use server";

import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classFeedback } from "@/lib/db/schema";
import { getClass } from "@/lib/classes";
import { feedbackCookieName } from "@/lib/feedback";
import { addDays, isDayKey, sessionsBetween } from "@/lib/calendar-utils";

export type FeedbackState = { error?: string; sent?: boolean };

const MAX_TEXT = 2000;
const MAX_NAME = 80;
// High enough for a classroom sharing one campus IP
const MAX_PER_HOUR_PER_IP = 60;
const PACES = ["slow", "right", "fast"];

const text = (v: FormDataEntryValue | null, max: number) => {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
};

export async function submitFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  // Hidden field that only bots fill in; pretend it worked
  if (form.get("website")) return { sent: true };

  const classId = String(form.get("classId") ?? "");
  const day = String(form.get("day") ?? "");
  const rating = Number(form.get("rating"));
  const paceValue = String(form.get("pace") ?? "");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Pick a rating from 1 to 5." };
  if (!/^[0-9a-f-]{36}$/i.test(classId) || !isDayKey(day)) return { error: "This class couldn't be found." };

  const c = await getClass(classId);
  const session = c && sessionsBetween([c], day, addDays(day, 1))[0];
  if (!session) return { error: "This class couldn't be found." };
  if (session.cancelled) return { error: "This session was cancelled." };
  if (new Date(session.start) > new Date()) return { error: "Feedback opens when the class starts." };

  const jar = await cookies();
  const cookieName = feedbackCookieName(classId, day);
  if (jar.get(cookieName)) return { sent: true };

  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const hour = Math.floor(Date.now() / 3_600_000);
  const rateKey = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`${ip}:${hour}`).digest("base64url");

  const [{ n }] = await db.select({ n: count() }).from(classFeedback).where(eq(classFeedback.rateKey, rateKey));
  if (n >= MAX_PER_HOUR_PER_IP) return { error: "Too many submissions right now. Please try again later." };

  await db.insert(classFeedback).values({
    classId,
    sessionDay: day,
    rating,
    pace: PACES.includes(paceValue) ? paceValue : null,
    liked: text(form.get("liked"), MAX_TEXT),
    improve: text(form.get("improve"), MAX_TEXT),
    name: text(form.get("name"), MAX_NAME),
    rateKey,
  });

  jar.set(cookieName, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 60 });
  return { sent: true };
}
