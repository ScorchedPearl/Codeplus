"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classFeedback } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";

export async function deleteFeedback(form: FormData) {
  await requireMember();
  await db.delete(classFeedback).where(eq(classFeedback.id, String(form.get("id"))));
  revalidatePath("/admin/feedback");
}
