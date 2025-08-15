# PRD — Insightify • Fashion (Ghana)

## Vision
A lightweight, mobile-first business manager for Ghanaian fashion artisans (tailors, seamstresses, small ateliers).

## Objectives
- Track orders from intake → ready → pickup, with due-date awareness.
- Manage customers, inventory, and vendor purchases.
- Provide simple reports and SMS updates.

## Users & Roles
- **Owner**: full access, pricing, inventory thresholds, reports.
- **Staff**: create/edit orders, view inventory, limited actions.

## Key Workflows
1. **Quick Order Intake** → select customer, title, due date, amount → assign job number.
2. **Order Progress** → state machine with optional extended ETA.
3. **Due/Overdue Awareness** → dashboard badges (amber/red).
4. **Pickup** → send SMS on ready (CLOSED) and confirmation (PICKED_UP).
5. **Inventory** → items with vendor and reorder threshold; record purchases.
6. **Reporting** → orders & purchases by date range.

## Functional Requirements (MVP)
- Multi-tenant (each shop is a **workspace**).
- Auth with email/password.
- CRUD: customers, items, vendors.
- Orders with job numbers per workspace.
- SMS provider abstraction (mock by default; Hubtel/Africa’s Talking optional).

## Non-Functional
- Reliability: basic retries on DB; safe error boundaries on UI.
- Performance: pages render < 2s on 3G; DB queries indexed on `(workspaceId, jobNumber)`.
- Security: RBAC; input validation (Zod); rate limiting on sensitive ops.
- Observability: server logs include `userId`, `workspaceId`, op name.

## Localization
- Currency: GHS, dates: Africa/Accra.

## Success Metrics
- < 60s average time to create an order.
- Daily active staff creating/updating orders.
- Reduced missed deadlines (ratio of overdue orders decreases).
