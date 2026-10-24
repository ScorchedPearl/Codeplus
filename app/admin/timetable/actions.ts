"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { batches, classes } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { fromIstInput, isHttpUrl, lines, optional, slugify } from "@/lib/admin-utils";
import { dayKey, isDayKey } from "@/lib/calendar-utils";

export type FormState = { error?: string; ok?: string };

const revalidateCalendar = () => {
  revalidatePath("/calendar");
  revalidatePath("/leaderboard");
};

export async function saveBatch(_prev: FormState, form: FormData): Promise<FormState> {
  await requireMember();
  const id = optional(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(name);
  const sortOrder = Number.parseInt(String(form.get("sortOrder") ?? "0"), 10) || 0;
  if (!name || !slug) return { error: "Give the batch a name." };

  const [clash] = await db
    .select({ id: batches.id })
    .from(batches)
    .where(id ? and(eq(batches.slug, slug), ne(batches.id, id)) : eq(batches.slug, slug))
    .limit(1);
  if (clash) return { error: `There's already a batch called "${name}".` };

  if (id) await db.update(batches).set({ name, slug, sortOrder }).where(eq(batches.id, id));
  else await db.insert(batches).values({ name, slug, sortOrder });
  revalidateCalendar();
  return { ok: id ? `Saved "${name}".` : `Added "${name}".` };
}

export async function deleteBatch(form: FormData) {
  await requireMember();
  await db.delete(batches).where(eq(batches.id, String(form.get("id"))));
  revalidateCalendar();
  redirect("/admin/timetable");
}

export async function saveClass(_prev: FormState, form: FormData): Promise<FormState> {
  await requireMember();
  const id = optional(form.get("id"));
  const batchId = String(form.get("batchId") ?? "");
  const topic = String(form.get("topic") ?? "").trim();
  const startTime = fromIstInput(form.get("startTime"));
  const endTime = fromIstInput(form.get("endTime"));
  const repeats = form.get("repeats") === "on";
  const repeatUntil = optional(form.get("repeatUntil"));
  const link = optional(form.get("link"));

  if (!batchId) return { error: "Pick a batch." };
  if (!topic) return { error: "Add a topic." };
  if (!startTime || !endTime) return { error: "Set when the first class starts and ends." };
  if (endTime <= startTime) return { error: "The end time has to be after the start time." };
  if (endTime.getTime() - startTime.getTime() > 24 * 3_600_000) return { error: "A class can't be longer than a day." };
  if (repeats && (!repeatUntil || !isDayKey(repeatUntil))) return { error: "Pick the date of the last weekly class." };
  if (repeats && repeatUntil! < dayKey(startTime)) return { error: "The last class can't be before the first one." };
  if (link && !isHttpUrl(link)) return { error: "The material link should start with https://" };

  const [batch] = await db.select({ id: batches.id }).from(batches).where(eq(batches.id, batchId)).limit(1);
  if (!batch) return { error: "That batch no longer exists." };

  const values = {
    batchId,
    topic,
    description: optional(form.get("description")),
    tas: lines(form.get("tas"), true),
    venue: optional(form.get("venue")),
    link,
    startTime,
    endTime,
    repeatUntil: repeats ? repeatUntil : null,
    updatedAt: new Date(),
  };

  if (id) {
    const [updated] = await db.update(classes).set(values).where(eq(classes.id, id)).returning({ id: classes.id });
    if (!updated) return { error: "That class no longer exists." };
  } else {
    await db.insert(classes).values(values);
  }
  revalidateCalendar();
  redirect("/admin/timetable?saved=1");
}

export async function deleteClass(form: FormData) {
  await requireMember();
  await db.delete(classes).where(eq(classes.id, String(form.get("id"))));
  revalidateCalendar();
  redirect("/admin/timetable");
}

/** Cancel or restore one week's session of a repeating class. */
export async function toggleCancelled(form: FormData) {
  await requireMember();
  const id = String(form.get("id"));
  const day = String(form.get("day"));
  if (!isDayKey(day)) return;
  await db
    .update(classes)
    .set({
      cancelledDates: sql`case when ${day}::date = any(${classes.cancelledDates})
        then array_remove(${classes.cancelledDates}, ${day}::date)
        else array_append(${classes.cancelledDates}, ${day}::date) end`,
      updatedAt: new Date(),
    })
    .where(eq(classes.id, id));
  revalidateCalendar();
  revalidatePath(`/admin/timetable/${id}`);
}
