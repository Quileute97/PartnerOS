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
// 4. CRM: Contacts & Leads
// ==========================================
export const createContactSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng tối thiểu 2 ký tự'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng').nullable().optional(),
  address: z.string().optional(),
  branchId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().optional(),
  partnerId: z.string().nullable().optional(),
  referralCode: z.string().optional(),
  customFields: z.record(z.any()).default({})
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = createContactSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng tiềm năng tối thiểu 2 ký tự'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email().nullable().optional(),
  source: z.string().default('direct'),
  branchId: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted']).default('new'),
  score: z.number().int().min(0).max(100).default(50),
  estimatedValue: z.number().nonnegative().default(0),
  assignedTo: z.string().optional(),
  partnerId: z.string().nullable().optional(),
  referralCode: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).default({})
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const convertLeadSchema = z.object({
  createDeal: z.boolean().default(true),
  dealTitle: z.string().optional(),
  dealValue: z.number().nonnegative().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional()
});

export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;

// ==========================================
// 5. CRM: Deals & Pipelines
// ==========================================
export const createDealSchema = z.object({
  contactId: z.string().min(1, 'Contact ID không được để trống'),
  pipelineId: z.string().min(1, 'Pipeline ID không được để trống'),
  stageId: z.string().min(1, 'Stage ID không được để trống'),
  branchId: z.string().optional(),
  title: z.string().min(3, 'Tên cơ hội/hợp đồng không được để trống'),
  value: z.number().nonnegative('Giá trị deal không được âm'),
  currency: z.string().default('VND'),
  partnerId: z.string().nullable().optional(),
  referralCode: z.string().optional(),
  assignedTo: z.string().optional(),
  customFields: z.record(z.any()).default({})
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

// ==========================================
// 6. Products & Services Catalog
// ==========================================
export const createProductSchema = z.object({
  sku: z.string().min(2, 'Mã SKU tối thiểu 2 ký tự').toUpperCase(),
  name: z.string().min(2, 'Tên sản phẩm/dịch vụ tối thiểu 2 ký tự'),
  description: z.string().optional(),
  category: z.string().min(1, 'Danh mục không được để trống'),
  type: z.enum(['product', 'service']).default('service'),
  unitPrice: z.number().positive('Đơn giá phải lớn hơn 0'),
  currency: z.string().default('VND'),
  isCommissionEligible: z.boolean().default(true),
  defaultCommissionRate: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ==========================================
// 7. Transactions & Orders
// ==========================================
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive('Số lượng phải từ 1 trở lên'),
  unitPrice: z.number().nonnegative()
});

export const createTransactionSchema = z.object({
  customerId: z.string().min(1, 'Khách hàng không được để trống'),
  branchId: z.string().optional(),
  dealId: z.string().optional(),
  partnerId: z.string().nullable().optional(),
  referralCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Giao dịch phải có ít nhất 1 sản phẩm/dịch vụ'),
  discount: z.number().nonnegative().default(0),
  currency: z.string().default('VND'),
  paymentMethod: z.string().default('bank_transfer'),
  status: z.enum(['pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded']).default('paid'),
  paymentStatus: z.enum(['unpaid', 'partially_paid', 'paid', 'refunded']).default('paid'),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// ==========================================
// 8. Activities & Notes
// ==========================================
export const createActivitySchema = z.object({
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  leadId: z.string().optional(),
  type: z.enum(['call', 'meeting', 'email', 'note', 'stage_change', 'order_created', 'system']),
  title: z.string().min(2, 'Tiêu đề hoạt động tối thiểu 2 ký tự'),
  description: z.string().default(''),
  metadata: z.record(z.any()).optional()
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

// ==========================================
// 9. Affiliate Campaign Schemas
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

export const updateCampaignPolicySchema = z.object({
  commissionType: z.enum(['percentage', 'fixed_amount']),
  commissionRate: z.number().positive('Tỷ lệ hoa hồng phải lớn hơn 0'),
  cookieWindowDays: z.number().int().min(1, 'Cookie window tối thiểu 1 ngày').default(60),
  minDealValue: z.number().nonnegative().default(0),
  termsAndConditions: z.string().optional()
});

export type UpdateCampaignPolicyInput = z.infer<typeof updateCampaignPolicySchema>;

export const applyCampaignSchema = z.object({
  applicationNote: z.string().optional(),
  policyVersionAgreed: z.number().int().positive().default(1)
});

export type ApplyCampaignInput = z.infer<typeof applyCampaignSchema>;

export const createReferralLinkSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID không được để trống'),
  customSlug: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Mã slug chỉ chứa chữ, số, gạch ngang và gạch dưới').optional(),
  destinationUrl: z.string().url('URL đích không hợp lệ').optional()
});

export type CreateReferralLinkInput = z.infer<typeof createReferralLinkSchema>;

export const trackClickSchema = z.object({
  referralCode: z.string().min(1, 'Mã giới thiệu không được để trống'),
  sessionId: z.string().optional(),
  landingPageUrl: z.string().min(1, 'URL trang đích không được để trống'),
  referrerUrl: z.string().nullable().optional(),
  userAgent: z.string().optional(),
  deviceFingerprint: z.string().optional()
});

export type TrackClickInput = z.infer<typeof trackClickSchema>;

export const trackConversionSchema = z.object({
  referralCode: z.string().optional(),
  sessionId: z.string().optional(),
  tenantId: z.string().optional(),
  tenantSlug: z.string().optional(),
  contactName: z.string().min(2, 'Họ tên khách hàng tối thiểu 2 ký tự'),
  contactPhone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  contactEmail: z.string().email('Email không đúng định dạng').optional(),
  dealValue: z.number().nonnegative().default(0),
  dealTitle: z.string().optional(),
  idempotencyKey: z.string().optional(),
  customFields: z.record(z.any()).optional()
});

export type TrackConversionInput = z.infer<typeof trackConversionSchema>;
