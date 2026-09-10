-- ==========================================================
-- AgriMandi (B2B Agricultural Marketplace) - Supabase Schema
-- Target Engine: Supabase PostgreSQL 15
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/eizzzlnlcdfuylnojijn/sql
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'BUYER', 'ADMIN', 'SUPERADMIN')),
    name VARCHAR(100) NOT NULL,
    district VARCHAR(50) DEFAULT 'Latur',
    village VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'REJECTED', 'SUSPENDED')),
    is_verified BOOLEAN DEFAULT FALSE,
    preferred_lang VARCHAR(5) DEFAULT 'mr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    state VARCHAR(50) DEFAULT 'Maharashtra',
    district VARCHAR(50) NOT NULL,
    taluka VARCHAR(50),
    village VARCHAR(100),
    land_size_acres NUMERIC(6,2),
    saat_bara_number VARCHAR(100), -- ७/१२ गट / सर्व्हे नंबर
    primary_crops TEXT[] DEFAULT ARRAY['Soybean'],
    bank_ifsc VARCHAR(30),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buyer Profiles Table
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(200),
    representative_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    gstin VARCHAR(15) UNIQUE NOT NULL,
    pan VARCHAR(10),
    license_type VARCHAR(100) NOT NULL, -- 'Oil Mill Direct Procurement', 'Dal Mill Processor', etc.
    license_number VARCHAR(100),
    daily_capacity_mt NUMERIC(8,2) DEFAULT 0,
    district VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    target_crops TEXT[] DEFAULT ARRAY['Soybean'],
    status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Produce Lots Table (Farm-Gate Listings)
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    crop VARCHAR(50) NOT NULL,
    variety VARCHAR(50) DEFAULT 'FAQ Standard',
    quantity_qtl NUMERIC(8,2) NOT NULL,
    expected_price_per_qtl NUMERIC(8,2) NOT NULL,
    moisture_percentage NUMERIC(4,2) DEFAULT 10.0,
    quality_grade VARCHAR(50) DEFAULT 'FAQ (Grade A)',
    district VARCHAR(50) NOT NULL,
    farm_address TEXT NOT NULL,
    farm_lat NUMERIC(9,6) DEFAULT 18.4088,
    farm_lng NUMERIC(9,6) DEFAULT 76.5604,
    status VARCHAR(30) DEFAULT 'LISTED' CHECK (status IN ('LISTED', 'UNDER_BIDDING', 'DEAL_LOCKED', 'COMPLETED', 'CANCELLED')),
    offers_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Offers / Bids Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.produce_lots(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    offered_price_per_qtl NUMERIC(8,2) NOT NULL,
    quantity_requested_qtl NUMERIC(8,2) NOT NULL,
    delivery_destination TEXT NOT NULL,
    valid_hours INT DEFAULT 24,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Executed Deals & Escrow Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    crop VARCHAR(50) NOT NULL,
    quantity_qtl NUMERIC(8,2) NOT NULL,
    price_per_qtl NUMERIC(8,2) NOT NULL,
    total_deal_value NUMERIC(12,2) NOT NULL,
    buyer_name VARCHAR(150) NOT NULL,
    farmer_name VARCHAR(100) NOT NULL,
    delivery_destination TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'PENDING_PICKUP',
    escrow_status VARCHAR(50) DEFAULT 'SECURED_IN_ESCROW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Mandi Prices Historical Feed Table
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id SERIAL PRIMARY KEY,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    market VARCHAR(100) NOT NULL,
    commodity VARCHAR(50) NOT NULL,
    variety VARCHAR(50) DEFAULT 'FAQ',
    grade VARCHAR(50) DEFAULT 'Local',
    arrival_date VARCHAR(20) NOT NULL,
    min_price NUMERIC NOT NULL,
    max_price NUMERIC NOT NULL,
    modal_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_mandi_commodity_date UNIQUE (market, commodity, arrival_date)
);

-- Disable strict RLS or grant public anon read/write for MVP development
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write farmer_profiles" ON public.farmer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write buyer_profiles" ON public.buyer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write produce_lots" ON public.produce_lots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write mandi_prices" ON public.mandi_prices FOR ALL USING (true) WITH CHECK (true);
