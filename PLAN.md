# CodePlus Website — Plan

CodePlus is IIIT Allahabad's competitive-programming and DSA teaching club, run through a senior TAship program.

## 1. Design system

**Feel:** warm and editorial, using the CodePlus logo blues as the brand color.

| Token | Value | Use |
|---|---|---|
| `bg` | `#FAF8F4` (warm cream) | page background |
| `surface` | `#F3EFE7` | cards, sections |
| `ink` | `#1F1E1C` (warm near-black) | text |
| `muted` | `#6B6760` | secondary text |
| `brand-deep` | `#2F4FA3` (logo dark blue) | primary buttons, links |
| `brand-sky` | `#2A8FD4` (logo light blue) | gradient end, highlights |
| `warm-accent` | `#D9895B` (soft terracotta) | small accents only (badges, "live" dots) |
| gradient | `brand-deep → brand-sky`, plus soft cream→peach glows behind heroes | hero, CTA, logo-style headings |

- **Fonts:** *Fraunces* or *Newsreader* (serif) for headings, *Inter* for body text, and *JetBrains Mono* for code-style labels such as `#rank`, handles and times.
- **Layout:** lots of whitespace, rounded-2xl cards, 1px warm borders, almost no shadows, and subtle fade/slide-in animations.
- **Dark mode:** warm charcoal (`#1C1B19`) with the same blues. This is optional and can come in a later phase.

## 2. Tech stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Supabase**: one free tier covers all of these
  - **Postgres** for events, classes, contests/results, resources and members
  - **Storage** for event posters and member photos
  - **Auth** for member email/password login, with public sign-ups turned off
- **Drizzle ORM** for typed schema and migrations (`DATABASE_URL` in `.env.local`)
- **Hosting:** Vercel. Runtime queries go through Supabase's pooled connection (port 6543); the direct connection is used for migrations.
- Admin changes show up immediately, with no redeploys.

**Tables:** `members`, `events`, `batches`, `classes`, `contests`, `contest_results`, `resources`

## 3. Auth (internal members only)

- **Email + password login** at a hidden `/login` route that isn't linked from the public navigation. Accounts live in our own `members` table (scrypt-hashed passwords, HMAC-signed session cookie using `SESSION_SECRET`), so no Supabase API keys are needed. Posters are stored in the `images` table and served from `/api/images/[id]`.
- **No public sign-up and no "forgot password".** Sign-ups are turned off in Supabase, so accounts can only be created by the team:
  - from the Supabase dashboard (Authentication → Add user), or
  - by a logged-in member from a "Members" page in the admin panel
- Each member gets their **own account**, so one person's access can be removed without changing everyone's password
- **One role:** every logged-in member can edit everything (events, timetable, leaderboard, resources, members)
- Passwords are reset by another member from the dashboard; there's no email reset
- Login attempts are rate-limited by Supabase
- The public site needs no login. `/admin/*` pages and all write APIs check for a session.

## 4. Pages

### 4.1 Home `/`
- Hero with the logo, the tagline ("Learn. Compete. Grow." or similar), the club description and CTAs (View Events, See Timetable)
- What we do: Training sessions · Contests · Workshops · Mentorship
- Upcoming events (next 3) and the next class
- Leaderboard preview (top 5)
- **Team section:** cards with a photo placeholder, name, role and contact links
- Footer: IIITA, socials, contact

**Team (initial data):**
| Name | Role | Contact |
|---|---|---|
| Vishwas Pahwa | Coordinator | iit2024087@iiita.ac.in |
| Aditya Ajay | Coordinator | — |
| Aviral Awasthi | Senior Member | — |
| Dhruva Goyal | Senior Member | — |
| Kunal | Senior Member | — |
| Dewansh Khandelwal | Senior Member | — |
| Himanshu Vitthalani | Senior Member | — |

> Privacy note: I suggest **not** showing phone numbers on the public site. Email is enough. Phones can be shown only to logged-in members.

### 4.2 Events `/events` and `/events/[slug]`
- Tabs: **Upcoming · Ongoing · Past**, computed automatically from the start and end times
- Card: image, name, date/time, organizers, and a prize badge when there are prizes
- Detail page: full description, a "Read blog" link, organizers, prizes and add-to-calendar (.ics)

**Event schema:**
```ts
{
  id: string; slug: string;
  name: string;
  image: string;          // path or URL
  description: string;    // markdown allowed
  blogLink?: string;
  startTime: string;      // ISO, IST
  endTime: string;
  organizers: string[];
  prizes?: string[];      // optional
}
```
**Admin:** an "Add / Edit Event" form with image upload.

