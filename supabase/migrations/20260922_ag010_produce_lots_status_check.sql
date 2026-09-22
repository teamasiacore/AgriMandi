-- ==============================================================================
-- AgriMandi (कृषीसेतू) — Migration: AG-010 Produce Lots Status Expansion
-- Target Engine: Supabase Cloud PostgreSQL 15 (Project: lqoychozoysmxibhcmuf)
-- Purpose: Expand produce_lots status check constraint to include 'DRAFT' and 'CANCELLED'
-- ==============================================================================

ALTER TABLE public.produce_lots DROP CONSTRAINT IF EXISTS produce_lots_status_check;

ALTER TABLE public.produce_lots ADD CONSTRAINT produce_lots_status_check 
  CHECK (status IN ('DRAFT', 'LISTED', 'DEAL_LOCKED', 'CANCELLED', 'CLOSED', 'COMPLETED'));

-- Also append cancellation_reason column if not exists
ALTER TABLE public.produce_lots 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
