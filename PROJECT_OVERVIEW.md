# gaia.solutions — Project Overview

Worker-owned software co-op based in Lansing, MI, part of The Fledge ecosystem. This repo is both the public marketing site and an internal CRM/project-management tool the co-op uses to run its own client work.

**Stack:** Next.js 16, React 19, Prisma 7 + PostgreSQL, next-auth v5 (credentials), bcryptjs. No CSS framework — hand-written design tokens in `src/app/globals.css` (moss green + amber palette).

## Public marketing site (route group `(marketing)`)

- `/` — homepage
- `/work` — portfolio
- `/capabilities` — service offerings
- `/co-op` — about the co-op structure
- `/team`
- `/contact` — currently a placeholder form (no email backend wired yet)

Session-aware nav: shows "Sign in" or "App →" depending on auth state.

## Auth (route group `(auth)`)

Credentials-based login (email + password) at `/login`, plus `/signup`, `/forgot-password`, `/reset-password`. Redirects into the app at `/app/crm` after login. Three roles: `ADMIN`, `MEMBER` (default), `CLIENT` (legacy `USER` role kept for backward compat).

## Internal app (`/app/*`, auth-required)

- **CRM** (`/app/crm`) — contact list with "warmth" decay (Hot/Warm/Cool/Cold based on days since last touch), add/edit, interaction timeline
- **Companies** (`/app/companies`) — orgs typed as CLIENT/PARTNER/FUNDER/PRESS/COMMUNITY/ECOSYSTEM, linked contacts + stories
- **Board** (`/app/board`) — Kanban: Backlog → Sprint → In Progress → Review → Done. Cards carry type (CLIENT/PARTNER/INTERNAL/OPEN_SOURCE/INVESTIGATION/GOVERNANCE), points, linked contact/company, blocked/flagged flags, time-logging
- **Sprints** (`/app/sprints`) — create/list sprints, assign board stories to a sprint, sprint detail page with points-done/total + completion % + per-status breakdown, plus a free-text retro/reflection box per sprint
- **Members** (`/app/members`, admin-only) — role management, links a User to a CRM Contact
- **Time** (`/app/time`) — hours logging by category (DEVELOPMENT/DESIGN/MEETING/OPS/RESEARCH/OTHER), per-week view, admin team filter
- **Proposals** (`/app/proposals`) — client proposal builder/preview, shareable via `/p/[token]`
- **Requests** (`/app/requests`) — incoming work requests
- **Pipeline** (`/app/pipeline`) — sales/project pipeline view
- **Client portal** (`/client`, `CLIENT` role) — scoped external view; API under `/api/client/*`

## Internal automation

- `POST /api/internal/stories` — bearer-token-authenticated endpoint other Fledge-ecosystem repos (resilience.foundation, lansing.love, thefledge.com, Urbandale) use to file backlog cards directly onto this board, scoped by company `orgId`.

## Data model highlights (Prisma)

`User` ↔ `Contact` (optional link), `Org` (company), `Story` (board card — has `sprintId`, `contactId`, `orgId`, `assignedToId`), `Sprint` (number, date range, focus, `reflection`), `TimeEntry`, `Proposal` + items.

## Known gaps (as of 2026-06-24)

- `/contact` form has no real backend (Resend not wired)
- No search on any list view
- Work portfolio data is duplicated/inconsistent between homepage and `/work`
- No pricing/packages page
