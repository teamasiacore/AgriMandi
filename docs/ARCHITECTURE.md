# AgriMandi System Architecture

AgriMandi is designed as a secure, distributed agricultural transaction platform tailored for Maharashtra farmers, FPOs, and verified buyers.

---

## 1. Network & Deployment Topology

```
User (Mobile / Web)
       │
       ▼ (HTTPS)
Vercel Edge CDN: https://agrimandi.asiacore.in
React + Vite + TypeScript (apps/web)
       │
       │ Proxied API Requests (JWT Auth)
       ▼
Express API Backend: https://api.agrimandi.asiacore.in
Node.js + Express (apps/api)
       │
       ├──► Supabase PostgreSQL (Prisma ORM, PostGIS)
       ├──► Supabase Auth & Storage
       ├──► Redis (BullMQ Ingestion & Caching)
       ├──► Private FastAPI ML Service (apps/ml-service)
       └──► data.gov.in / AGMARKNET Ingestion Worker
```

---

## 2. Security Boundaries & Ingestion Flow
- **Browser Security**: Frontend only has access to public Vite environment variables (`VITE_API_BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `VITE_MAPTILER_KEY` with referrer restrictions).
- **Backend Isolation**: Secret keys (`DATA_GOV_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) reside solely in the backend.
- **Data Ingestion**: AGMARKNET data is fetched on a periodic schedule, validated, deduplicated, and stored as `MarketObservation` records with explicit timestamps and confidence metrics.
