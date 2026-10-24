import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_POOLED (or DATABASE_URL) is not set");

// Reuse one client across hot reloads in dev. `prepare: false` is required by Supabase's transaction pooler.
// The pooler drops idle connections, so close ours first and never wait forever for a new one.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };
const client =
  globalForDb.pg ??
  postgres(url, { prepare: false, max: 5, idle_timeout: 20, max_lifetime: 60 * 10, connect_timeout: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
