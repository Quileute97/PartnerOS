-- ==============================================================================
-- PARTNEROS - MIGRATION 11: PHASE 4 - COMMISSION & FINANCIAL CORE
-- ==============================================================================

-- 1. Payout Requests Table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    bank_name VARCHAR(100) NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_account_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
    transaction_reference VARCHAR(100),
    rejection_reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    CONSTRAINT chk_positive_payout_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_partner ON public.payout_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- 2. Commission Calculation Rules Engine (Dynamic Policy Overrides)
CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.affiliate_campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    priority INT NOT NULL DEFAULT 10,
    rule_type VARCHAR(50) NOT NULL DEFAULT 'standard' 
        CHECK (rule_type IN ('standard', 'tiered_volume', 'product_specific', 'first_time_customer')),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"min_volume": 5, "product_sku": "SKU_IMP_01"}
    commission_type commission_type NOT NULL DEFAULT 'percentage',
    commission_rate NUMERIC(15, 2) NOT NULL,
    hold_period_days INT NOT NULL DEFAULT 14, -- Anti-refund protection window
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_commission_rules_campaign ON public.commission_rules(campaign_id, is_active, priority);

-- 3. Immutability Enforcement Function for Ledger Entries
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'CRITICAL: Sổ cái (Ledger) của PartnerOS là bất biến (Append-Only). Không được phép UPDATE hoặc DELETE!';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_ledger_update ON public.ledger_entries;
CREATE TRIGGER trg_prevent_ledger_update
    BEFORE UPDATE OR DELETE ON public.ledger_entries
    FOR EACH ROW
    EXECUTE FUNCTION prevent_ledger_modification();

-- 4. Enable Row Level Security
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

-- Payout Requests Policies:
CREATE POLICY "Partners view their own payout requests"
    ON public.payout_requests
    FOR SELECT
    USING (
        partner_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Partners submit their own payout requests"
    ON public.payout_requests
    FOR INSERT
    WITH CHECK (partner_id = auth.uid());

-- Commission Rules Policies:
CREATE POLICY "Tenant admins manage commission rules"
    ON public.commission_rules
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );
