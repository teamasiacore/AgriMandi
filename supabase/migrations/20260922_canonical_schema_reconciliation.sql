-- ==============================================================================
-- AgriMandi (कृषीसेतू) — Canonical Database Schema & Migrations Reconciliation
-- Migration: 20260922_canonical_schema_reconciliation.sql
-- Task: AG-004
-- Target Engine: Supabase Cloud PostgreSQL 15 (Project: lqoychozoysmxibhcmuf)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core Identity)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'BUYER', 'TRANSPORTER', 'FPO', 'ADMIN', 'SUPERADMIN')),
    name VARCHAR(100) NOT NULL,
    district VARCHAR(50) DEFAULT 'Latur',
    taluka VARCHAR(50),
    village VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'REJECTED', 'SUSPENDED')),
    is_verified BOOLEAN DEFAULT FALSE,
    preferred_lang VARCHAR(10) DEFAULT 'mr' CHECK (preferred_lang IN ('mr', 'hi', 'en')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE,
ADD COLUMN IF NOT EXISTS taluka VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Organisations Table (FPOs, Mills, Traders, Logistics Companies)
CREATE TABLE IF NOT EXISTS public.organisations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legal_name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(150),
    org_type VARCHAR(50) NOT NULL CHECK (org_type IN ('FPO', 'COOPERATIVE', 'PROCESSOR_MILL', 'TRADER', 'INSTITUTIONAL_BUYER', 'LOGISTICS_COMPANY')),
    registration_no VARCHAR(100) UNIQUE,
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10),
    district VARCHAR(50) NOT NULL,
    taluka VARCHAR(50),
    address TEXT,
    verification_status VARCHAR(50) DEFAULT 'DOCUMENTS_PENDING' CHECK (verification_status IN ('NOT_SUBMITTED', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Memberships Table (Multi-User Organisation Roles)
CREATE TABLE IF NOT EXISTS public.memberships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organisation_id TEXT NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    role_in_org VARCHAR(50) DEFAULT 'MEMBER' CHECK (role_in_org IN ('OWNER', 'DIRECTOR', 'MANAGER', 'OPERATOR', 'MEMBER')),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'REVOKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, organisation_id)
);

-- 4. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    state VARCHAR(50) DEFAULT 'Maharashtra',
    district VARCHAR(50) NOT NULL,
    taluka VARCHAR(50),
    village VARCHAR(100),
    land_size_acres NUMERIC(6,2),
    saat_bara_number VARCHAR(100),
    primary_crops TEXT[] DEFAULT ARRAY['Soybean'],
    bank_ifsc VARCHAR(30),
    bank_account VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED' CHECK (verification_status IN ('NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'APPEALED')),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.farmer_profiles 
ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 5. Buyer Profiles Table
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    organisation_id TEXT REFERENCES public.organisations(id) ON DELETE SET NULL,
    company_name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(200),
    representative_name VARCHAR(100),
    buyer_category VARCHAR(50) DEFAULT 'Processor or mill' CHECK (buyer_category IN ('Processor or mill', 'Trader', 'Institutional buyer', 'FPO or cooperative', 'Retail or aggregator', 'Other')),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10),
    license_type VARCHAR(100),
    license_number VARCHAR(100),
    daily_capacity_mt NUMERIC(8,2) DEFAULT 0,
    district VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    target_crops TEXT[] DEFAULT ARRAY['Soybean'],
    operating_districts TEXT[] DEFAULT ARRAY['Latur'],
    status VARCHAR(50) DEFAULT 'UNDER_REVIEW' CHECK (status IN ('DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'VERIFIED', 'VERIFICATION_EXPIRED', 'REJECTED', 'SUSPENDED')),
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.buyer_profiles
ADD COLUMN IF NOT EXISTS organisation_id TEXT,
ADD COLUMN IF NOT EXISTS buyer_category VARCHAR(50) DEFAULT 'Processor or mill',
ADD COLUMN IF NOT EXISTS email VARCHAR(150),
ADD COLUMN IF NOT EXISTS operating_districts TEXT[] DEFAULT ARRAY['Latur'],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 6. Transporter Profiles Table
CREATE TABLE IF NOT EXISTS public.transporter_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity_mt NUMERIC(6,2) NOT NULL,
    base_district VARCHAR(50) NOT NULL,
    base_taluka VARCHAR(50),
    service_area TEXT,
    per_km_rate NUMERIC(6,2) DEFAULT 4.20,
    status VARCHAR(50) DEFAULT 'PROFILE_SUBMITTED' CHECK (status IN ('ACCOUNT_CREATED', 'PHONE_VERIFIED', 'PROFILE_SUBMITTED', 'DOCUMENTS_PENDING', 'ACTIVE_FOR_QUOTES', 'ACTIVE_FOR_BOOKINGS', 'SUSPENDED')),
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 5.0,
    trips_completed INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transporter_profiles
ADD COLUMN IF NOT EXISTS service_area TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PROFILE_SUBMITTED',
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 7. Verification Cases & Documents
CREATE TABLE IF NOT EXISTS public.verification_cases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('FARMER_LAND', 'BUYER_ORG', 'TRANSPORTER_VEHICLE', 'FPO_CIN')),
    entity_id TEXT NOT NULL,
    case_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN ('NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'APPEALED')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.verification_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT REFERENCES public.verification_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('SAAT_BARA_7_12', 'GST_CERTIFICATE', 'APMC_LICENSE', 'PAN_CARD', 'VEHICLE_RC', 'FITNESS_CERTIFICATE', 'WEIGHMENT_SLIP', 'BANK_PASSBOOK', 'PAYMENT_PROOF', 'QUALITY_CERTIFICATE')),
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'verification-documents',
    object_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(128),
    uploaded_by TEXT NOT NULL REFERENCES public.users(id),
    visibility VARCHAR(20) DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'RESTRICTED', 'PUBLIC')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Consents Table (DPDP Act)
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

-- 9. Reference Masters: Markets & Commodities
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

-- 10. Produce Lots Table & Lot Media (Farm-Gate Listings)
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    farmer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    crop VARCHAR(50) NOT NULL,
    variety VARCHAR(50) DEFAULT 'FAQ Standard',
    quantity_qtl NUMERIC(8,2) NOT NULL,
    expected_price_per_qtl NUMERIC(8,2) NOT NULL,
    moisture_percentage NUMERIC(4,2) DEFAULT 10.0,
    quality_grade VARCHAR(50) DEFAULT 'FAQ (Grade A)',
    district VARCHAR(50) NOT NULL,
    taluka VARCHAR(50),
    village VARCHAR(100),
    farm_address TEXT NOT NULL,
    farm_lat NUMERIC(9,6) DEFAULT 18.4088,
    farm_lng NUMERIC(9,6) DEFAULT 76.5604,
    status VARCHAR(30) DEFAULT 'LISTED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'LISTED', 'UNDER_BIDDING', 'DEAL_LOCKED', 'COMPLETED', 'CANCELLED')),
    offers_count INT DEFAULT 0,
    is_fpo_bulk BOOLEAN DEFAULT FALSE,
    fpo_id TEXT,
    fpo_name TEXT,
    pooled_members JSONB,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.lots AS SELECT * FROM public.produce_lots;

CREATE TABLE IF NOT EXISTS public.lot_media (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lot_id TEXT NOT NULL REFERENCES public.produce_lots(id) ON DELETE CASCADE,
    bucket_name VARCHAR(100) DEFAULT 'lot-photos',
    object_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'image/webp',
    size_bytes BIGINT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by TEXT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Buyer Demand Posts
CREATE TABLE IF NOT EXISTS public.buyer_demand_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    buyer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    commodity VARCHAR(50) NOT NULL,
    variety VARCHAR(50),
    required_quantity_qtl NUMERIC(10,2) NOT NULL,
    target_price_per_qtl NUMERIC(10,2),
    delivery_location TEXT NOT NULL,
    max_distance_km NUMERIC(6,1) DEFAULT 150,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Offers / Bids Table
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lot_id TEXT REFERENCES public.produce_lots(id) ON DELETE CASCADE,
    buyer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    offered_price_per_qtl NUMERIC(8,2) NOT NULL,
    quantity_requested_qtl NUMERIC(8,2) NOT NULL,
    delivery_destination TEXT NOT NULL,
    valid_hours INT DEFAULT 24,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Executed Deals & Canonical Orders Table
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lot_id TEXT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    offer_id TEXT REFERENCES public.offers(id) ON DELETE SET NULL,
    crop VARCHAR(50) NOT NULL,
    quantity_qtl NUMERIC(8,2) NOT NULL,
    price_per_qtl NUMERIC(8,2) NOT NULL,
    total_deal_value NUMERIC(12,2) NOT NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    delivery_destination TEXT NOT NULL,
    order_status VARCHAR(50) DEFAULT 'ORDER_CONFIRMED' CHECK (order_status IN (
        'DRAFT', 'PUBLISHED', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'ORDER_CONFIRMED',
        'TRANSPORT_PENDING', 'TRANSPORT_REQUESTED', 'TRANSPORT_ACCEPTED', 'TRANSPORT_DECLINED',
        'TRANSPORT_ASSIGNED', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED',
        'RECEIVED_PENDING_INSPECTION', 'PARTIALLY_ACCEPTED', 'ACCEPTED', 'REJECTED',
        'PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED', 'COMPLETED',
        'DISPUTED', 'CANCELLED'
    )),
    delivery_status VARCHAR(50) DEFAULT 'PENDING_PICKUP',
    escrow_status VARCHAR(50) DEFAULT 'SECURED_IN_ESCROW',
    transporter_id TEXT,
    transporter_name TEXT,
    transporter_phone TEXT,
    vehicle_number TEXT,
    freight_amount NUMERIC(10,2) DEFAULT 0,
    is_fpo_deal BOOLEAN DEFAULT FALSE,
    fpo_id TEXT,
    fpo_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE VIEW public.orders AS SELECT * FROM public.deals;

-- 14. Versioned Immutable Order Terms (Section 7.1)
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
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUPERSEDED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (order_id, version_number)
);

-- 15. Transport Requests & Assignments
CREATE TABLE IF NOT EXISTS public.transport_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    transporter_id TEXT REFERENCES public.transporter_profiles(id),
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
    who_pays_freight VARCHAR(30) DEFAULT 'BUYER' CHECK (who_pays_freight IN ('BUYER', 'FARMER', 'SHARED')),
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'DECLINED', 'ASSIGNED', 'CANCELLED')),
    decline_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transport_assignments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL REFERENCES public.transport_requests(id) ON DELETE CASCADE,
    transporter_id TEXT NOT NULL REFERENCES public.transporter_profiles(id),
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Pickup & Delivery Evidence Records
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

