-- ==============================================================================
-- AgriMandi (कृषीसेतू) — Migration: AG-011 Structured Offers & Negotiation
-- Target Engine: Supabase Cloud PostgreSQL 15 (Project: lqoychozoysmxibhcmuf)
-- Purpose: Expand offers_status_check constraint for COUNTERED and WITHDRAWN
--          and append negotiation columns (counter_price_per_qtl, counter_notes)
-- ==============================================================================

-- 1. Expand status check constraint
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_status_check;

ALTER TABLE public.offers ADD CONSTRAINT offers_status_check 
  CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'COUNTERED', 'WITHDRAWN'));

-- 2. Add negotiation and audit columns
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS counter_price_per_qtl NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS counter_notes TEXT,
ADD COLUMN IF NOT EXISTS countered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
