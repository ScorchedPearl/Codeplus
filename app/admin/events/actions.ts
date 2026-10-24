"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, images } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { fromIstInput, isHttpUrl, lines, optional, slugify } from "@/lib/admin-utils";

export type FormState = { error?: string; ok?: string };

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const UPLOAD_PREFIX = "/api/images/";

function revalidateEvents(slug?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

async function deleteUploadedImage(url: string | null | undefined) {
  if (url?.startsWith(UPLOAD_PREFIX)) await db.delete(images).where(eq(images.id, url.slice(UPLOAD_PREFIX.length)));
}

export async function saveEvent(_prev: FormState, form: FormData): Promise<FormState> {
  await requireMember();
  const id = optional(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || name);
  const description = String(form.get("description") ?? "").trim();
  const startTime = fromIstInput(form.get("startTime"));
  const endTime = fromIstInput(form.get("endTime"));
  const blogLink = optional(form.get("blogLink"));
  const imageUrl = optional(form.get("imageUrl"));
  const file = form.get("imageFile");
  const removeImage = form.get("removeImage") === "on";

  if (!name) return { error: "Give the event a name." };
  if (!slug) return { error: "The URL name needs at least one letter or number." };
  if (!description) return { error: "Add a description." };
  if (!startTime || !endTime) return { error: "Set both a start and an end time." };
  if (endTime <= startTime) return { error: "The end time has to be after the start time." };
  if (blogLink && !isHttpUrl(blogLink)) return { error: "The blog link should start with https://" };
  if (imageUrl && !isHttpUrl(imageUrl) && !imageUrl.startsWith(UPLOAD_PREFIX))
    return { error: "The image link should start with https://" };

  const [clash] = await db
    .select({ id: events.id })
    .from(events)
    .where(id ? and(eq(events.slug, slug), ne(events.id, id)) : eq(events.slug, slug))
    .limit(1);
  if (clash) return { error: `Another event already uses the URL name "${slug}". Pick a different one.` };

  const existing = id ? (await db.select().from(events).where(eq(events.id, id)).limit(1))[0] : undefined;
  if (id && !existing) return { error: "That event no longer exists." };

  let image = removeImage ? null : (imageUrl ?? existing?.image ?? null);
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) return { error: "Posters can be JPG, PNG, WebP or GIF." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "Posters can be at most 4 MB." };
    const [img] = await db
      .insert(images)
      .values({ contentType: file.type, data: Buffer.from(await file.arrayBuffer()) })
      .returning({ id: images.id });
    image = `${UPLOAD_PREFIX}${img.id}`;
  }

  const values = {
    name,
    slug,
    description,
    startTime,
    endTime,
    blogLink,
    image,
    organizers: lines(form.get("organizers"), true),
    prizes: lines(form.get("prizes")).length ? lines(form.get("prizes")) : null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(events).set(values).where(eq(events.id, existing.id));
    if (existing.image !== image) await deleteUploadedImage(existing.image);
    revalidateEvents(existing.slug);
  } else {
    await db.insert(events).values(values);
  }
  revalidateEvents(slug);
  redirect("/admin/events?saved=1");
}

export async function deleteEvent(form: FormData) {
  await requireMember();
  const id = String(form.get("id") ?? "");
  const [removed] = await db.delete(events).where(eq(events.id, id)).returning();
  if (removed) {
    await deleteUploadedImage(removed.image);
    revalidateEvents(removed.slug);
  }
  redirect("/admin/events");
}
