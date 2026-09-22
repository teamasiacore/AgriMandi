-- ==============================================================================
-- AgriMandi (कृषीसेतू) — Canonical Database Schema & Migrations Reconciliation
-- Migration: 20260922_canonical_schema_reconciliation.sql
-- Task: AG-004 (Fixed for existing tables: ALTER TABLE before INDEX)
-- Target Engine: Supabase Cloud PostgreSQL 15 (Project: lqoychozoysmxibhcmuf)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Patch Existing Tables First (Guarantees columns exist before indexes)
-- ==============================================================================

-- 1.1 Users table patch
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'FARMER',
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE,
ADD COLUMN IF NOT EXISTS district VARCHAR(50) DEFAULT 'Latur',
ADD COLUMN IF NOT EXISTS taluka VARCHAR(50),
ADD COLUMN IF NOT EXISTS village VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_lang VARCHAR(10) DEFAULT 'mr',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.2 Farmer profiles table patch
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    district VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.farmer_profiles 
ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'Maharashtra',
ADD COLUMN IF NOT EXISTS taluka VARCHAR(50),
ADD COLUMN IF NOT EXISTS village VARCHAR(100),
ADD COLUMN IF NOT EXISTS land_size_acres NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS saat_bara_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_crops TEXT[] DEFAULT ARRAY['Soybean'],
ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(30),
ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.3 Buyer profiles table patch
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gstin VARCHAR(15) UNIQUE,
    district VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.buyer_profiles
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS organisation_id TEXT,
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS representative_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS buyer_category VARCHAR(50) DEFAULT 'Processor or mill',
ADD COLUMN IF NOT EXISTS email VARCHAR(150),
ADD COLUMN IF NOT EXISTS pan VARCHAR(10),
ADD COLUMN IF NOT EXISTS license_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS daily_capacity_mt NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS target_crops TEXT[] DEFAULT ARRAY['Soybean'],
ADD COLUMN IF NOT EXISTS operating_districts TEXT[] DEFAULT ARRAY['Latur'],
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.4 Transporter profiles table patch
CREATE TABLE IF NOT EXISTS public.transporter_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity_mt NUMERIC(6,2) NOT NULL,
    base_district VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transporter_profiles
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS base_taluka VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_area TEXT,
ADD COLUMN IF NOT EXISTS per_km_rate NUMERIC(6,2) DEFAULT 4.20,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PROFILE_SUBMITTED',
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS trips_completed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.5 Produce lots table patch
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    crop VARCHAR(50) NOT NULL,
    quantity_qtl NUMERIC(8,2) NOT NULL,
    expected_price_per_qtl NUMERIC(8,2) NOT NULL,
    district VARCHAR(50) NOT NULL,
    farm_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.produce_lots 
ADD COLUMN IF NOT EXISTS farmer_id TEXT,
ADD COLUMN IF NOT EXISTS variety VARCHAR(50) DEFAULT 'FAQ Standard',
ADD COLUMN IF NOT EXISTS moisture_percentage NUMERIC(4,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS quality_grade VARCHAR(50) DEFAULT 'FAQ (Grade A)',
ADD COLUMN IF NOT EXISTS taluka VARCHAR(50),
ADD COLUMN IF NOT EXISTS village VARCHAR(100),
ADD COLUMN IF NOT EXISTS farm_lat NUMERIC(9,6) DEFAULT 18.4088,
ADD COLUMN IF NOT EXISTS farm_lng NUMERIC(9,6) DEFAULT 76.5604,
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'LISTED',
ADD COLUMN IF NOT EXISTS offers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_fpo_bulk BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fpo_id TEXT,
ADD COLUMN IF NOT EXISTS fpo_name TEXT,
ADD COLUMN IF NOT EXISTS pooled_members JSONB,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.6 Offers table patch
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lot_id TEXT NOT NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    offered_price_per_qtl NUMERIC(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS buyer_id TEXT,
ADD COLUMN IF NOT EXISTS quantity_requested_qtl NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_destination TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS valid_hours INT DEFAULT 24,
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.7 Deals table patch (CRITICAL FIX FOR buyer_id / farmer_id / order_status)
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    crop VARCHAR(50) NOT NULL,
    quantity_qtl NUMERIC(8,2) NOT NULL,
    price_per_qtl NUMERIC(8,2) NOT NULL,
    total_deal_value NUMERIC(12,2) NOT NULL,
    buyer_name VARCHAR(150) NOT NULL,
    farmer_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS lot_id TEXT,
ADD COLUMN IF NOT EXISTS offer_id TEXT,
ADD COLUMN IF NOT EXISTS buyer_id TEXT,
ADD COLUMN IF NOT EXISTS farmer_id TEXT,
ADD COLUMN IF NOT EXISTS delivery_destination TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'ORDER_CONFIRMED',
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'PENDING_PICKUP',
ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'SECURED_IN_ESCROW',
ADD COLUMN IF NOT EXISTS transporter_id TEXT,
ADD COLUMN IF NOT EXISTS transporter_name TEXT,
ADD COLUMN IF NOT EXISTS transporter_phone TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS freight_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_fpo_deal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fpo_id TEXT,
ADD COLUMN IF NOT EXISTS fpo_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ==============================================================================
-- 2. New Canonical Tables
-- ==============================================================================

-- 2.1 Organisations Table (FPOs, Mills, Traders, Logistics)
CREATE TABLE IF NOT EXISTS public.organisations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legal_name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(150),
    org_type VARCHAR(50) NOT NULL,
    registration_no VARCHAR(100) UNIQUE,
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10),
    district VARCHAR(50) NOT NULL,
    taluka VARCHAR(50),
    address TEXT,
    verification_status VARCHAR(50) DEFAULT 'DOCUMENTS_PENDING',
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Memberships Table (Multi-User Organisation Roles)
CREATE TABLE IF NOT EXISTS public.memberships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organisation_id TEXT NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    role_in_org VARCHAR(50) DEFAULT 'MEMBER',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, organisation_id)
);

