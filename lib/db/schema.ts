import { sql } from "drizzle-orm";
import {
  check,
  customType,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    image: text("image"),
    description: text("description").notNull(),
    blogLink: text("blog_link"),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    organizers: text("organizers").array().notNull().default(sql`'{}'::text[]`),
    prizes: text("prizes").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("events_time_order", sql`${t.endTime} > ${t.startTime}`)],
).enableRLS();

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    description: text("description"),
    tas: text("tas").array().notNull().default(sql`'{}'::text[]`),
    venue: text("venue"),
    link: text("link"),
    // Class notes in Markdown, shown on the public class page
    notes: text("notes"),
    // Uploaded slides (/api/images/[id]) or an external link
    slides: text("slides"),
    // First (or only) session. Weekly classes repeat on the same weekday and time until `repeatUntil`.
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    repeatUntil: date("repeat_until", { mode: "string" }),
    // IST dates (YYYY-MM-DD) of weekly sessions that won't happen
    cancelledDates: date("cancelled_dates", { mode: "string" }).array().notNull().default(sql`'{}'::date[]`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("classes_time_order", sql`${t.endTime} > ${t.startTime}`),
    index("classes_batch_idx").on(t.batchId),
  ],
).enableRLS();

export const contests = pgTable("contests", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // null = open to every batch
  batchId: uuid("batch_id").references(() => batches.id, { onDelete: "set null" }),
  heldOn: date("held_on", { mode: "string" }).notNull(),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// One row per participant per contest, copied from the Codeforces ranklist as-is.
export const contestResults = pgTable(
  "contest_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contestId: uuid("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    rank: integer("rank").notNull(),
    points: doublePrecision("points").notNull().default(0),
    penalty: integer("penalty").notNull().default(0),
    solved: integer("solved").notNull().default(0),
  },
  (t) => [
    uniqueIndex("contest_results_contest_handle_idx").on(t.contestId, sql`lower(${t.handle})`),
    index("contest_results_handle_idx").on(sql`lower(${t.handle})`),
  ],
).enableRLS();

// Internal CodePlus members who can sign in to /admin. Accounts are only created by other members.
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    // Bumped on password reset so existing sessions stop working
    sessionVersion: integer("session_version").notNull().default(1),
    failedLogins: integer("failed_logins").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("members_email_idx").on(sql`lower(${t.email})`)],
).enableRLS();

// Uploaded event posters and class slides, served from /api/images/[id]
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentType: text("content_type").notNull(),
  // Set for downloads such as slides; images without it are shown inline
  filename: text("filename"),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// Student feedback on a class session. Students aren't signed in; only members can read it, in /admin/feedback.
export const classFeedback = pgTable(
  "class_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    sessionDay: date("session_day", { mode: "string" }).notNull(),
    rating: integer("rating").notNull(),
    pace: text("pace"), // "slow" | "right" | "fast"
    liked: text("liked"),
    improve: text("improve"),
    name: text("name"), // optional, anonymous by default
    // Hash of IP + current hour, only used for rate limiting. Can't be traced back or linked across hours.
    rateKey: text("rate_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("class_feedback_rating_range", sql`${t.rating} between 1 and 5`),
    index("class_feedback_session_idx").on(t.classId, t.sessionDay),
    index("class_feedback_rate_idx").on(t.rateKey),
  ],
).enableRLS();
