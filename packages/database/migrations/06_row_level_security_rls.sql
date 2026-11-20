-- ==============================================================================
-- PARTNEROS - MIGRATION 06: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Helper Security Functions
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND platform_role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tenant_member(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = target_tenant_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = target_tenant_id 
          AND user_id = auth.uid() 
          AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on All Tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_campaign_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;

-- 3. Policy Definitions

-- Tenants
CREATE POLICY "Superadmins have full tenant access" ON public.tenants
    FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Tenant members can view their own tenant" ON public.tenants
    FOR SELECT USING (public.is_tenant_member(id));

-- User Profiles
CREATE POLICY "Users can view and update own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Tenant members can view profiles in same tenant" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm1
            JOIN public.tenant_members tm2 ON tm1.tenant_id = tm2.tenant_id
            WHERE tm1.user_id = auth.uid() AND tm2.user_id = public.user_profiles.id
        )
    );

-- CRM Contacts
CREATE POLICY "Tenant members access their contacts" ON public.crm_contacts
    FOR ALL USING (public.is_tenant_member(tenant_id));

-- CRM Deals
CREATE POLICY "Tenant members access their deals" ON public.crm_deals
    FOR ALL USING (public.is_tenant_member(tenant_id));

-- Affiliate Campaigns
CREATE POLICY "Tenant members manage their campaigns" ON public.affiliate_campaigns
    FOR ALL USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Partners can view active public marketplace campaigns" ON public.affiliate_campaigns
    FOR SELECT USING (is_public_marketplace = TRUE AND is_active = TRUE);

-- Referral Links
CREATE POLICY "Tenant members can view tenant referral links" ON public.referral_links
    FOR SELECT USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Partners can view and create their own referral links" ON public.referral_links
    FOR ALL USING (partner_id = auth.uid());

-- Commissions
CREATE POLICY "Tenant members view and manage tenant commissions" ON public.commissions
    FOR ALL USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Partners view their own commissions" ON public.commissions
    FOR SELECT USING (partner_id = auth.uid());

-- Partner Wallets
CREATE POLICY "Partners view own wallet" ON public.partner_wallets
    FOR SELECT USING (partner_id = auth.uid());

-- Ledger Entries (Audit trail - Read only for involved parties)
CREATE POLICY "Tenant members view tenant ledger" ON public.ledger_entries
    FOR SELECT USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Partners view own ledger entries" ON public.ledger_entries
    FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Superadmin full access to ledger" ON public.ledger_entries
    FOR SELECT USING (public.is_platform_admin());
