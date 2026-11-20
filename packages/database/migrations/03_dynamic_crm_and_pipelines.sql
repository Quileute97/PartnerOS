-- ==============================================================================
-- PARTNEROS - MIGRATION 03: DYNAMIC CRM & PIPELINES
-- ==============================================================================

-- 1. Dynamic CRM Field Definitions (No-code / Industry Specific)
CREATE TABLE IF NOT EXISTS public.crm_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('contact', 'deal')),
    field_name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'text', 'number', 'select', 'multi_select', 'date', 'datetime', 
        'boolean', 'phone', 'email', 'url', 'textarea'
    )),
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value JSONB,
    placeholder VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_tenant_entity_field UNIQUE (tenant_id, entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_crm_field_definitions_tenant ON public.crm_field_definitions(tenant_id, entity_type);

-- 2. CRM Pipelines
CREATE TABLE IF NOT EXISTS public.crm_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_pipelines_tenant ON public.crm_pipelines(tenant_id);

-- 3. CRM Stages (Steps in Pipeline)
CREATE TABLE IF NOT EXISTS public.crm_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stage_order INT NOT NULL DEFAULT 0,
    color VARCHAR(30) DEFAULT '#4f46e5',
    is_won_stage BOOLEAN NOT NULL DEFAULT FALSE,
    is_lost_stage BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_stages_pipeline ON public.crm_stages(pipeline_id);

-- 4. CRM Contacts (Leads / Customers)
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email CITEXT,
    address TEXT,
    source VARCHAR(100) DEFAULT 'direct',
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_tenant ON public.crm_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_partner ON public.crm_contacts(partner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON public.crm_contacts(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_custom_fields ON public.crm_contacts USING gin (custom_fields);

-- 5. CRM Deals (Sales Opportunities & Transactions)
CREATE TABLE IF NOT EXISTS public.crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE RESTRICT,
    stage_id UUID NOT NULL REFERENCES public.crm_stages(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status deal_status NOT NULL DEFAULT 'open',
    partner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(100),
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    won_at TIMESTAMPTZ,
    lost_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_tenant ON public.crm_deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_partner ON public.crm_deals(partner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_custom_fields ON public.crm_deals USING gin (custom_fields);
