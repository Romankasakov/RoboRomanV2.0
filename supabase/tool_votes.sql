-- Tool Votes (Community Votes)
-- Adds per-user up/down votes with public read access and owner-only writes.

create table if not exists public.tool_votes (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type text not null check (vote_type in ('up','down')),
  created_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

alter table public.tool_votes enable row level security;

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

