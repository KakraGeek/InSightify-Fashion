# Smart Prompts — Insightify • Fashion (Blitz.js / Next.js)

These are **ready-to-paste** prompts for Cursor’s AI agent. Each slice includes: goal, scope, files to touch, acceptance criteria, and **mandatory smoke tests**. After each slice: **STOP and print `PAUSE FOR APPROVAL`**.

> Global rules: Use **Blitz RPC** resolvers under `app/**/(queries|mutations)`, Prisma for DB, Tailwind UI, and enforce **row-level tenancy** with `workspaceId` in every resolver. **Write smoke tests and run `npm run smoke` before asking for approval.**

---

## Phase 0 — Tooling & Unified Smoke Runner (execute first)
**Goal**: Confirm dev environment & tests pipeline.

**Do**
- Ensure scripts exist in `package.json`: `smoke`, `smoke:api`, `smoke:ui`, `test:e2e`.
- Create/verify `tests/smoke/api-smoke.js` hitting `/api/health`.
- Add one Playwright `@smoke` test verifying dashboard renders.
- Commands to print:
  ```bash
  npm i
  cp .env.example .env   # paste DATABASE_URL
  npm run prisma:migrate
  npm run seed
  npm run dev
  npm run smoke
  ```

**Deliver**
- Files changed, commands list, smoke results.
- Print `PAUSE FOR APPROVAL`.

---

## Slice 1 — Auth + Workspace Session + Tenancy
**Goal**: Email/password login. On login, put `{ userId, role, workspaceId }` in session. All resolvers scope by `workspaceId`.

**Files**
- `app/auth/mutations/login.ts` (+ session create)
- `app/auth/mutations/logout.ts`
- `app/users/queries/whoami.ts`
- Update **every** resolver example to read `ctx.session.workspaceId` (or pass `wsId` param until auth wired).

**Acceptance**
- Can log in with seeded user (`owner@example.com` / `Password123!`).
- Calling a protected resolver without session rejects.
- Protected resolvers return **only** current workspace’s data.

**Smoke tests**
- API: login → whoami; protected list returns 2xx & only workspace data.
- UI (@smoke): login flow → dashboard visible.

**Pause** for approval.

---

## Slice 2 — Customers + Quick Order Intake
**Goal**: Create customers; one-screen order creation.

**Scope**
- Pages: `/customers`, `/orders` (intake + list).
- Resolvers: `customers/createCustomer`, `orders/createOrder`, `orders/listOrders`.
- Job numbers increment per workspace.

**Acceptance**
- Create customer → appears in list.
- Create order for existing customer → appears with correct `jobNumber`.
- Tenancy enforced (cannot reference customer from another workspace).

**Smoke tests**
- API: create customer; create order; list contains it (scoped).
- UI (@smoke): use form → new row visible.

**Pause**.

---

## Slice 3 — Dashboard + Colour Coding
**Goal**: Operational awareness.

**Scope**
- Resolver: `dashboard/getDashboardData` → counts (OPEN, EXTENDED, CLOSED this month, PICKED_UP); `dueSoon` (<=48h, amber), `overdue` (red).
- Page: `/` shows stat cards + two lists; Tailwind components used.

**Acceptance**
- Counts match DB.
- Items with due date < now show in `overdue`; between now and +48h in `dueSoon`.
- Badges render with correct colours.

**Smoke tests**
- API: returns counts (numbers) and two arrays.
- UI (@smoke): cards & lists visible; badges use amber/red.

**Pause**.

---

## Slice 4 — Order State Machine + SMS
**Goal**: Transitions + SMS notifications.

**Scope**
- States: `OPEN → EXTENDED(new ETA) → CLOSED → PICKED_UP`.
- Resolver: `orders/updateOrderState` performs transitions & writes `extendedEta` when EXTENDED.
- SMS via `lib/sms.ts` (mock default).

**Acceptance**
- Transition writes new state (+ ETA when EXTENDED).
- On CLOSED/EXTENDED/PICKED_UP, send SMS (mock logs).

**Smoke tests**
- API: transition sequence returns persisted state; mock SMS logged.
- UI (@smoke): change state from UI → reflected in table.

**Pause**.

---

## Slice 5 — Inventory + Reorder Alerts
**Goal**: Track inputs with thresholds.

**Scope**
- Resolvers: `items/listItems` (returns `{items, alerts}`), `items/upsertItem`, `purchase/recordPurchase` (increments stock).
- Page: `/inventory` with alert badges when `qty <= reorderLevel`.

**Acceptance**
- Upsert item works.
- Recording purchase increments item `qty` and updates `unitPrice`.
- Alerts appear for low stock.

**Smoke tests**
- API: set qty at/below threshold → item id appears in `alerts`.
- UI (@smoke): alert badge visible for that item.

**Pause**.

---

## Slice 6 — Reports MVP
**Goal**: Period summaries.

**Scope**
- Resolver: `reports/getReports({from,to})` returns orders & purchases in range.
- Page: `/reports` with from/to inputs and basic totals.

**Acceptance**
- Changing range updates results.
- All queries scoped by `workspaceId`.

**Smoke tests**
- API: returns arrays with minimal schema; respects date range.
- UI (@smoke): totals change when range changes.

**Pause**.

---

## Hardening — RBAC, Validation, Rate Limiting, Logs
**Goal**: Ship-ready.

**Scope**
- RBAC: OWNER vs STAFF (e.g., delete/price changes owner-only).
- Zod validation on all resolver inputs.
- Rate limit sensitive mutations.
- Server logs include `userId`, `workspaceId`, op name.

**Acceptance**
- STAFF blocked from OWNER-only mutations.
- Invalid payloads rejected with 4xx and message.
- Rate limit returns 429 when abused.

**Smoke tests**
- API: forbidden for STAFF; invalid payloads rejected.
- UI (@smoke): restricted actions hidden/disabled for STAFF.

**Final step**
- Re-run **all** smoke tests and print “READY TO DEPLOY”.