-- 2.3 Verification Cases & Documents
CREATE TABLE IF NOT EXISTS public.verification_cases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT NOT NULL,
    case_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.verification_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT REFERENCES public.verification_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'verification-documents',
    object_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(128),
    uploaded_by TEXT NOT NULL,
    visibility VARCHAR(20) DEFAULT 'PRIVATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Consents Table (DPDP Act Compliance)
CREATE TABLE IF NOT EXISTS public.consents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- 2.5 Reference Masters: Markets & Commodities
CREATE TABLE IF NOT EXISTS public.markets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(50) NOT NULL,
    state VARCHAR(50) DEFAULT 'Maharashtra',
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (name, district, state)
);

CREATE TABLE IF NOT EXISTS public.commodities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) UNIQUE NOT NULL,
    local_name VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Oilseeds',
    standard_unit VARCHAR(20) DEFAULT 'Quintal',
    hsn_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed core commodities
INSERT INTO public.commodities (name, local_name, category)
VALUES 
    ('Soyabean', 'सोयाबीन', 'Oilseeds'),
    ('Cotton', 'कापूस', 'Fibre'),
    ('Onion', 'कांदा', 'Vegetables'),
    ('Gram (Chana)', 'हरभरा (चना)', 'Pulses'),
    ('Arhar (Tur)', 'तूर', 'Pulses'),
    ('Wheat', 'गहू', 'Cereals'),
    ('Maize', 'मका', 'Cereals')
ON CONFLICT (name) DO NOTHING;

-- Seed core markets
INSERT INTO public.markets (name, district, latitude, longitude)
VALUES 
    ('Latur', 'Latur', 18.4088, 76.5604),
    ('Lasalgaon', 'Nashik', 20.1478, 74.2259),
    ('Nashik', 'Nashik', 19.9975, 73.7898),
    ('Solapur', 'Solapur', 17.6599, 75.9064),
    ('Jalna', 'Jalna', 19.8410, 75.8864),
    ('Akola', 'Akola', 20.7002, 77.0082),
    ('Pune', 'Pune', 18.5204, 73.8567)
ON CONFLICT (name, district, state) DO NOTHING;

