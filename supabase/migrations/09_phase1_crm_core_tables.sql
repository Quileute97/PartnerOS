-- ==============================================================================
-- PARTNEROS - MIGRATION 09: PHASE 1 UNIVERSAL CRM ENGINE
-- ==============================================================================

-- 1. Extend crm_contacts with branch, tags, and assigned employee
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_contacts' 
          AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.crm_contacts
        ADD COLUMN branch_id UUID REFERENCES public.organization_branches(id) ON DELETE SET NULL,
        ADD COLUMN tags TEXT[] DEFAULT '{}',
        ADD COLUMN assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Extend crm_deals with branch and assigned employee
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_deals' 
          AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.crm_deals
        ADD COLUMN branch_id UUID REFERENCES public.organization_branches(id) ON DELETE SET NULL,
        ADD COLUMN assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. CRM Leads (Lead Management & Conversion)
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.organization_branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email CITEXT,
    source VARCHAR(100) NOT NULL DEFAULT 'direct',
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
    score INT NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    estimated_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(100),
    follow_up_date TIMESTAMPTZ,
    notes TEXT,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    converted_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    converted_deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON public.crm_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON public.crm_leads(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_crm_leads_custom_fields ON public.crm_leads USING gin (custom_fields);

-- 4. Products & Services Catalog
CREATE TABLE IF NOT EXISTS public.crm_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'service' CHECK (type IN ('product', 'service')),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    is_commission_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    default_commission_rate NUMERIC(15, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_tenant_product_sku UNIQUE (tenant_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_crm_products_tenant ON public.crm_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_products_category ON public.crm_products(tenant_id, category);

-- 5. Transactions & Orders
CREATE TABLE IF NOT EXISTS public.crm_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.organization_branches(id) ON DELETE SET NULL,
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE RESTRICT,
    deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(100),
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    idempotency_key VARCHAR(100) UNIQUE,
    external_ref VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_transactions_tenant ON public.crm_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_transactions_customer ON public.crm_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_transactions_partner ON public.crm_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_crm_transactions_created ON public.crm_transactions(created_at);

-- 6. Transaction Line Items
CREATE TABLE IF NOT EXISTS public.crm_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.crm_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.crm_products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_crm_items_transaction ON public.crm_transaction_items(transaction_id);

-- 7. Customer Timeline & Activities (Calls, Meetings, Notes, Stage Transitions)
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    performed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant ON public.crm_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON public.crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON public.crm_activities(created_at);

-- 8. Immutable CRM Audit Logs
CREATE TABLE IF NOT EXISTS public.crm_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_audit_tenant ON public.crm_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_audit_entity ON public.crm_audit_logs(entity_type, entity_id);

-- 9. Row Level Security Policies
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members access leads" ON public.crm_leads
    FOR ALL USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Tenant members access products" ON public.crm_products
    FOR ALL USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Tenant members access transactions" ON public.crm_transactions
    FOR ALL USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Tenant members access activities" ON public.crm_activities
    FOR ALL USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Tenant members access audit logs" ON public.crm_audit_logs
    FOR SELECT USING (public.fn_is_org_member(tenant_id));
