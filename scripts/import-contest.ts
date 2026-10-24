// Import a Codeforces ranklist CSV into the leaderboard until the admin upload page exists.
//
//   npm run import:contest -- --file standings.csv --name "Weekly Contest #1" [--date 2026-11-01]
//                             [--batch batch-a] [--url https://codeforces.com/group/...] [--replace]

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import postgres from "postgres";
import { parseRanklist } from "../lib/ranklist-csv.ts";

const { values: args } = parseArgs({
  options: {
    file: { type: "string" },
    name: { type: "string" },
    date: { type: "string" },
    batch: { type: "string" },
    url: { type: "string" },
    slug: { type: "string" },
    replace: { type: "boolean", default: false },
  },
});

if (!args.file || !args.name) {
  console.error('Usage: npm run import:contest -- --file standings.csv --name "Contest name" [--date YYYY-MM-DD] [--batch slug] [--url link] [--replace]');
  process.exit(1);
}

const slug = args.slug ?? args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const heldOn = args.date ?? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const parsed = parseRanklist(readFileSync(args.file, "utf8"));

console.log(`Columns: ${JSON.stringify(parsed.columns)}`);
console.log(`Parsed ${parsed.rows.length} participants, skipped ${parsed.skipped.length} line(s)`);
for (const s of parsed.skipped) console.log(`  line ${s.line}: ${s.reason}`);
if (parsed.rows.length === 0) process.exit(1);

const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_POOLED is not set (run with --env-file=.env.local)");
const sql = postgres(url, { prepare: false });

try {
  await sql.begin(async (tx) => {
    let batchId: string | null = null;
    if (args.batch) {
      const [b] = await tx`select id from batches where slug = ${args.batch}`;
      if (!b) throw new Error(`No batch with slug "${args.batch}"`);
      batchId = b.id;
    }

    const [existing] = await tx`select id from contests where slug = ${slug}`;
    if (existing && !args.replace) throw new Error(`Contest "${slug}" already exists. Pass --replace to overwrite it.`);
    if (existing) await tx`delete from contests where id = ${existing.id}`;

    const [contest] = await tx`
      insert into contests (slug, name, batch_id, held_on, url)
      values (${slug}, ${args.name!}, ${batchId}, ${heldOn}, ${args.url ?? null})
      returning id`;
    await tx`insert into contest_results ${tx(
      parsed.rows.map((r) => ({ ...r, contest_id: contest.id })),
      "contest_id",
      "handle",
      "rank",
      "points",
      "penalty",
      "solved",
    )}`;
  });
  console.log(`Imported "${args.name}" as /leaderboard?contest=${slug}`);
} finally {
  await sql.end();
}
