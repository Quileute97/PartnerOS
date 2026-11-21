-- ==============================================================================
-- PARTNEROS - MIGRATION 14: PHASE 6 - INTEGRATIONS, WEBHOOKS & WHITE-LABEL
-- ==============================================================================

-- 1. Tenant API Keys (Secure Developer Access)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL DEFAULT '{"crm.read", "crm.write", "affiliate.read"}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON public.api_keys(tenant_id, is_active);

-- 2. Webhook Subscriptions (Event-driven Integrations)
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- e.g. ['deal.won', 'commission.approved', 'payout.completed']
    secret VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deliveries_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_tenant ON public.webhook_subscriptions(tenant_id, is_active);

-- 3. White-label Custom Domains & DNS Routing
CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    cname_target VARCHAR(255) NOT NULL DEFAULT 'cname.partneros.vn',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ssl_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant ON public.custom_domains(tenant_id);

-- 4. Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admins manage api keys"
    ON public.api_keys
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Tenant admins manage webhooks"
    ON public.webhook_subscriptions
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

CREATE POLICY "Tenant admins manage custom domains"
    ON public.custom_domains
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin'
    );
