"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { batches, contestResults, contests } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { isHttpUrl, optional, slugify } from "@/lib/admin-utils";
import { isDayKey } from "@/lib/calendar-utils";
import { parseRanklist } from "@/lib/ranklist-csv";

export type FormState = { error?: string; ok?: string };

const MAX_CSV_CHARS = 2_000_000;

export async function importContest(_prev: FormState, form: FormData): Promise<FormState> {
  await requireMember();
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(name);
  const heldOn = String(form.get("heldOn") ?? "");
  const batchId = optional(form.get("batchId"));
  const url = optional(form.get("url"));
  const csv = String(form.get("csv") ?? "");

  if (!name || !slug) return { error: "Give the contest a name." };
  if (!isDayKey(heldOn)) return { error: "Pick the date the contest was held." };
  if (url && !isHttpUrl(url)) return { error: "The contest link should start with https://" };
  if (!csv) return { error: "Choose a ranklist CSV file." };
  if (csv.length > MAX_CSV_CHARS) return { error: "That CSV is too large." };

  let rows;
  try {
    rows = parseRanklist(csv).rows;
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (rows.length === 0) return { error: "No valid Codeforces handles found in that CSV." };

  if (batchId) {
    const [b] = await db.select({ id: batches.id }).from(batches).where(eq(batches.id, batchId)).limit(1);
    if (!b) return { error: "That batch no longer exists." };
  }
  const [clash] = await db.select({ id: contests.id }).from(contests).where(eq(contests.slug, slug)).limit(1);
  if (clash) return { error: `A contest called "${name}" already exists. Delete it first or use a different name.` };

  await db.transaction(async (tx) => {
    const [c] = await tx.insert(contests).values({ slug, name, heldOn, batchId, url }).returning({ id: contests.id });
    await tx.insert(contestResults).values(rows.map((r) => ({ ...r, contestId: c.id })));
  });

  revalidatePath("/leaderboard");
  revalidatePath("/");
  redirect(`/admin/leaderboard?imported=${encodeURIComponent(name)}&n=${rows.length}`);
}

export async function deleteContest(form: FormData) {
  await requireMember();
  await db.delete(contests).where(eq(contests.id, String(form.get("id"))));
  revalidatePath("/leaderboard");
  revalidatePath("/");
  redirect("/admin/leaderboard");
}
