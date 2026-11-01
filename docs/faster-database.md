# Making the database faster

Most of the delay was distance, not Supabase itself. The database is in Tokyo (`ap-northeast-1`), so every
query from India or from Vercel's default US region paid 170 to 200 ms, and the first connection about 1.5 s.

## Already done in the code

- `vercel.json` runs the site's functions in Tokyo (`hnd1`), next to the database, so a query takes a few ms.
- Public read queries (events, calendar, batches, leaderboard, class pages) are cached in `lib/cache.ts`.
  Saving something in `/admin` expires the right cache straight away. Changes made outside the site
  (`npm run import:contest`, SQL edits) show up after the cache time runs out (1 minute for events,
  5 minutes for the rest).
- Pages fetch their queries in parallel instead of one after another.
- Event pages are cached after the first visit.

## Next step: move the database to Mumbai

Supabase can't change a project's region, so this is a copy to a new project. The data is small.

1. Create a new Supabase project in **South Asia (Mumbai)** `ap-south-1`.
2. Copy the data (use the direct connection strings, port 5432):

   ```bash
   pg_dump "$OLD_DATABASE_URL" --no-owner --no-acl --format=custom -f codeplus.dump
   pg_restore --no-owner --no-acl --clean --if-exists -d "$NEW_DATABASE_URL" codeplus.dump
   ```

   If the restore complains about Supabase-owned schemas (`auth`, `storage`), ignore those. Only `public` matters.
3. In `.env.local` and in Vercel, set `DATABASE_URL` and `DATABASE_URL_POOLED` (port 6543) to the new project.
4. Change `vercel.json` to `"regions": ["bom1"]` (Mumbai) and redeploy.
5. Check the site, then pause or delete the old project.

After this a query takes about 2 ms from the function, and visitors in India reach the site in about 30 to 40 ms.