-- 2.6 Lot Media Table (Images WebP <5MB in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.lot_media (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lot_id TEXT NOT NULL REFERENCES public.produce_lots(id) ON DELETE CASCADE,
    bucket_name VARCHAR(100) DEFAULT 'lot-photos',
    object_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'image/webp',
    size_bytes BIGINT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 Buyer Demand Posts Table
CREATE TABLE IF NOT EXISTS public.buyer_demand_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    buyer_id TEXT NOT NULL,
    commodity VARCHAR(50) NOT NULL,
    variety VARCHAR(50),
    required_quantity_qtl NUMERIC(10,2) NOT NULL,
    target_price_per_qtl NUMERIC(10,2),
    delivery_location TEXT NOT NULL,
    max_distance_km NUMERIC(6,1) DEFAULT 150,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 Versioned Immutable Order Terms
CREATE TABLE IF NOT EXISTS public.order_term_versions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    version_number INT DEFAULT 1 NOT NULL,
    quantity_qtl NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_value NUMERIC(12,2) NOT NULL,
    freight_amount NUMERIC(10,2) DEFAULT 0,
    pickup_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    amendment_reason TEXT,
    approved_by_farmer BOOLEAN DEFAULT TRUE,
    approved_by_buyer BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (order_id, version_number)
);

-- 2.9 Transport Requests & Assignments
CREATE TABLE IF NOT EXISTS public.transport_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    transporter_id TEXT,
    commodity VARCHAR(50) NOT NULL,
    approximate_quantity_qtl NUMERIC(10,2) NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    pickup_window_start TIMESTAMP WITH TIME ZONE,
    pickup_window_end TIMESTAMP WITH TIME ZONE,
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    vehicle_type VARCHAR(50) NOT NULL,
    required_payload_mt NUMERIC(6,2),
    freight_amount NUMERIC(10,2) NOT NULL,
    who_pays_freight VARCHAR(30) DEFAULT 'BUYER',
    status VARCHAR(50) DEFAULT 'REQUESTED',
    decline_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transport_assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL REFERENCES public.transport_requests(id) ON DELETE CASCADE,
    transporter_id TEXT NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 Pickup & Delivery Records
CREATE TABLE IF NOT EXISTS public.pickup_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    gross_weight NUMERIC(10,2) NOT NULL,
    tare_weight NUMERIC(10,2) NOT NULL,
    net_weight NUMERIC(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Quintal',
    pickup_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    weighbridge_slip_path TEXT,
    pickup_photos TEXT[],
    farmer_confirmed BOOLEAN DEFAULT FALSE,
    farmer_confirmed_at TIMESTAMP WITH TIME ZONE,
    transporter_confirmed BOOLEAN DEFAULT FALSE,
    transporter_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.delivery_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    gross_received_weight NUMERIC(10,2) NOT NULL,
    tare_weight NUMERIC(10,2) NOT NULL,
    net_received_weight NUMERIC(10,2) NOT NULL,
    delivery_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    weighbridge_slip_path TEXT,
    unloading_photos TEXT[],
    buyer_confirmed BOOLEAN DEFAULT FALSE,
    buyer_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.11 Quality Assaying & Inspection
CREATE TABLE IF NOT EXISTS public.quality_inspections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    moisture_percentage NUMERIC(5,2) NOT NULL,
    foreign_matter_pct NUMERIC(5,2) DEFAULT 0,
    damaged_grains_pct NUMERIC(5,2) DEFAULT 0,
    impurities_pct NUMERIC(5,2) DEFAULT 0,
    grade_assigned VARCHAR(50) DEFAULT 'FAQ (Grade A)',
    accepted_quantity_qtl NUMERIC(10,2) NOT NULL,
    rejected_quantity_qtl NUMERIC(10,2) DEFAULT 0,
    rejection_reason TEXT,
    quality_deduction_inr NUMERIC(10,2) DEFAULT 0,
    inspection_decision VARCHAR(50) NOT NULL,
    buyer_remarks TEXT,
    inspector_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.12 Payment Events & Financial Ledger
CREATE TABLE IF NOT EXISTS public.payment_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'NEFT_RTGS',
    payment_reference VARCHAR(100),
    proof_document_path TEXT,
    initiated_by TEXT,
    confirmed_by TEXT,
    notes TEXT,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.13 Grievance Redressal
CREATE TABLE IF NOT EXISTS public.grievances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT REFERENCES public.deals(id) ON DELETE SET NULL,
    raised_by_user_id TEXT NOT NULL,
    respondent_user_id TEXT,
    grievance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    evidence_documents TEXT[],
    status VARCHAR(50) DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.14 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'SYSTEM',
    entity_type VARCHAR(50),
    entity_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.15 Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_id TEXT,
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    metadata JSONB,
    request_id TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_events 
ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ==============================================================================
-- 3. Compatibility Views
-- ==============================================================================
CREATE OR REPLACE VIEW public.lots AS SELECT * FROM public.produce_lots;
CREATE OR REPLACE VIEW public.orders AS SELECT * FROM public.deals;

-- ==============================================================================
-- 4. High-Speed Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_farmer_user_id ON public.farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_district ON public.farmer_profiles(district);

CREATE INDEX IF NOT EXISTS idx_buyer_user_id ON public.buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_gstin ON public.buyer_profiles(gstin);
CREATE INDEX IF NOT EXISTS idx_buyer_district ON public.buyer_profiles(district);

CREATE INDEX IF NOT EXISTS idx_transporter_user_id ON public.transporter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transporter_district ON public.transporter_profiles(base_district);

CREATE INDEX IF NOT EXISTS idx_lots_farmer_id ON public.produce_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_lots_crop_district ON public.produce_lots(crop, district);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.produce_lots(status);

CREATE INDEX IF NOT EXISTS idx_offers_lot_id ON public.offers(lot_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

CREATE INDEX IF NOT EXISTS idx_deals_lot_id ON public.deals(lot_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON public.deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_farmer_id ON public.deals(farmer_id);
CREATE INDEX IF NOT EXISTS idx_deals_order_status ON public.deals(order_status);

CREATE INDEX IF NOT EXISTS idx_order_terms_order_id ON public.order_term_versions(order_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_order_id ON public.transport_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_order_id ON public.pickup_records(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_order_id ON public.delivery_records(order_id);
CREATE INDEX IF NOT EXISTS idx_inspection_order_id ON public.quality_inspections(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON public.payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_grievances_order_id ON public.grievances(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_events(entity, entity_id);

-- ==============================================================================
-- 5. Row Level Security & Permissions
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_demand_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_term_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for %s" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow all for %s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role;', tbl);
    END LOOP;
END $$;
