# Proton Pass Clone

A full-featured password manager web app inspired by Proton Pass. Dark purple theme, built as a Next.js 15 App Router app.

## Architecture

**Monorepo** (pnpm workspaces):
- `artifacts/proton-pass-next` — **Primary app**: Next.js 15 App Router (port 19700, preview at `/`)
- `artifacts/proton-pass` — Legacy React + Vite frontend (port 22220) — kept for reference
- `artifacts/api-server` — Express 5 REST API (port 8080) — kept for reference
- `lib/db` — Drizzle ORM schema + migrations (`@workspace/db`)

## Features

- **Dashboard** — Security score, item counts by type, vault list, recent activity
- **All Items / Vault view** — Search, filter by type, pinned items, item detail panel
- **Item types**: Login (w/ password scoring), Credit Card, Secure Note, Identity, Email Alias
- **Password Generator** — Password (length/chars) + Passphrase (words/separator/caps)
- **Security Center** — Weak password detection, reused password groups, security grade
- **Trash** — Soft-delete, restore, permanent delete

## Stack (Next.js version)

- **Framework**: Next.js 15 App Router (`use client` pages, API routes under `src/app/api/`)
- **UI**: TailwindCSS 4, shadcn/ui components, Radix UI primitives, Lucide icons
- **Data**: React Query v5 (@tanstack/react-query), custom hooks in `src/lib/api-client.ts`
- **Database**: Drizzle ORM + PostgreSQL via `@workspace/db`, singleton pool in `src/lib/db.ts`

## Theme

Deep purple-dark background (`hsl(246 23% 9%)`), violet primary (`hsl(258 100% 66%)`). CSS custom properties in `artifacts/proton-pass-next/src/app/globals.css`.

## Key Files (Next.js app)

- `artifacts/proton-pass-next/src/app/layout.tsx` — Root layout with Sidebar
- `artifacts/proton-pass-next/src/app/page.tsx` — Dashboard
- `artifacts/proton-pass-next/src/app/vault/page.tsx` — All Items
- `artifacts/proton-pass-next/src/app/vault/[vaultId]/page.tsx` — Per-vault view
- `artifacts/proton-pass-next/src/app/generator/page.tsx` — Password Generator
- `artifacts/proton-pass-next/src/app/security/page.tsx` — Security Center
- `artifacts/proton-pass-next/src/app/trash/page.tsx` — Trash
- `artifacts/proton-pass-next/src/app/api/` — Next.js API routes (vaults, items, stats, generator)
- `artifacts/proton-pass-next/src/components/Layout.tsx` — Sidebar navigation
- `artifacts/proton-pass-next/src/lib/api-client.ts` — React Query hooks
- `artifacts/proton-pass-next/src/lib/db.ts` — Drizzle + pg singleton

## Database

PostgreSQL via `DATABASE_URL`. Seeded with 3 vaults (Personal, Work, Finance) and 11 items.

Run migrations: `pnpm --filter @workspace/db run push`
