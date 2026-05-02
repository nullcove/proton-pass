# Proton Pass — Replit Workspace

## Overview
A full-stack password manager monorepo. Contains two frontend apps and one shared backend API.

## Architecture

```
artifacts/
  api-server/           — Express + Drizzle ORM backend (port 8080, serves /api)
  proton-pass/          — React + Vite frontend (port 3002)
  proton-pass-next/     — Next.js 15 frontend (port 3001, serves /)
  mockup-sandbox/       — Vite mockup sandbox
lib/
  db/                   — PostgreSQL schema (vaults, items tables via Drizzle)
  api-spec/             — OpenAPI spec + codegen config
  api-zod/              — Generated Zod schemas
  api-client-react/     — Generated React Query hooks
```

## Backend (api-server)

- **Framework**: Express + pino logging
- **Database**: PostgreSQL via Drizzle ORM
- **Routes**: `/api/healthz`, `/api/vaults`, `/api/items`, `/api/stats`, `/api/generator`

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| GET/POST | /api/vaults | List/create vaults |
| GET/PATCH/DELETE | /api/vaults/:id | Get/update/delete vault |
| GET/POST | /api/items | List/create items (supports ?vaultId, ?type, ?trashed, ?search, ?pinned) |
| GET/PATCH/DELETE | /api/items/:id | Get/update/delete item |
| GET | /api/stats | Dashboard stats |
| GET | /api/stats/weak-passwords | Logins with weak/vulnerable passwords |
| GET | /api/stats/reused-passwords | Grouped reused passwords |
| POST | /api/generator/password | Generate password |
| POST | /api/generator/passphrase | Generate passphrase |
| POST | /api/generator/score | Score a password |

## Insforge Backend
- **Base URL**: `https://7mr7cxjn.ap-southeast.insforge.app`
- **API Key**: stored in `INSFORGE_API_KEY` env var
- **SDK**: `@insforge/sdk` used in `proton-pass-next/src/lib/insforge.ts`
- **Connection**: proton-pass-next's Next.js API routes proxy to Express api-server (localhost:8080)
  - This avoids the need for `INSFORGE_ANON_KEY` which is not available via API

## Database Schema
- **vaults**: id, name, description, color, icon, created_at, updated_at
- **items**: id, vault_id, type, title, username, password, urls (JSON), note, cardholder_name, card_number, expiration_date, cvv, card_type, first_name, last_name, email, phone, address, city, country, alias_email, totp, pinned, trashed, password_score, last_used_at, created_at, updated_at

## Running the Apps
- **API Server**: `pnpm --filter @workspace/api-server run dev`
- **Proton Pass Next.js**: `PORT=3001 pnpm --filter @workspace/proton-pass-next run dev`
- **Proton Pass React**: `PORT=3002 BASE_PATH=/ pnpm --filter @workspace/proton-pass run dev`
- **DB Migration**: `pnpm --filter @workspace/db run push`

## GitHub
- **Repo**: https://github.com/nullcove/proton-pass
- Code synced via GitHub REST API (PAT-based push)

## Environment Variables
| Variable | Purpose |
|----------|---------|
| INSFORGE_BASE_URL | Insforge project base URL |
| INSFORGE_API_KEY | Insforge admin API key |
| INSFORGE_ANON_KEY | Insforge anon key (not required — routes proxy to Express) |
| SESSION_SECRET | Session encryption secret |
| DATABASE_URL | PostgreSQL connection string (auto-set by Replit) |
