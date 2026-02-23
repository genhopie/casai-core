# caseai

Production-grade local-first monorepo for legal workflows with strict zero server-side document storage.

## Architecture

- `apps/auth-api` (NestJS, port `3101`): auth, devices, license validation, subscriptions, admin user/revenue views.
- `apps/marketplace-api` (NestJS, port `3102`): anonym listings/bids/matches/reviews, ciphertext chat transport, moderation/admin views.
- `apps/worker` (NestJS + BullMQ): queue worker stubs for notifications/moderation scoring.
- `apps/web` (Next.js, port `3000`): local-first UI, IndexedDB encrypted vault integration, marketplace publishing UI.
- `packages/local-vault`: encrypted IndexedDB vault SDK using WebCrypto AES-GCM + PBKDF2.
- `packages/types`, `packages/ui`, `packages/config`: shared types/UI/config.
- `prisma/schema.prisma`: server DB schema with no document storage tables.

## Privacy and storage guarantees

- Documents are never uploaded by web case workspace; uploads write only to `IndexedDB` via `@caseai/local-vault`.
- IndexedDB stores (`cases`, `documents`, `timeline`) are encrypted payloads only.
- Encryption uses AES-GCM with random per-item IV and PBKDF2 key derivation (`>=150,000` iterations) using per-user salt.
- User password is used in memory only for deriving vault key; not persisted to localStorage/sessionStorage.
- Marketplace publish sends anonym metadata only.
- Server schema does not include raw files, extracted text, case notes, or party PII document artifacts.

## Prerequisites

- Docker + Docker Compose
- pnpm (via corepack in container)

## Run with Docker Compose

```bash
docker compose up -d
```

Then enter the dev container shell and run:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev:up
```

## Run in GitHub Codespaces

Open in Codespaces. The devcontainer runs:

```bash
pnpm install && pnpm db:generate && pnpm db:migrate && pnpm dev:up
```

## Workspace commands

```bash
pnpm dev:up
pnpm db:generate
pnpm db:migrate
pnpm -r typecheck
```

## Ports and URLs

- Web: `http://localhost:3000`
- Auth API: `http://localhost:3101`
- Marketplace API: `http://localhost:3102`

## Usage checklist

1. Create account
   - Open `/auth`, register with email/password, then login.
2. Create local case
   - Go to `/cases/new`, fill case fields, save.
3. Upload file (stays local)
   - Go to `/cases/:id` → Documents tab, upload file.
   - File is encrypted and stored in local IndexedDB only.
4. Publish anonym listing
   - From `/cases/:id` click publish, review payload in `/marketplace/publish?caseId=...`.
   - Confirm publish to send anonym listing metadata only to marketplace API.
5. Lawyer bids
   - Open `/marketplace`, submit bid on approved listing.
6. Match + E2EE chat (ciphertext transport only)
   - Use marketplace API match/thread endpoints; chat message payloads are ciphertext only.
7. Admin panel
   - Open `/admin` to view users, moderation queue, and revenue snapshots.

## Environment

Copy `.env.example` to `.env` and adjust secrets as needed.
