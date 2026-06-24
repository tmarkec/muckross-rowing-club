# Muckross Rowing Club

Official website for Muckross Rowing Club — news, club info, fundraising lotto,
sponsorship, and a private coaches' area for crew management, training plans,
rigging, inventory and schedules.

Live: https://muckross-rowing-club.lovable.app

## Tech stack

- **Framework:** TanStack Start v1 (React 19, file-based routing in `src/routes/`)
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4 (via `src/styles.css`) + shadcn/ui + Radix primitives
- **Data/Auth:** Lovable Cloud (Supabase) — Postgres, Row Level Security, Auth, Storage
- **Server logic:** TanStack `createServerFn` (see `src/lib/*.functions.ts`)
- **Editor:** Tiptap (rich text for news posts)
- **Deployment:** Lovable / Vercel (edge)

## Getting started

```bash
bun install
bun run dev        # http://localhost:8080
bun run build      # production build
bun run lint
```

Environment variables live in `.env` (see `.env.example`). The Supabase
publishable values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`) are managed by Lovable Cloud — do not edit by hand.

## Project structure

```
src/
  routes/                 File-based routes (TanStack Router)
    __root.tsx            Root layout, <head>, providers
    index.tsx             Home page + hero carousel
    about.tsx, contact.tsx, club-info.tsx, join.tsx, support.tsx
    news.index.tsx, news.$slug.tsx
    coaches.*.tsx         Protected coaches area (crews, groups, rigging,
                          inventory, training program, schedule, posts, admin)
    api/                  Public HTTP endpoints (webhooks, public APIs)
  components/             Shared UI (SiteHeader, SiteFooter, LottoCountdown, …)
    ui/                   shadcn/ui primitives
  lib/
    site.ts               Nav items, external URLs
    auth.tsx              Auth context
    *.functions.ts        Server functions (createServerFn)
    *.server.ts           Server-only helpers (never imported by client)
  integrations/supabase/  Auto-generated Supabase clients & types — do not edit
  hooks/, styles.css
public/                   Static assets served at site root (logos, hero images)
supabase/migrations/      SQL migrations (schema, RLS policies, grants)
```

## Routing

Routes are flat, dot-separated files under `src/routes/`. `routeTree.gen.ts`
is auto-generated — do not edit. Add a page by creating a new file (e.g.
`src/routes/foo.tsx`) and the router picks it up on the next build.

## Backend (Lovable Cloud / Supabase)

- **Auth:** email + Google OAuth. Coaches area is gated by the
  `_authenticated` layout and an `admin` role check.
- **Roles:** stored in a dedicated `user_roles` table with a security-definer
  `has_role(uuid, app_role)` function used inside RLS policies.
- **RLS:** every public table has explicit `GRANT`s and policies. New tables
  must follow the same pattern (see `supabase/migrations/`).
- **Tables of note:** `posts`, `post_images`, `user_roles`, `training_schedules`,
  inventory, rigging, crews/groups.
- **Server functions:** authenticated calls use `requireSupabaseAuth`
  middleware; `attachSupabaseAuth` is registered in `src/start.ts`.

## Key features

- Auto-rotating hero carousel on the home page (3s interval)
- News with rich-text editor, cover images and image galleries
- Weekly club lotto with synchronised countdown (footer + Support page)
- Sponsorship strip, join/contact flows
- Coaches area: crews, athlete groups, rigging editor, inventory manager,
  training program builder, pace calculator, weekly training schedule,
  post management (admin-only edits)

## Conventions

- Use semantic design tokens from `src/styles.css` — no hardcoded colors.
- Read server-only env vars (`process.env.*`) inside `.handler()` bodies only.
- Never import `src/integrations/supabase/client.server.ts` from client code.
- Public/webhook endpoints live under `src/routes/api/public/*` and must verify
  signatures inside the handler.

## License

© Muckross Rowing Club. All rights reserved.