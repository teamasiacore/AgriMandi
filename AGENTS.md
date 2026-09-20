# AgriMandi (कृषीसेतू) — AI Assistant Operational Guidelines

> **MANDATORY INSTRUCTION FOR ANY AI ASSISTANT ENTERING THIS WORKSPACE:**  
> Before generating code or answering technical questions, you MUST read the 4 foundational architecture documents located in the `brain/` directory:
> 1. [CURRENT_STATE_AND_PROGRESS.md](file:///d:/AgriMandi/brain/CURRENT_STATE_AND_PROGRESS.md) — Exact live runtime state, active ports (:5173, :5000, :8000), installed packages, tested endpoints, and current phase.
> 2. [PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md](file:///d:/AgriMandi/brain/PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md) — Product vision, 4 personas, user stories, and module requirements.
> 3. [TRD_TECHNICAL_REQUIREMENTS_DOCUMENT.md](file:///d:/AgriMandi/brain/TRD_TECHNICAL_REQUIREMENTS_DOCUMENT.md) — Tech stack rationale, data.gov.in Agmarknet API ingestion, Haversine freight math, and XGBoost ML pipeline.
> 4. [BACKEND_SCHEMA_AND_ARCHITECTURE.md](file:///d:/AgriMandi/brain/BACKEND_SCHEMA_AND_ARCHITECTURE.md) — Supabase PostgreSQL database schema, tables, foreign keys, and ER diagrams.
> 5. [MASTER_SYSTEM_RULES_AND_ROADMAP.md](file:///d:/AgriMandi/brain/MASTER_SYSTEM_RULES_AND_ROADMAP.md) — Operating rules, directory maps, and page-by-page roadmap.

---

## The 6 Core Inviolable Developer Rules:
1. **ZERO SIMULATION / ZERO MOCK MATH:** All prices and mandi arrivals MUST come from the real `data.gov.in` feed and Supabase PostgreSQL (`lqoychozoysmxibhcmuf.supabase.co`). Never write fake random formulas (e.g. `* 260 extra profit`).
2. **ZERO HACKATHON / GOVT CLUTTER:** The UI is an authentic commercial B2B platform. Never display "SIH 2026", "Problem Statement ID", or "College Prototype" on the public UI.
3. **UNIFIED BRAND THEME (100% COHESIVE):** The entire website MUST strictly share the exact Landing Page design DNA: `#FAF7F2` warm earth background, `#1B4332` deep forest green, `#FCFAF6` header, `#E5DFD4` sand borders, `#C86432` terracotta accents, official logo PNG (`/images/AgriMandi Logo without background.png`), and `font-heading` Outfit typography. Never use generic slate/emerald templates.
4. **LOCALIZATION POLICY:** ONLY the Landing Page uses dynamic translation dictionaries (`mr.json`, `hi.json`, `en.json`). For all inner portals (Farmer, Buyer, FPO, Admin), simply display the language option selector in the header for visual consistency, but do NOT write translation keys or files. Keep UI text direct, authentic, and clean.
5. **ZERO-KHICHDI MODULAR CODE:** Keep components focused and under 150–200 lines per file.
6. **COMMUNICATION LANGUAGE & MENTORING MODE:** Speak to the user in natural, friendly **Hinglish**. Guide step-by-step, explain What, Why, and How before coding, build one page at a time with user consent, and always keep `brain/CURRENT_STATE_AND_PROGRESS.md` updated.
