# Proton Pass Clone

A full-featured password manager web app inspired by Proton Pass. Dark purple theme, React + Vite frontend with Express backend.

## Architecture

**Monorepo** (pnpm workspaces):
- `artifacts/proton-pass` — React + Vite frontend (port 22220, preview at `/`)
- `artifacts/api-server` — Express 5 REST API (port 8080, prefix `/api`)
- `lib/api-spec` — OpenAPI 3.0 spec + Orval codegen config
- `lib/api-client-react` — Generated React Query hooks (`@workspace/api-client-react`)
- `lib/api-zod` — Generated Zod validation schemas
- `lib/db` — Drizzle ORM schema + migrations (`@workspace/db`)

## Features

- **Dashboard** — Security score, item counts by type, vault list, recent activity
- **All Items / Vault view** — Search, filter by type, pinned items, item detail panel
- **Item types**: Login (w/ password scoring), Credit Card, Secure Note, Identity, Email Alias
- **Password Generator** — Password (length/chars) + Passphrase (words/separator/caps)
- **Security Center** — Weak password detection, reused password groups, security grade
- **Trash** — Soft-delete, restore, permanent delete

## Stack

- **Frontend**: React 18, Vite, TailwindCSS 4, wouter (routing), React Query, shadcn/ui components
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, pino logging
- **Codegen**: Orval (OpenAPI → React Query hooks + Zod schemas)

## Theme

Deep purple-dark background (`hsl(246 23% 9%)`), violet primary (`hsl(258 100% 66%)`). All CSS custom properties in `artifacts/proton-pass/src/index.css`.

## Key Files

- `lib/api-spec/openapi.yaml` — Full API contract
- `lib/db/src/schema/` — `vaults.ts`, `items.ts` (Drizzle schemas)
- `artifacts/api-server/src/routes/` — `vaults.ts`, `items.ts`, `generator.ts`, `stats.ts`
- `artifacts/proton-pass/src/App.tsx` — Router + QueryClient setup
- `artifacts/proton-pass/src/components/Layout.tsx` — Sidebar navigation
- `artifacts/proton-pass/src/pages/` — Dashboard, VaultPage, GeneratorPage, SecurityPage, TrashPage

## Database

PostgreSQL via `DATABASE_URL`. Seeded with 3 vaults (Personal, Work, Finance) and 14 items across all types.

Run migrations: `pnpm --filter @workspace/db run push`

## Codegen

After editing `lib/api-spec/openapi.yaml`:
```
pnpm --filter @workspace/api-spec run codegen
```
