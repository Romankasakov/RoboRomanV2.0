-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('member', 'admin');
  end if;
end$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'member',
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper using profiles (defined after table exists)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, created_at, updated_at)
  values (new.id, 'member', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Tools
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kurzbeschreibung text,
  beschreibung text,
  zusammenfassung text,
  logo_url text,
  thumbnail_url text,
  cta_label text default 'Direkt besuchen',
  preismodell text,
  plattform text,
  use_case text,
  affiliate_url text,
  rating_overall numeric(4,2),
  rating_gdpr numeric(4,2),
  avv_dpa text check (avv_dpa in ('yes','no','unknown')) default 'unknown',
  hosting_region text check (hosting_region in ('eu','usa','unknown')) default 'unknown',
  subprocessors text check (subprocessors in ('yes','no','unknown')) default 'unknown',
  avv_dpa_details text,
  hosting_region_details text,
  risk_level_details text,
  avv_dpa_statuses text[] default '{}'::text[],
  hosting_regions text[] default '{}'::text[],
  data_types jsonb default '{}'::jsonb,
  data_type_notes text,
  security_measures jsonb default '{}'::jsonb,
  security_notes text,
  risk_level text check (risk_level in ('low','medium','high')) default 'medium',
  gdpr_score numeric(4,2),
  community_rating numeric(3,2),
  social_proof jsonb default '{}'::jsonb,
  feature_flags text[] default '{}'::text[],
  sources jsonb default '{}'::jsonb,
  last_checked_at timestamptz,
  is_featured boolean default false,
  is_recommended boolean default false,
  is_trending boolean default false,
  is_new boolean default false,
  partner_offer boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tools_updated_at
before update on public.tools
for each row execute function public.set_updated_at();

-- Categories & Tags
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  scope text check (scope in ('tool','news','both')) not null default 'tool'
);

create table if not exists public.tool_categories (
  tool_id uuid references public.tools(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (tool_id, category_id)
);

create table if not exists public.tool_tags (
  tool_id uuid references public.tools(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (tool_id, tag_id)
);

-- News
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  image_url text,
  published_at timestamptz not null default now(),
  sources jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

create table if not exists public.news_tags (
  news_id uuid references public.news(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (news_id, tag_id)
);

-- Newsletter
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent boolean default true,
  created_at timestamptz not null default now()
);

-- Bookmarks
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists bookmarks_user_tool_idx on public.bookmarks(user_id, tool_id);

-- Tool Votes
create table if not exists public.tool_votes (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type text not null check (vote_type in ('up','down')),
  created_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

-- Affiliate click events
create table if not exists public.click_events (
  id bigserial primary key,
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid references auth.users(id),
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('tool-media', 'tool-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('news-media', 'news-media', true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.tools enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.tool_categories enable row level security;
alter table public.tool_tags enable row level security;
alter table public.news enable row level security;
alter table public.news_tags enable row level security;
alter table public.bookmarks enable row level security;
alter table public.tool_votes enable row level security;
alter table public.click_events enable row level security;
alter table if exists public.newsletter_subscriptions enable row level security;
alter table storage.objects enable row level security;

-- Policies
-- Profiles
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id and role = 'member')
with check (auth.uid() = id and role = 'member');

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage" on public.profiles
for all using (public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert with check (auth.uid() = id and role = 'member');

-- Tools
drop policy if exists "tools_read_all" on public.tools;
create policy "tools_read_all" on public.tools
for select using (true);

drop policy if exists "tools_admin_write" on public.tools;
create policy "tools_admin_write" on public.tools
for all using (public.is_admin()) with check (public.is_admin());

-- Categories
drop policy if exists "categories_read_all" on public.categories;
create policy "categories_read_all" on public.categories
for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

-- Tags
drop policy if exists "tags_read_all" on public.tags;
create policy "tags_read_all" on public.tags
for select using (true);

drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write" on public.tags
for all using (public.is_admin()) with check (public.is_admin());

-- Tool relationships
drop policy if exists "tool_categories_admin" on public.tool_categories;
create policy "tool_categories_admin" on public.tool_categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tool_categories_read" on public.tool_categories;
create policy "tool_categories_read" on public.tool_categories
for select using (true);

drop policy if exists "tool_tags_admin" on public.tool_tags;
create policy "tool_tags_admin" on public.tool_tags
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tool_tags_read" on public.tool_tags;
create policy "tool_tags_read" on public.tool_tags
for select using (true);

-- News
drop policy if exists "news_read_all" on public.news;
create policy "news_read_all" on public.news
for select using (true);

drop policy if exists "news_admin_write" on public.news;
create policy "news_admin_write" on public.news
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "news_tags_admin" on public.news_tags;
create policy "news_tags_admin" on public.news_tags
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "news_tags_read" on public.news_tags;
create policy "news_tags_read" on public.news_tags
for select using (true);

-- Bookmarks (private per user)
drop policy if exists "bookmarks_owner" on public.bookmarks;
create policy "bookmarks_owner" on public.bookmarks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tool Votes
drop policy if exists "tool_votes_read_all" on public.tool_votes;
create policy "tool_votes_read_all" on public.tool_votes
for select using (true);

drop policy if exists "tool_votes_owner_insert" on public.tool_votes;
create policy "tool_votes_owner_insert" on public.tool_votes
for insert with check (auth.uid() = user_id);

drop policy if exists "tool_votes_owner_update" on public.tool_votes;
create policy "tool_votes_owner_update" on public.tool_votes
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tool_votes_owner_delete" on public.tool_votes;
create policy "tool_votes_owner_delete" on public.tool_votes
for delete using (auth.uid() = user_id);

-- Click events
drop policy if exists "click_events_insert_all" on public.click_events;
create policy "click_events_insert_all" on public.click_events
for insert with check (true);

drop policy if exists "click_events_admin_read" on public.click_events;
create policy "click_events_admin_read" on public.click_events
for select using (public.is_admin());

-- Newsletter
drop policy if exists "newsletter_insert" on public.newsletter_subscriptions;
create policy "newsletter_insert" on public.newsletter_subscriptions
for insert with check (true);

drop policy if exists "newsletter_admin_read" on public.newsletter_subscriptions;
create policy "newsletter_admin_read" on public.newsletter_subscriptions
for select using (public.is_admin());

-- Storage
drop policy if exists "Public read tool/news media" on storage.objects;
create policy "Public read tool/news media" on storage.objects
for select using (bucket_id in ('tool-media','news-media'));

drop policy if exists "Admin full access media" on storage.objects;
create policy "Admin full access media" on storage.objects
for all using (public.is_admin()) with check (public.is_admin());
