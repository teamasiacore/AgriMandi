-- ==============================================================================
-- Migration: AG-012 Digital Contract Generation & Escrow Locking Engine
-- Date: 2026-09-22
-- Description:
--   1. Adds contract_number, contract_hash, escrow_txn_ref, escrow_locked_at,
--      escrow_amount, and contract_terms to public.deals.
--   2. Ensures deals_escrow_status_check constraint allows standard escrow states.
--   3. Sets up index on contract_number and escrow_txn_ref for rapid lookups.
-- ==============================================================================

-- 1. Ensure required columns exist on public.deals
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS contract_hash TEXT,
ADD COLUMN IF NOT EXISTS escrow_txn_ref TEXT,
ADD COLUMN IF NOT EXISTS escrow_locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS contract_terms JSONB;

-- 2. Update escrow_status check constraint safely
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'deals_escrow_status_check' 
          AND table_name = 'deals'
    ) THEN
        ALTER TABLE public.deals DROP CONSTRAINT deals_escrow_status_check;
    END IF;
END $$;

ALTER TABLE public.deals
ADD CONSTRAINT deals_escrow_status_check
CHECK (escrow_status IN (
    'PENDING_DEPOSIT',
    'SECURED_IN_ESCROW',
    'QUALITY_HOLD',
    'READY_FOR_SETTLEMENT',
    'SETTLED',
    'REFUNDED'
));

-- 3. Create indices for fast contract & escrow queries
CREATE INDEX IF NOT EXISTS idx_deals_contract_number ON public.deals(contract_number);
CREATE INDEX IF NOT EXISTS idx_deals_escrow_txn_ref ON public.deals(escrow_txn_ref);
CREATE INDEX IF NOT EXISTS idx_deals_escrow_status ON public.deals(escrow_status);
