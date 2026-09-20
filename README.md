# AgriMandi Maharashtra

**Multilingual, assisted-digital market-linkage platform** (Problem Statement ID: 26132).
Connecting farmers, FPOs, verified buyers, logistics providers, and graders with transparent market intelligence and traceable transaction workflows.

---

## Monorepo Layout

```
agrimandi/
├── apps/
│   ├── web/           # React + Vite + Tailwind + TypeScript (Mobile-first PWA)
│   ├── api/           # Node.js + Express + TypeScript + Prisma + Zod
│   └── ml-service/    # Python FastAPI service (Forecasting & matching)
├── packages/
│   ├── shared-types/  # Domain entities, enums, DTO contracts
│   ├── validation/    # Shared Zod validation schemas
│   └── ui/            # Reusable UI component library (optional)
├── prisma/            # Schema and database migration tracking
├── docs/              # Architectural decision records and specs
└── infra/             # Container and deployment configurations
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ LTS
- **pnpm**: v8+ or v9+ (`npm install -g pnpm`)
- **Python**: 3.11+ (for `apps/ml-service`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root (and in `apps/api` if needed):
```bash
cp .env.example .env
```

### 4. Development Commands
```bash
# Start backend API (runs on port 4000)
pnpm dev:api

# Start frontend web app (runs on port 5173)
pnpm dev:web

# Run full project checks
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## Architecture Principles
1. **Source Provenance**: All market prices clearly show source, market, grade, unit, and fetched timestamp.
2. **Security & Secrets**: Never expose API keys, database credentials, or private role keys to the browser.
3. **Auditability**: All critical domain events (offers, orders, quality checks, payments, grievances) generate immutable audit records.
4. **Mobile First & Multilingual**: Defaulting to Marathi (मराठी), Hindi (हिंदी), and English with 360px screen responsiveness.
