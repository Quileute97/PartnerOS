-- ==============================================================================
-- PARTNEROS - MIGRATION 04: AFFILIATE & TRACKING ENGINE
-- ==============================================================================

-- 1. Affiliate Campaigns
CREATE TABLE IF NOT EXISTS public.affiliate_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT,
    commission_type commission_type NOT NULL DEFAULT 'percentage',
    commission_rate NUMERIC(15, 2) NOT NULL DEFAULT 10.00,
    cookie_window_days INT NOT NULL DEFAULT 60,
    min_deal_value NUMERIC(15, 2) DEFAULT 0.00,
    terms_and_conditions TEXT,
    is_public_marketplace BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_tenant_campaign_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_campaigns_tenant ON public.affiliate_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_campaigns_marketplace ON public.affiliate_campaigns(is_public_marketplace, is_active);

-- 2. Partner Registrations to Campaigns
CREATE TABLE IF NOT EXISTS public.partner_campaign_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.affiliate_campaigns(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_campaign_partner UNIQUE (campaign_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_reg_partner ON public.partner_campaign_registrations(partner_id);

-- 3. Referral Links & QR Codes
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.affiliate_campaigns(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    destination_url TEXT NOT NULL,
    qr_code_url TEXT,
    clicks_count INT NOT NULL DEFAULT 0,
    leads_count INT NOT NULL DEFAULT 0,
    conversions_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_links_partner ON public.referral_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_tenant ON public.referral_links(tenant_id);

-- 4. Tracking Clicks (Append-Only Event Stream)
CREATE TABLE IF NOT EXISTS public.tracking_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    referer TEXT,
    landing_page TEXT NOT NULL,
    device_fingerprint VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tracking_clicks_session ON public.tracking_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_clicks_link ON public.tracking_clicks(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_tracking_clicks_created ON public.tracking_clicks(created_at);

-- 5. Tracking Conversions
CREATE TABLE IF NOT EXISTS public.tracking_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES public.tracking_clicks(id) ON DELETE SET NULL,
    referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
    conversion_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tracking_conversions_deal ON public.tracking_conversions(deal_id);
CREATE INDEX IF NOT EXISTS idx_tracking_conversions_partner ON public.tracking_conversions(partner_id);
