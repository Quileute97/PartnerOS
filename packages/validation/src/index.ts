import { z } from 'zod';

// ==========================================
// 1. Auth Schemas
// ==========================================
export const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
  platformRole: z.enum(['partner', 'business_user', 'hybrid']).default('partner')
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
});

export type LoginInput = z.infer<typeof loginSchema>;

// ==========================================
// 2. Organization Schemas
// ==========================================
export const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Tên doanh nghiệp tối thiểu 3 ký tự'),
  slug: z.string().min(3, 'Slug tối thiểu 3 ký tự').regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().default('general'),
  defaultCurrency: z.string().default('VND'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  branding: z.object({
    logoUrl: z.string().url().nullable().optional(),
    primaryColor: z.string().default('#4f46e5'),
    accentColor: z.string().default('#06b6d4')
  }).optional()
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const createBranchSchema = z.object({
  name: z.string().min(2, 'Tên chi nhánh không được để trống'),
  code: z.string().min(2, 'Mã chi nhánh tối thiểu 2 ký tự').toUpperCase(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isHeadquarters: z.boolean().default(false)
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

// ==========================================
// 3. Membership & RBAC Schemas
// ==========================================
export const inviteMemberSchema = z.object({
  email: z.string().email('Email người được mời không đúng định dạng'),
  role: z.enum(['owner', 'admin', 'branch_manager', 'sales_rep', 'accountant', 'support', 'member']),
  branchId: z.string().optional(),
  customPermissions: z.array(z.string()).optional()
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'branch_manager', 'sales_rep', 'accountant', 'support', 'member']),
  branchId: z.string().nullable().optional(),
  status: z.enum(['active', 'invited', 'suspended']).optional()
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

// ==========================================
// 4. CRM Schemas
// ==========================================
export const createContactSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng tối thiểu 2 ký tự'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email().nullable().optional(),
  address: z.string().optional(),
  partnerId: z.string().uuid().nullable().optional(),
  referralCode: z.string().optional(),
  customFields: z.record(z.any()).default({})
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const createDealSchema = z.object({
  contactId: z.string().uuid('Contact ID không hợp lệ'),
  pipelineId: z.string().uuid('Pipeline ID không hợp lệ'),
  stageId: z.string().uuid('Stage ID không hợp lệ'),
  title: z.string().min(3, 'Tên cơ hội/hợp đồng không được để trống'),
  value: z.number().nonnegative('Giá trị deal không được âm'),
  currency: z.string().default('VND'),
  partnerId: z.string().uuid().nullable().optional(),
  referralCode: z.string().optional(),
  customFields: z.record(z.any()).default({})
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

// ==========================================
// 5. Affiliate Campaign Schemas
// ==========================================
export const createCampaignSchema = z.object({
  title: z.string().min(5, 'Tiêu đề chiến dịch tối thiểu 5 ký tự'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  commissionType: z.enum(['percentage', 'fixed_amount']),
  commissionRate: z.number().positive('Tỷ lệ hoa hồng phải lớn hơn 0'),
  cookieWindowDays: z.number().int().min(1).default(60),
  minDealValue: z.number().nonnegative().default(0),
  isPublicMarketplace: z.boolean().default(true)
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
