# CodePlus website

The website of **CodePlus**, the competitive programming and DSA teaching club of IIIT Allahabad.
Senior students are selected as Teaching Assistants who run classes, contests and workshops and mentor juniors.

> 🚧 **Under construction.** The site is being built in the open and contributions are welcome.
> See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## What's on the site

| Page | What it does |
|---|---|
| **Home** | Club intro, the TAship model, upcoming events, top of the leaderboard, the team |
| **Events** | Ongoing, upcoming and past contests and workshops, each with its own page and calendar export |
| **Calendar** | Weekly class timetable with a batch selector, repeating classes and cancelled sessions |
| **Leaderboard** | Codeforces points added up across CodePlus contests, filterable by batch |
| **Resources** | Setup guides, extensions, practice sheets and learning material |
| **Contribute** | How to help build the site |
| **Admin** (`/admin`) | Members-only panel for events, timetable, ranklist CSV uploads and member accounts |

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- PostgreSQL on [Supabase](https://supabase.com), accessed with [Drizzle ORM](https://orm.drizzle.team)
- Deployed on [Vercel](https://vercel.com)

## Running it locally

You need **Node.js 22+** and a Postgres database. A free Supabase project works well.

```bash
git clone https://github.com/ScorchedPearl/Codeplus.git
cd Codeplus
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run db:migrate           # creates the tables
npm run member:add           # creates your admin account (asks for name, email, password)
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Direct Postgres connection string, used by `db:migrate` |
| `DATABASE_URL_POOLED` | Pooled connection string used by the app (Supabase: Connection pooling → Transaction mode, port 6543) |
| `SESSION_SECRET` | Long random string that signs admin login cookies. Generate one with `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | Optional. The public URL, used in calendar links. Defaults to `http://localhost:3000` |

Never commit `.env.local`. It's already in `.gitignore`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check the project |
| `npm run db:generate` | Create a migration after changing `lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run member:add` | Create a member (admin) account from the terminal |
| `npm run import:contest -- --file ranklist.csv --name "Contest"` | Import a Codeforces ranklist CSV |

## Project structure

```
app/               pages and routes (app/admin is the members-only panel)
components/        UI components, grouped by page
lib/               data access, helpers, auth
lib/db/schema.ts   database tables
drizzle/           SQL migrations
public/            static files (logo, the motion graphic)
scripts/           command-line helpers
```

## Contributing

Bug reports, ideas, resource suggestions and pull requests are all welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
and our [Code of Conduct](CODE_OF_CONDUCT.md). Found a security issue? Please follow [SECURITY.md](SECURITY.md)
instead of opening a public issue.

## License

[MIT](LICENSE) © CodePlus, IIIT Allahabad
