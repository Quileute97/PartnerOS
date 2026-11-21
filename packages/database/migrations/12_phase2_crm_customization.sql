-- ==============================================================================
-- PARTNEROS - MIGRATION 12: PHASE 2 - CRM CUSTOMIZATION & WORKFLOWS
-- ==============================================================================

-- 1. Extend crm_field_definitions entity_type check to support lead and product
ALTER TABLE public.crm_field_definitions 
    DROP CONSTRAINT IF EXISTS crm_field_definitions_entity_type_check;

ALTER TABLE public.crm_field_definitions
    ADD CONSTRAINT crm_field_definitions_entity_type_check 
    CHECK (entity_type IN ('contact', 'deal', 'lead', 'product'));

-- 2. Custom Lead Capture & Embedded Forms Builder
CREATE TABLE IF NOT EXISTS public.custom_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields_config JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of field keys & layout
    submit_button_text VARCHAR(100) NOT NULL DEFAULT 'Gửi thông tin',
    success_message TEXT DEFAULT 'Cảm ơn bạn! Thông tin đã được gửi tới chuyên viên tư vấn.',
    redirect_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    submissions_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_tenant_form_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_custom_forms_tenant ON public.custom_forms(tenant_id);

-- 3. Workflow Triggers & Automation Rules
CREATE TABLE IF NOT EXISTS public.workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL, -- e.g. 'lead.created', 'deal.stage_changed', 'commission.approved'
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"stage_id": "won", "min_value": 10000000}
    actions JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"action": "notify_sales", "channel": "in_app"}, {"action": "generate_commission"}]
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workflow_triggers_tenant ON public.workflow_triggers(tenant_id, trigger_event, is_active);

-- 4. Tenant Theme & White-label Branding Configurations
CREATE TABLE IF NOT EXISTS public.tenant_theme_configs (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    primary_color VARCHAR(30) NOT NULL DEFAULT '#4f46e5',
    accent_color VARCHAR(30) NOT NULL DEFAULT '#06b6d4',
    font_family VARCHAR(50) NOT NULL DEFAULT 'Inter, sans-serif',
    border_radius VARCHAR(20) NOT NULL DEFAULT '0.5rem',
    logo_url TEXT,
    banner_url TEXT,
    portal_title VARCHAR(255),
    custom_css TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Row Level Security Policies
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_theme_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public views active forms"
    ON public.custom_forms
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Tenant admins manage custom forms"
    ON public.custom_forms
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Tenant admins manage workflow triggers"
    ON public.workflow_triggers
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Tenant admins manage theme configs"
    ON public.tenant_theme_configs
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );
