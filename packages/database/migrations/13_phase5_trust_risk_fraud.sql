-- ==============================================================================
-- PARTNEROS - MIGRATION 13: PHASE 5 - TRUST, RISK & FRAUD ENGINE
-- ==============================================================================

-- 1. Identity & Business Verifications (KYC / KYB)
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('partner', 'business')),
    entity_id UUID NOT NULL,
    id_type VARCHAR(50) NOT NULL CHECK (id_type IN ('cccd', 'passport', 'business_license', 'tax_certificate')),
    id_number VARCHAR(100) NOT NULL,
    document_urls TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_verifications_entity ON public.verifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);

-- 2. Fraud Signals (Anti-Abuse Events)
CREATE TABLE IF NOT EXISTS public.fraud_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    conversion_id UUID REFERENCES public.tracking_conversions(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL 
        CHECK (signal_type IN ('self_referral', 'ip_collision', 'fingerprint_collision', 'velocity_spike', 'disposable_email')),
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_partner ON public.fraud_signals(partner_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_created ON public.fraud_signals(created_at);

-- 3. Fraud Cases (Investigation & Dispute Workflow)
CREATE TABLE IF NOT EXISTS public.fraud_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    conversion_id UUID REFERENCES public.tracking_conversions(id) ON DELETE SET NULL,
    commission_id UUID REFERENCES public.commissions(id) ON DELETE SET NULL,
    risk_score INT NOT NULL DEFAULT 50,
    status VARCHAR(50) NOT NULL DEFAULT 'investigating' 
        CHECK (status IN ('investigating', 'confirmed_fraud', 'cleared', 'appealed')),
    investigation_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fraud_cases_status ON public.fraud_cases(status);
CREATE INDEX IF NOT EXISTS idx_fraud_cases_partner ON public.fraud_cases(partner_id);

-- 4. Enable Row Level Security
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage all risk tables"
    ON public.fraud_cases
    FOR ALL
    USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin');
