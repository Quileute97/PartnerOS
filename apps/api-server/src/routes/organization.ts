import { Hono } from 'hono';
import { 
  createOrganizationSchema, 
  updateOrganizationSchema, 
  createBranchSchema, 
  inviteMemberSchema 
} from '@partner-os/validation';
import { getRolePermissions } from '@partner-os/permissions';

export const organizationRouter = new Hono();

// Mock store for organizations and branches
const mockOrganizations = new Map<string, any>([
  ['org-smilecare-01', {
    id: 'org-smilecare-01',
    name: 'Nha Khoa SmileCare VN',
    slug: 'smilecare',
    legalName: 'Công Ty Cổ Phần Y Khoa SmileCare',
    taxId: '0314892831',
    status: 'verified',
    industry: 'dental',
    defaultCurrency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    branding: {
      logoUrl: null,
      primaryColor: '#4f46e5',
      accentColor: '#06b6d4'
    },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  }],
  ['org-skyland-02', {
    id: 'org-skyland-02',
    name: 'BĐS SkyLand Group',
    slug: 'skyland',
    legalName: 'Tập Đoàn Địa Ốc SkyLand',
    taxId: '0108928172',
    status: 'verified',
    industry: 'real_estate',
    defaultCurrency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    branding: {
      logoUrl: null,
      primaryColor: '#059669',
      accentColor: '#10b981'
    },
    createdAt: '2026-11-10T00:00:00Z',
    updatedAt: '2026-11-10T00:00:00Z'
  }]
]);

const mockBranches = new Map<string, any[]>([
  ['org-smilecare-01', [
    {
      id: 'branch-main',
      tenantId: 'org-smilecare-01',
      name: 'Trụ sở Quận 1 (Phòng khám chính)',
      code: 'HQ-Q1',
      address: '128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
      phone: '028 3822 9999',
      isHeadquarters: true,
      createdAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'branch-q7',
      tenantId: 'org-smilecare-01',
      name: 'Chi nhánh Quận 7',
      code: 'CN-Q7',
      address: '45 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM',
      phone: '028 5410 8888',
      isHeadquarters: false,
      createdAt: '2026-11-15T00:00:00Z'
    }
  ]]
]);

const mockMembers = new Map<string, any[]>([
  ['org-smilecare-01', [
    {
      id: 'mem-1',
      tenantId: 'org-smilecare-01',
      userId: 'user-demo-1',
      fullName: 'Bác Sĩ Nguyễn Văn An',
      email: 'admin@smilecare.vn',
      role: 'owner',
      permissions: getRolePermissions('owner'),
      branchId: 'branch-main',
      status: 'active',
      joinedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'mem-2',
      tenantId: 'org-smilecare-01',
      userId: 'user-sales-1',
      fullName: 'Lê Thu Trang',
      email: 'trang.le@smilecare.vn',
      role: 'sales_rep',
      permissions: getRolePermissions('sales_rep'),
      branchId: 'branch-main',
      status: 'active',
      joinedAt: '2026-11-05T00:00:00Z'
    }
  ]]
]);

// 1. List user's organizations
organizationRouter.get('/', async (c) => {
  const orgs = Array.from(mockOrganizations.values());
  return c.json({ success: true, data: orgs });
});

