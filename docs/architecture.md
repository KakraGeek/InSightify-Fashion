# Architecture — Insightify • Fashion (Blitz.js + Next.js + Prisma)

## System
- **Next.js (App Router)** UI with Tailwind components.
- **Blitz RPC** resolvers in `app/**/(queries|mutations)`.
- **Prisma + Postgres** (Neon recommended).
- **Multi-tenancy**: every query/mutation filters by `workspaceId` from session.
- **SMS**: `lib/sms.ts` with providers `mock|hubtel|africastalking` via `.env`.

## Data Model
- Workspace(1) — User(*), Customer(*), Item(*), Order(*), Vendor(*), Purchase(*).
- `Order.jobNumber` sequential **per workspace**; index `(workspaceId, jobNumber)`.

## Auth & Session
- Blitz session stores `{ userId, role, workspaceId }` on login.
- Resolvers use `ctx.session.$authorize()` and `ctx.session.workspaceId`.

## Validation & Security
- **Zod** schemas per resolver input.
- RBAC: OWNER vs STAFF checks at resolver boundary.
- Rate limit: simple token bucket on sensitive mutations.

## Error Handling
- Throw typed errors; map to friendly UI messages; never leak internals.
- Log: timestamp, op name, `userId`, `workspaceId`, duration, result.

## Folder Structure
See repo root; key locations:
```
/app/(routes)/*           # pages
/app/**/{queries,mutations}
/db                       # Prisma client
/prisma                   # schema + seed
/lib/sms.ts               # SMS provider abstraction
/tests/smoke              # API smoke
/e2e                      # Playwright e2e (@smoke subset)
```
