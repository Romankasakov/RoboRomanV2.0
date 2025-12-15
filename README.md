# RoboRoman
German-language AI tool directory for DACH. Desktop-first responsive. Public browsing, member bookmarks, admin CRUD for tools/news.

## Tech
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (Postgres + Auth + Storage) with RLS enforced
- Deploy: Vercel via GitHub

## Local setup
1) Install deps
```bash
npm install
```
2) Environment: copy `.env.example` → `.env.local` and fill your Supabase project values. Do **not** commit secrets.
3) Dev server
```bash
npm run dev
```
App runs on http://localhost:3000.

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only usage e.g. CLI; never expose to client)
- `NEXT_PUBLIC_SITE_URL` (used for metadata)
- `NEXT_PUBLIC_SUPABASE_TOOL_BUCKET` (default `tool-media`)
- `NEXT_PUBLIC_SUPABASE_NEWS_BUCKET` (default `news-media`)

## Supabase (schema + RLS + seed)
- SQL files: `supabase/schema.sql` (tables, RLS, policies, buckets) and `supabase/seed.sql` (categories, tags, demo tools/news).
- Quick apply with CLI (requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in shell):
```bash
supabase db remote commit --file supabase/schema.sql
supabase db remote commit --file supabase/seed.sql
```
  Or paste each file into the Supabase SQL editor and run once.
- Create first admin after signup:
```sql
update public.profiles set role = 'admin' where id = '<auth.users.id>';
```
- More notes: `supabase/README.md`.

## Pages implemented (public)
- `/` Home with hero, search & filter Tool Explorer, latest news.
- `/neue-tools` newest tools first.
- `/news` list + `/news/[slug]` detail.
- `/tools/[slug]` detail with GDPR module and disclaimer “Keine Rechtsberatung” (ASCII).
- `/newsletter` subscribe form (server action).
- `/ueber-mich` static info.

## Auth / protected
- `/login` Supabase email+password login/signup (client-side supabase-js).
- `/mein-tool-stack` member-only; requires login; shows bookmarks (private per user via RLS) with toggle.
- `/admin` guarded server-side via profile.role === admin (placeholder UI for CRUD).
- Outbound affiliate redirect + click logging: `/out/[slug]`.

## Styling / UI
- Tailwind + shadcn/ui components; motion wrappers in `components/motion` respect `prefers-reduced-motion`.
- Gradient background + glass cards; micro-interactions on buttons, filters, bookmarks, search.

## Vercel deploy
1) Connect repo to Vercel.
2) Set env vars from `.env.example` (no service role in client).
3) Deploy; Next.js app builds on Vercel.

## Production checklist
- [ ] RLS enabled (schema.sql) and applied on production DB.
- [ ] First admin promoted in `public.profiles`.
- [ ] Storage buckets `tool-media`, `news-media` created and policies applied.
- [ ] `.env.local` not committed; only `.env.example` in repo.
- [ ] Affiliate redirect `/out/[slug]` tested; click_events inserts work.
- [ ] Auth flows tested (login/signup/logout), /admin route protection verified.
