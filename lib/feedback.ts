import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { batches, classFeedback, classes } from "@/lib/db/schema";

/** Set after submitting, so a browser sends feedback once per session. */
export function feedbackCookieName(classId: string, day: string) {
  return `cp_fb_${classId.replaceAll("-", "").slice(0, 12)}_${day}`;
}

/** Every feedback entry with its class. Members only: call this from /admin pages. */
export async function getAllFeedback() {
  return db
    .select({
      id: classFeedback.id,
      classId: classFeedback.classId,
      day: classFeedback.sessionDay,
      rating: classFeedback.rating,
      pace: classFeedback.pace,
      liked: classFeedback.liked,
      improve: classFeedback.improve,
      name: classFeedback.name,
      createdAt: classFeedback.createdAt,
      topic: classes.topic,
      batch: batches.name,
    })
    .from(classFeedback)
    .innerJoin(classes, eq(classes.id, classFeedback.classId))
    .innerJoin(batches, eq(batches.id, classes.batchId))
    .orderBy(desc(classFeedback.sessionDay), desc(classFeedback.createdAt));
}
