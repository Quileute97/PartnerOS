-- ==============================================================================
-- PARTNEROS - MIGRATION 10: PHASE 3 - AFFILIATE MARKETPLACE & ATTRIBUTION ENGINE
-- ==============================================================================

-- 1. Extend affiliate_campaigns with industry, policy versioning, and status
ALTER TABLE public.affiliate_campaigns
    ADD COLUMN IF NOT EXISTS current_policy_version INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'pending_review', 'published', 'paused', 'completed', 'rejected', 'suspended')),
    ADD COLUMN IF NOT EXISTS industry VARCHAR(100) DEFAULT 'General';

-- 2. Campaign Policy Versions (Immutable Audit of Policy Changes)
CREATE TABLE IF NOT EXISTS public.campaign_policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.affiliate_campaigns(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    commission_type commission_type NOT NULL DEFAULT 'percentage',
    commission_rate NUMERIC(15, 2) NOT NULL DEFAULT 10.00,
    cookie_window_days INT NOT NULL DEFAULT 60,
    min_deal_value NUMERIC(15, 2) DEFAULT 0.00,
    terms_and_conditions TEXT,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    effective_to TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_campaign_policy_version UNIQUE (campaign_id, version)
);

CREATE INDEX IF NOT EXISTS idx_campaign_policy_versions_campaign ON public.campaign_policy_versions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_policy_versions_active ON public.campaign_policy_versions(campaign_id, effective_from, effective_to);

-- 3. Extend partner_campaign_registrations with policy version agreement and review notes
ALTER TABLE public.partner_campaign_registrations
    ADD COLUMN IF NOT EXISTS policy_version_agreed INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS application_note TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 4. Attribution Records (Audit Trail for deterministic attribution decisions)
CREATE TABLE IF NOT EXISTS public.attribution_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversion_id UUID REFERENCES public.tracking_conversions(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.affiliate_campaigns(id) ON DELETE SET NULL,
    click_id UUID REFERENCES public.tracking_clicks(id) ON DELETE SET NULL,
    referral_code VARCHAR(50),
    model VARCHAR(50) NOT NULL DEFAULT 'last_click' CHECK (model IN ('last_click', 'first_click', 'linear')),
    decision JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attribution_records_tenant ON public.attribution_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attribution_records_partner ON public.attribution_records(partner_id);
CREATE INDEX IF NOT EXISTS idx_attribution_records_conversion ON public.attribution_records(conversion_id);
CREATE INDEX IF NOT EXISTS idx_attribution_records_deal ON public.attribution_records(deal_id);

-- 5. Row Level Security Policies
ALTER TABLE public.campaign_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_records ENABLE ROW LEVEL SECURITY;

-- Campaign Policy Versions RLS:
-- Public can view active published policies; Tenant members can view their own; Platform admins view all.
CREATE POLICY "Public & Partners view campaign policy versions"
    ON public.campaign_policy_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.affiliate_campaigns ac
            WHERE ac.id = campaign_policy_versions.campaign_id
              AND (ac.is_public_marketplace = TRUE OR ac.tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()))
        )
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Tenant admins manage campaign policy versions"
    ON public.campaign_policy_versions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.affiliate_campaigns ac
            JOIN public.tenant_users tu ON tu.tenant_id = ac.tenant_id
            WHERE ac.id = campaign_policy_versions.campaign_id
              AND tu.user_id = auth.uid()
              AND tu.role IN ('owner', 'admin')
        )
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- Attribution Records RLS:
-- Tenant members can view attributions for their tenant; Partners can view their attributed conversions.
CREATE POLICY "Tenant members view attribution records"
    ON public.attribution_records
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR partner_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );
