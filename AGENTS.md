# RoboRoman – Working Brief (for agents)

Goal: Build a German-language AI tool directory for DACH. Desktop-first responsive. Guests are read-only. Members can bookmark tools into “Mein Tool Stack”. Admins manage tools and news in an internal admin panel.

## Reference UI
- Use provided reference images for layout, spacing, typography, component style.
- If images are unavailable: clean SaaS look using shadcn/ui defaults; keep styling modular to adjust later.

## Tech Stack (required)
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase: Postgres + Auth + Storage
- RLS is mandatory for all writes (do not rely on UI-only checks).
- Deploy via Vercel + GitHub.

## Security / Secrets
- Never print/request/hardcode secrets.
- Use .env.local; ignore .env* (commit only .env.example).
- Never expose the service role key in client code; only NEXT_PUBLIC_* on the client.
- .cursorignore must block .env*, backups/exports/logs, build folders, node_modules.

## Roles & Permissions (RBAC)
- Roles: guest (anon), member, admin.
- profiles table: auth.users.id PK, role enum member|admin.
- RLS: tools/news/categories/tags readable by anon+auth; bookmarks owner-only CRUD; admin-only CUD for tools/news/categories/tags.
- Protect /admin server-side (middleware or server checks reading user+role).

## Information Architecture (German nav)
- Home: Hero + Suche + Einführung + Kategorien/Tags/Filter + Tool-Liste
- Neue Tools: newest first
- KI Nachrichten: list + detail
- Mein Tool Stack: members only
- Newsletter: subscribe page
- Über mich: static

## Core Entities (MVP)
### Tool (admin-entered)
- slug, name, kurzbeschreibung, beschreibung, zusammenfassung
- logo, thumbnail (Supabase Storage; store path + public URL)
- categories, tags
- preismodell, plattform, use_case
- affiliate_url (server-only via redirect)
- GDPR: avv_dpa (yes/no/unknown), hosting_region (EU/USA/unknown), subprocessors (yes/no/unknown), data_types (checklist + notes), security_measures (checklist + notes), risk_level (low/medium/high), sources (privacy policy url, dpa url, security url), last_checked_at
- Disclaimer on tool detail: “Keine Rechtsberatung”.

### News
- slug, title, excerpt, content, published_at, tags, sources

### Bookmarks (“Mein Tool Stack”)
- userId + toolId, createdAt, optional notes (private per user)

### Affiliate tracking
- All outbound links go through /out/[slug]; log tool_id, user_id (nullable), timestamp, referrer/user-agent; redirect to tool.affiliate_url.

## Animation & Micro-Interactions
- Tailwind transitions on hover/focus for buttons, cards, chips, nav.
- Framer Motion for: page/section entrance, modal/drawer open/close, filter chip selection, tool card hover elevation, loading skeleton fade.
- Respect prefers-reduced-motion.
- Required micro-interactions: search, filter, bookmark, admin save/publish.

## UI Quality
- Consistent motion style; desktop-first, responsive; avoid random effects.

## MVP order
1) Scaffold Next.js + Tailwind + shadcn/ui + Framer Motion.
2) Supabase: SQL schema + RLS + seed (tools, news, categories, tags); document first-admin creation path.
3) Public pages: Home, Neue Tools, KI Nachrichten (list + detail), Tool detail (GDPR module).
4) Auth: Supabase login/signup; member-only “Mein Tool Stack”.
5) Admin: /admin CRUD for tools/news (shadcn tables/forms; uploads to Supabase Storage).

## Implementation rules
- Ship in small, working increments.
- Prefer Server Components for data fetching; Client Components only for interactive parts (filters, bookmark button, forms).
- Validate forms with Zod (client + server).
- Centralize queries in data-layer modules; avoid duplication.

## README requirements
- Local setup; Supabase setup; applying SQL + RLS; required env vars.
- Vercel deploy via GitHub.
- Production checklist: RLS enabled, admin created, storage configured.

## Output expectations
- Provide exact file changes, SQL policies, commands.
- Manual Supabase/Vercel UI actions as checklists.
