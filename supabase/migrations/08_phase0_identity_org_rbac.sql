-- ==============================================================================
-- PARTNEROS - MIGRATION 08: PHASE 0 IDENTITY, ORGANIZATION & RBAC
-- ==============================================================================

-- 1. Organization Branches
CREATE TABLE IF NOT EXISTS public.organization_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    is_headquarters BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_tenant_branch_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_org_branches_tenant ON public.organization_branches(tenant_id);

-- 2. Organization Custom Domains
CREATE TABLE IF NOT EXISTS public.organization_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(100),
    ssl_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_org_domains_tenant ON public.organization_domains(tenant_id);

-- 3. User Sessions (Active Sessions & Revocation)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);

-- 4. User Security Audit Events
CREATE TABLE IF NOT EXISTS public.user_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_security_events_user ON public.user_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_events_created ON public.user_security_events(created_at);

-- 5. Granular RBAC Permissions & System Roles
CREATE TABLE IF NOT EXISTS public.permissions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 6. Enhance Tenant Memberships with Branch and Status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenant_members' 
          AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.tenant_members
        ADD COLUMN branch_id UUID REFERENCES public.organization_branches(id) ON DELETE SET NULL,
        ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended'));
    END IF;
END $$;

-- 7. Seed System Roles & Initial Permissions
INSERT INTO public.roles (id, name, description) VALUES
    ('owner', 'Chủ Doanh nghiệp', 'Toàn quyền quản trị tổ chức, tài chính và nhân sự'),
    ('admin', 'Quản trị viên', 'Quản lý vận hành CRM, CTV và cấu hình tổ chức'),
    ('branch_manager', 'Giám đốc Chi nhánh', 'Quản lý khách hàng, nhân viên và giao dịch chi nhánh'),
    ('sales_rep', 'Nhân viên Kinh doanh', 'Quản lý khách hàng và cơ hội bán hàng được phân công'),
    ('accountant', 'Kế toán Đối soát', 'Xem và duyệt hoa hồng, lập kỳ đối soát tài chính'),
    ('support', 'Chăm sóc Khách hàng', 'Xem thông tin khách hàng và ghi nhận phản hồi'),
    ('member', 'Thành viên cơ bản', 'Truy cập giới hạn các tính năng chung')
ON CONFLICT (id) DO NOTHING;

-- Seed Core Permissions
INSERT INTO public.permissions (id, name, module, description) VALUES
    ('org.view', 'Xem thông tin tổ chức', 'organization', 'Xem hồ sơ và chi nhánh của tổ chức'),
    ('org.update', 'Cập nhật thông tin tổ chức', 'organization', 'Sửa tên, logo và thông tin liên hệ'),
    ('org.settings.manage', 'Cấu hình tổ chức', 'organization', 'Cấu hình múi giờ, tiền tệ và quy định'),
    ('org.branches.manage', 'Quản lý chi nhánh', 'organization', 'Thêm, sửa, xóa các chi nhánh'),
    ('org.members.view', 'Xem danh sách nhân viên', 'members', 'Xem danh sách thành viên trong tổ chức'),
    ('org.members.invite', 'Mời nhân viên', 'members', 'Gửi lời mời tham gia tổ chức'),
    ('org.members.update', 'Phân quyền nhân viên', 'members', 'Cập nhật vai trò và chi nhánh cho nhân sự'),
    ('crm.contacts.read', 'Xem danh bạ khách hàng', 'crm', 'Xem danh sách và chi tiết khách hàng'),
    ('crm.contacts.write', 'Thêm / sửa khách hàng', 'crm', 'Tạo mới hoặc cập nhật thông tin khách hàng'),
    ('crm.deals.read', 'Xem giao dịch / deal', 'crm', 'Xem pipeline và cơ hội bán hàng'),
    ('crm.deals.write', 'Cập nhật giao dịch', 'crm', 'Tạo deal mới hoặc chuyển trạng thái'),
    ('affiliate.campaigns.view', 'Xem chiến dịch CTV', 'affiliate', 'Xem danh sách chiến dịch hoa hồng'),
    ('affiliate.campaigns.manage', 'Quản trị chiến dịch', 'affiliate', 'Tạo, sửa, tạm dừng chiến dịch CTV'),
    ('finance.commissions.view', 'Xem hoa hồng', 'finance', 'Xem danh sách hoa hồng phát sinh'),
    ('finance.commissions.approve', 'Phê duyệt hoa hồng', 'finance', 'Xác nhận duyệt hoa hồng vào sổ cái'),
    ('finance.settlements.create', 'Lập kỳ đối soát', 'finance', 'Tạo đợt chi trả đối soát hoa hồng')
ON CONFLICT (id) DO NOTHING;

-- 8. Enhanced RLS Helper Functions
CREATE OR REPLACE FUNCTION public.fn_is_org_member(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = target_tenant_id 
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_has_org_permission(target_tenant_id UUID, required_permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_role tenant_member_role;
    v_custom_permissions JSONB;
BEGIN
    -- Check direct membership
    SELECT role, permissions INTO v_role, v_custom_permissions
    FROM public.tenant_members
    WHERE tenant_id = target_tenant_id 
      AND user_id = auth.uid()
      AND status = 'active';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Owners have all tenant permissions automatically
    IF v_role = 'owner' THEN
        RETURN TRUE;
    END IF;

    -- Check role_permissions table
    IF EXISTS (
        SELECT 1 FROM public.role_permissions
        WHERE role_id = v_role::text AND permission_id = required_permission
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check custom permissions array on membership
    IF v_custom_permissions ? required_permission THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enable RLS on newly created tables
ALTER TABLE public.organization_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view branches" ON public.organization_branches
    FOR SELECT USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Org admins can manage branches" ON public.organization_branches
    FOR ALL USING (public.is_tenant_admin(tenant_id));

CREATE POLICY "Org members can view domains" ON public.organization_domains
    FOR SELECT USING (public.fn_is_org_member(tenant_id));

CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own security events" ON public.user_security_events
    FOR SELECT USING (user_id = auth.uid());
