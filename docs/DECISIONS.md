# Architectural Decision Records (ADR) & Assumptions

This log tracks all architectural choices, assumptions, and risk mitigations for AgriMandi Maharashtra.

---

## ADR-001: Monorepo Architecture with pnpm Workspaces
- **Date**: 2026-09-18
- **Decision**: Adopt a pnpm monorepo containing `apps/web` (React/Vite), `apps/api` (Express/TypeScript), `apps/ml-service` (FastAPI), `packages/shared-types`, and `packages/validation`.
- **Rationale**: Keeps domain models, validation schemas, and API contracts strongly typed across client and server while maintaining strict physical separation of secrets and responsibilities.

---

## ADR-002: Separation of External Market Feeds from Transaction Records
- **Date**: 2026-09-18
- **Decision**: Ingest government feeds (data.gov.in / AGMARKNET resource `9ef84268-d588-465a-a308-a864a43d0070`) exclusively through the backend into `MarketObservation`.
- **Rationale**:
  1. Protects the data.gov.in API key from exposure in the browser.
  2. Ensures resilient caching: external feed downtime does not degrade marketplace operations.
  3. Clearly separates indicative reference data from verified buyer offers and accepted legal transactions.

---

## ADR-003: Strict Environment Validation at Startup
- **Date**: 2026-09-18
- **Decision**: Use Zod schemas in `apps/api` to validate all configuration at server startup.
- **Rationale**: Fails fast with clear, descriptive errors rather than running with undefined variables or silent security regressions.

---

## ADR-004: Backend Consolidation — apps/api as the Canonical Backend
- **Date**: 2026-09-18
- **Decision**: Designate `apps/api` (Node.js + Express + TypeScript) as the sole canonical backend API service. The legacy `backend/` directory is retained read-only during migration and will be deprecated once all unique route handlers are confirmed in `apps/api`.
- **Rationale**: TypeScript typing across shared packages, unified middleware, strict OpenAPI contract adherence, and isolation from client-side bundles.

---

## ADR-005: Prisma as Single Canonical Database Schema Owner
- **Date**: 2026-09-18
- **Decision**: Maintain `prisma/schema.prisma` as the sole canonical owner of the database schema. Manual SQL scripts are reserved strictly for inspection and database extension provisioning.
- **Rationale**: Prevents schema drift, ensures automated reproducible migrations for fresh developer onboarding and production deployment, and enables type-safe database queries.
