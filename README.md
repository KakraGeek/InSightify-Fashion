# Insightify - Fashion (Blitz.js Starter)

## Quick Start (Windows-friendly)
1) `npm i`
2) Copy `.env.example` → `.env` and set `DATABASE_URL` (Neon/Postgres)
3) `npm run prisma:migrate`
4) `npm run seed`
5) `npm run dev`  (app at http://localhost:3000)
6) In a second terminal, run smoke tests: `npm run smoke`

## Features

### Enhanced Reports & Analytics
The reports system provides comprehensive business intelligence including:
- **Financial Metrics**: Order/purchase summaries, net revenue tracking
- **Inventory Management**: Low stock alerts, total inventory value, reorder planning
- **Order Tracking**: Overdue orders, extended delivery dates, customer insights
- **Business Intelligence**: Top-selling items, performance analytics

### Core Functionality
- **Customer Management**: Measurements, preferences, order history
- **Inventory Control**: Stock levels, reorder points, vendor management
- **Order Processing**: Status tracking, deadline management, file attachments
- **Multi-workspace Support**: Isolated business environments

- UI: Next.js App Router + Tailwind
- Server: Blitz RPC-style resolvers under `app/**/queries|mutations`
- DB: Prisma/Postgres
- SMS: `lib/sms.ts` (mock by default)
- Tests: Playwright e2e + unified smoke runner