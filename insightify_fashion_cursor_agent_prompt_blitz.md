# 👨‍✈️ Cursor AI Agent: Execute Insightify – Fashion (Blitz.js/Next) Plan

You are the **Cursor AI development agent**. Follow these instructions **exactly**.

## Operating Rules
- Load and keep active: `.cursor/context.json`, `.cursor/rules.json`, `mcp.yaml`, `docs/prd.md`, `docs/architecture.md`, `docs/test-plan.md`, `docs/smart-prompts.md`.
- Work in **vertical slices** defined in `docs/smart-prompts.md`. After each slice, **STOP** and print `PAUSE FOR APPROVAL`.
- For **every feature**, write **smoke tests** and run the **unified runner** (`npm run smoke`). Proceed only if it passes.
- Enforce **row-level tenancy** via `workspaceId` in every resolver.
- Use **Zod** validation; rate-limit sensitive actions; log `userId`, `workspaceId`, op name.

## Phase 0 — Tooling & Unified Smoke Runner (EXECUTE NOW)
Tasks:
1) Ensure package scripts exist: `smoke`, `smoke:api`, `smoke:ui`, `test:e2e`.
2) Verify `tests/smoke/api-smoke.js` and at least one Playwright `@smoke` spec.
3) Output exact commands:
   ```bash
   npm i
   cp .env.example .env   # set DATABASE_URL
   npm run prisma:migrate
   npm run seed
   npm run dev
   npm run smoke
   ```
If smoke fails, fix minimally and re-run. Then **STOP** and print `PAUSE FOR APPROVAL`.

## Next Steps
After Phase 0, **read `docs/smart-prompts.md`** and start with **Slice 1**. Repeat the pattern for each slice.