// 2. Create new organization
organizationRouter.post('/', async (c) => {
  const body = await c.req.json();
  const validation = createOrganizationSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu tổ chức không hợp lệ',
        details: validation.error.format()
      }
    }, 400);
  }

  const { name, slug, legalName, taxId, industry, defaultCurrency, timezone, branding } = validation.data;

  // Check unique slug
  const slugExists = Array.from(mockOrganizations.values()).some(o => o.slug.toLowerCase() === slug.toLowerCase());
  if (slugExists) {
    return c.json({
      success: false,
      error: {
        code: 'SLUG_TAKEN',
        message: 'Slug đường dẫn này đã được doanh nghiệp khác đăng ký'
      }
    }, 409);
  }

  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const orgId = `org_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const newOrg = {
    id: orgId,
    name,
    slug,
    legalName: legalName || name,
    taxId: taxId || null,
    status: 'draft',
    industry,
    defaultCurrency,
    timezone,
    branding: branding || {
      logoUrl: null,
      primaryColor: '#4f46e5',
      accentColor: '#06b6d4'
    },
    createdAt: now,
    updatedAt: now
  };

  mockOrganizations.set(orgId, newOrg);

  // Automatically create default headquarters branch
  const hqBranch = {
    id: `branch_${crypto.randomUUID()}`,
    tenantId: orgId,
    name: 'Trụ sở chính (Headquarters)',
    code: 'HQ-MAIN',
    address: '',
    phone: '',
    isHeadquarters: true,
    createdAt: now
  };
  mockBranches.set(orgId, [hqBranch]);

  // Automatically add creator as Owner
  const ownerMember = {
    id: `mem_${crypto.randomUUID()}`,
    tenantId: orgId,
    userId,
    fullName: 'Doanh nghiệp Admin',
    email: 'admin@partneros.vn',
    role: 'owner',
    permissions: getRolePermissions('owner'),
    branchId: hqBranch.id,
    status: 'active',
    joinedAt: now
  };
  mockMembers.set(orgId, [ownerMember]);

  return c.json({
    success: true,
    data: {
      organization: newOrg,
      headquartersBranch: hqBranch,
      membership: ownerMember
    }
  }, 201);
});

// 3. Get single organization details
organizationRouter.get('/:id', async (c) => {
  const orgId = c.req.param('id');
  const org = mockOrganizations.get(orgId);

  if (!org) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Không tìm thấy tổ chức doanh nghiệp' }
    }, 404);
  }

  const branches = mockBranches.get(orgId) || [];
  return c.json({ success: true, data: { ...org, branches } });
});

// 4. Update organization details
organizationRouter.patch('/:id', async (c) => {
  const orgId = c.req.param('id');
  const org = mockOrganizations.get(orgId);

  if (!org) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Không tìm thấy tổ chức doanh nghiệp' }
    }, 404);
  }

  const body = await c.req.json();
  const validation = updateOrganizationSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const updatedOrg = {
    ...org,
    ...validation.data,
    updatedAt: new Date().toISOString()
  };

  mockOrganizations.set(orgId, updatedOrg);
  return c.json({ success: true, data: updatedOrg });
});

// 5. List branches
organizationRouter.get('/:id/branches', async (c) => {
  const orgId = c.req.param('id');
  const branches = mockBranches.get(orgId) || [];
  return c.json({ success: true, data: branches });
});

// 6. Create branch
organizationRouter.post('/:id/branches', async (c) => {
  const orgId = c.req.param('id');
  const body = await c.req.json();
  const validation = createBranchSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu chi nhánh không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const newBranch = {
    id: `branch_${crypto.randomUUID()}`,
    tenantId: orgId,
    ...validation.data,
    createdAt: new Date().toISOString()
  };

  const branches = mockBranches.get(orgId) || [];
  branches.push(newBranch);
  mockBranches.set(orgId, branches);

  return c.json({ success: true, data: newBranch }, 201);
});

// 7. List organization members
organizationRouter.get('/:id/members', async (c) => {
  const orgId = c.req.param('id');
  const members = mockMembers.get(orgId) || [];
  return c.json({ success: true, data: members });
});

// 8. Invite member
organizationRouter.post('/:id/members', async (c) => {
  const orgId = c.req.param('id');
  const body = await c.req.json();
  const validation = inviteMemberSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Thông tin mời thành viên không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const { email, role, branchId } = validation.data;
  const newMember = {
    id: `mem_${crypto.randomUUID()}`,
    tenantId: orgId,
    userId: `user_invited_${crypto.randomUUID()}`,
    fullName: email.split('@')[0],
    email,
    role,
    permissions: getRolePermissions(role),
    branchId: branchId || null,
    status: 'invited',
    joinedAt: new Date().toISOString()
  };

  const members = mockMembers.get(orgId) || [];
  members.push(newMember);
  mockMembers.set(orgId, members);

  return c.json({ success: true, data: newMember }, 201);
});