### 4.3 Calendar / Timetable `/calendar`
- **Batch selector** at the top. Batch names aren't decided yet, so it starts with placeholders (`Batch A`, `Batch B`) stored in a `batches` table that members can rename or add to from the admin panel.
- Week view on desktop and a list view on mobile, with a month toggle
- Each class shows the topic, time, venue, TA and an optional link (slides/problems)
- Supports **recurring weekly classes** and one-off sessions, plus cancellations

**Class schema:**
```ts
{
  id: string;
  batch: string;
  topic: string;
  ta: string[];
  venue: string;          // e.g. "CC3 Lab" or "Online"
  start: string; end: string;
  recurring?: { weekly: true; until: string };
  cancelled?: string[];   // dates skipped
  link?: string;
}
```
**Admin:** a timetable editor (add class, edit, cancel one occurrence).

### 4.4 Leaderboard `/leaderboard`
- **Overall** (cumulative) leaderboard plus a per-contest view, filterable by batch
- Columns: rank, name, CF handle (with Codeforces rating colors), contests played, total score
- Profile chips link to the person's Codeforces profile

**Admin: upload a CSV**
1. Upload a Codeforces ranklist CSV (`rank, handle, points, penalty, solved…`)
2. Preview the parsed table, map columns if they differ, and pick the batch and contest name
3. Save, which writes `contests/<contest-id>.json`; the overall standings are recalculated

*Optional extra:* paste a Codeforces contest/gym ID and fetch the standings through the CF API instead of uploading a CSV.

**Scoring:** no custom formula. Each contest shows the Codeforces rank and points exactly as they appear in the ranklist. The overall board adds up each person's Codeforces points across contests, and penalty breaks ties.

### 4.5 Resources & Blogs `/resources`
- **Learning path** by topic: Basics → STL → Sorting/Binary Search → Greedy → DP → Graphs → Trees → Number Theory → Strings …
- Each topic links to articles, problem sets (CF/CSES/LeetCode) and videos, with a difficulty tag
- **Blogs:** cards linking to external posts (Codeforces blogs, Medium), with the option of writing posts in MDX later
- Search and topic filters

## 5. Admin panel `/admin`
Dashboard → Events · Timetable · Leaderboard (CSV upload) · Resources · Members

## 6. Folder structure (planned)
```
app/
  page.tsx                 home
  events/ page.tsx, [slug]/page.tsx
  calendar/page.tsx
  leaderboard/page.tsx
  resources/page.tsx
  admin/ ...               protected
  api/ ...                 save endpoints (commit to GitHub / Blob)
components/  ui/, layout/, events/, calendar/, leaderboard/
data/        events.json, timetable.json, contests/, resources.json, members.json
lib/         data access, storage adapter, csv parser, auth
public/      logo, images
```
A single **storage adapter** (`lib/storage.ts`) means the choice between option A and option B affects only one file.

## 7. Phases (one at a time)

| # | Phase | Output |
|---|---|---|
| 1 | Setup + design system + Navbar/Footer + **Home page** | Public home page you can view and give feedback on |
| 2 | **Events** page + detail page (Supabase `events` table) ✅ | Public events |
| 3 | **Calendar** with batch filter (Supabase `batches` + `classes`) ✅ | Public timetable |
| 4 | **Leaderboard** (Supabase `contests` + `contest_results`; CSV import via `npm run import:contest`) ✅ | Public leaderboard |
| 5 | **Resources & Blogs** ✅ resources (static list in `lib/resources.ts`); blogs and CSES solutions upcoming | Public resources |
| 6 | **Auth + Admin panel**: event form, timetable & batches editor, CSV upload, members ✅ | Admin editing |
| 7 | Deploy to Vercel, add a domain, SEO/OG images, polish | Live site |

## 8. Open questions
1. ~~Storage~~: decided on Supabase
2. ~~Batch names~~: placeholders for now, editable later
3. ~~Who can edit~~: decided that every logged-in member can edit
4. ~~Leaderboard scoring~~: Codeforces points as they appear in the ranklist
5. ~~Logo~~: recreated as SVG at `public/brand/codeplus-logo.svg`, with the original PNG kept alongside
6. Tagline and social links (Instagram/LinkedIn/Discord/CF group): still open, placeholders for now
