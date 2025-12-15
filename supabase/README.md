# Supabase Setup

This repo ships SQL you can run in Supabase (self-hosted or cloud). Use either the Supabase SQL editor or the CLI.

## Prerequisites
- Supabase project (Postgres + Auth + Storage)
- Supabase CLI installed (`npm i -g supabase`)
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your shell when using the CLI (do **not** commit them).

## Apply schema (tables + RLS + policies)
From repo root:
```bash
supabase db remote commit --dry-run # optional preview
supabase db remote commit --file supabase/schema.sql
```
If you prefer the SQL editor, paste the contents of `supabase/schema.sql` and run it once.

## Seed starter data (categories, tags, tools, news)
```bash
supabase db remote commit --file supabase/seed.sql
```
or run the SQL in the dashboard once.

## Create the first admin
After you sign up the first user, promote them:
```sql
update public.profiles
set role = 'admin'
where id = '<auth.users.id of your admin>';
```
This uses RLS-safe admin promotion (run with service role or via SQL editor).

## Buckets
The schema creates public buckets `tool-media` and `news-media`. Confirm they exist and keep them public-read as defined by the policies if you need unauthenticated access to images.
