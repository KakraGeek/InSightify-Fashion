# Test Plan — Insightify • Fashion

## Strategy (Test Pyramid)
- **Smoke** (fast, always-on): API + UI `@smoke` via unified runner `npm run smoke`.
- **E2E**: Playwright flows (auth, intake, state transitions).
- **Integration**: Resolver + Prisma + DB (happy/edge cases).
- **Unit**: Utilities, validation schemas.

## Coverage Goals
- Critical resolvers: 90%+ lines/branches.
- Smoke: covers all main pages load + one critical action each slice.

## Environments
- Local dev with Postgres (Neon ok).
- CI: run `npm run prisma:migrate`, seed, `npm run smoke` then `npm run test:e2e`.

## Test Data
- Seed creates demo workspace, users, items, orders.
- Tests should not rely on hardcoded IDs; select by visible text or job number.

## Accessibility
- ARIA roles for forms/tables; Playwright checks for focus & visible labels.

## Performance (basic)
- Page first render under 2s; API list under 500ms (local).

## Security Checks
- Auth required for protected pages.
- STAFF forbidden from OWNER-only actions.
- Invalid payloads rejected (400/422).

## Commands
```
npm run smoke        # API then UI (@smoke)
npm run test:e2e     # full e2e
```