-- 17. Quality Assaying & Inspection
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
    inspection_decision VARCHAR(50) NOT NULL CHECK (inspection_decision IN ('ACCEPT_FULL', 'ACCEPT_PARTIAL', 'ACCEPT_WITH_DEDUCTION', 'REJECT_WITH_REASON', 'DISPUTE_INSPECTION')),
    buyer_remarks TEXT,
    inspector_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Payment Events & Financial Ledger
CREATE TABLE IF NOT EXISTS public.payment_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('PAYMENT_INITIATED', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED', 'PAYMENT_DISPUTED', 'PAYMENT_OVERDUE')),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'NEFT_RTGS' CHECK (payment_method IN ('NEFT_RTGS', 'IMPS', 'UPI', 'ESCROW_PARTNER', 'BANK_TRANSFER')),
    payment_reference VARCHAR(100),
    proof_document_path TEXT,
    initiated_by TEXT REFERENCES public.users(id),
    confirmed_by TEXT REFERENCES public.users(id),
    notes TEXT,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Grievance Redressal
CREATE TABLE IF NOT EXISTS public.grievances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT REFERENCES public.deals(id) ON DELETE SET NULL,
    raised_by_user_id TEXT NOT NULL REFERENCES public.users(id),
    respondent_user_id TEXT REFERENCES public.users(id),
    grievance_type VARCHAR(50) NOT NULL CHECK (grievance_type IN ('QUALITY_DISPUTE', 'WEIGHT_SHORTAGE', 'PAYMENT_DELAY', 'LOGISTICS_DEFAULT', 'NON_DELIVERY', 'OTHER')),
    description TEXT NOT NULL,
    evidence_documents TEXT[],
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLUTION_PROPOSED', 'RESOLVED', 'APPEALED', 'CLOSED')),
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'SYSTEM' CHECK (notification_type IN (
        'NEW_OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'TRANSPORT_REQUEST',
        'TRANSPORT_ACCEPTED', 'PICKUP_RECORDED', 'DELIVERY_RECORDED',
        'INSPECTION_SUBMITTED', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED',
        'GRIEVANCE_UPDATE', 'SYSTEM'
    )),
    entity_type VARCHAR(50),
    entity_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. Audit Events (Security Log)
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

-- 22. Performance Indexes
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

-- 23. Row Level Security (RLS) Grants
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
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow all for ' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow all for ' || tbl, tbl);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role;', tbl);
    END LOOP;
END $$;
