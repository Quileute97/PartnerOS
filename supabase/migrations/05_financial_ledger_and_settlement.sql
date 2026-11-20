-- ==============================================================================
-- PARTNEROS - MIGRATION 05: FINANCIAL LEDGER & SETTLEMENT
-- ==============================================================================

-- 1. Commission Records
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    campaign_id UUID NOT NULL REFERENCES public.affiliate_campaigns(id) ON DELETE RESTRICT,
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE RESTRICT,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    deal_value NUMERIC(15, 2) NOT NULL,
    rate_snapshot NUMERIC(15, 2) NOT NULL,
    commission_type commission_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status commission_status NOT NULL DEFAULT 'pending',
    hold_until TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_deal_commission UNIQUE (deal_id)
);

CREATE INDEX IF NOT EXISTS idx_commissions_tenant ON public.commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON public.commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

-- 2. Partner Wallets (Aggregated Real-time Balances)
CREATE TABLE IF NOT EXISTS public.partner_wallets (
    partner_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    pending_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    approved_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    settled_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Immutable Double-Entry Ledger (Audit Trail)
-- Rule: Entries in this table CANNOT be updated or deleted. Only compensating entries are allowed.
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_group_id UUID NOT NULL, -- Groups balancing Debit and Credit rows
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    account_type ledger_account_type NOT NULL,
    debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_positive_amounts CHECK (debit >= 0 AND credit >= 0),
    CONSTRAINT chk_either_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_ledger_group ON public.ledger_entries(transaction_group_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON public.ledger_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_partner ON public.ledger_entries(partner_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON public.ledger_entries(reference_type, reference_id);

-- 4. Settlement Batches (Period Reconciliation)
CREATE TABLE IF NOT EXISTS public.settlement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    platform_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_payout_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    partners_count INT NOT NULL DEFAULT 0,
    status settlement_status NOT NULL DEFAULT 'draft',
    note TEXT,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_settlement_batches_tenant ON public.settlement_batches(tenant_id);

-- 5. Settlement Items (Per Partner line item in Batch)
CREATE TABLE IF NOT EXISTS public.settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.settlement_batches(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    commission_ids UUID[] NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    payment_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_settlement_items_batch ON public.settlement_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_partner ON public.settlement_items(partner_id);
