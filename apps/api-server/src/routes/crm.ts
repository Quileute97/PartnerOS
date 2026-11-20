import { Hono } from 'hono';
import { 
  createContactSchema, 
  updateContactSchema,
  createLeadSchema, 
  convertLeadSchema,
  createDealSchema,
  createProductSchema,
  createTransactionSchema,
  createActivitySchema
} from '@partner-os/validation';
import type { 
  CRMContact, 
  CRMLead, 
  CRMDeal, 
  CRMProduct, 
  CRMTransaction, 
  CRMActivity, 
  CRMAuditLog, 
  CRMReportSummary 
} from '@partner-os/shared-types';

export const crmRouter = new Hono();

// In-Memory Database Stores for Multi-Tenant CRM Engine
const contactsStore = new Map<string, CRMContact[]>([
  ['org-smilecare-01', [
    {
      id: 'c-01',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Phạm Minh Đức',
      phone: '0912345678',
      email: 'duc.pham@example.com',
      address: '25 Nguyễn Huệ, Quận 1, TP.HCM',
      partnerId: 'partner-001',
      referralCode: 'REF_TUAN_VIP',
      source: 'Affiliate',
      tags: ['Khách VIP', 'Implant'],
      assignedTo: 'user-sales-1',
      customFields: {
        dental_service_type: 'Trồng răng Implant Straumann',
        appointment_date: '2026-11-25 09:30'
      },
      notesCount: 2,
      activitiesCount: 4,
      dealsCount: 1,
      totalSpent: 35000000,
      createdAt: '2026-11-15T08:00:00Z',
      updatedAt: '2026-11-20T14:15:00Z'
    },
    {
      id: 'c-02',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Vũ Lan Anh',
      phone: '0988765432',
      email: 'lananh.vu@example.com',
      address: '15 Thảo Điền, TP. Thủ Đức',
      partnerId: 'partner-002',
      referralCode: 'REF_THAO_BEAUTY',
      source: 'Affiliate',
      tags: ['Răng sứ'],
      assignedTo: 'user-sales-1',
      customFields: {
        dental_service_type: 'Bọc răng sứ Cercon HT'
      },
      notesCount: 1,
      activitiesCount: 2,
      dealsCount: 1,
      totalSpent: 24000000,
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T11:00:00Z'
    }
  ]]
]);

const leadsStore = new Map<string, CRMLead[]>([
  ['org-smilecare-01', [
    {
      id: 'lead-01',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Hoàng Khánh Linh',
      phone: '0977112233',
      email: 'linh.hoang@example.com',
      source: 'Affiliate Link',
      status: 'contacted',
      score: 80,
      estimatedValue: 40000000,
      assignedTo: 'user-sales-1',
      partnerId: 'partner-001',
      referralCode: 'REF_TUAN_VIP',
      followUpDate: '2026-11-22T14:00:00Z',
      notes: 'Quan tâm niềng răng Invisalign, đã gửi bảng giá chi tiết',
      customFields: { desired_service: 'Niềng răng trong suốt' },
      createdAt: '2026-11-19T09:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z'
    }
  ]]
]);

const productsStore = new Map<string, CRMProduct[]>([
  ['org-smilecare-01', [
    {
      id: 'prod-01',
      tenantId: 'org-smilecare-01',
      sku: 'IMP-STRAUMANN',
      name: 'Cấy ghép Implant Straumann Thụy Sĩ',
      description: 'Trụ Implant cao cấp tích hợp xương nhanh',
      category: 'Cấy ghép Implant',
      type: 'service',
      unitPrice: 35000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 10,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'prod-02',
      tenantId: 'org-smilecare-01',
      sku: 'SU-CERCON-HT',
      name: 'Răng sứ thẩm mỹ Cercon HT Đức',
      description: 'Răng toàn sứ độ bền cao, bảo hành 10 năm',
      category: 'Răng sứ thẩm mỹ',
      type: 'service',
      unitPrice: 6000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 10,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'prod-03',
      tenantId: 'org-smilecare-01',
      sku: 'NIENG-INVISALIGN',
      name: 'Niềng răng máng trong suốt Invisalign',
      description: 'Chỉnh nha thẩm mỹ công nghệ Mỹ',
      category: 'Chỉnh nha - Niềng răng',
      type: 'service',
      unitPrice: 85000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 8,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    }
  ]]
]);

const dealsStore = new Map<string, CRMDeal[]>([
  ['org-smilecare-01', [
    {
      id: 'deal-999',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      contactId: 'c-01',
      contactName: 'Phạm Minh Đức',
      pipelineId: 'pipe-dental',
      stageId: 'stage-won',
      stageName: 'Chốt thành công (Won)',
      title: 'Trồng Implant Straumann - Phạm Minh Đức',
      value: 35000000,
      currency: 'VND',
      status: 'won',
      partnerId: 'partner-001',
      partnerName: 'Nguyễn Văn Tuấn',
      referralCode: 'REF_TUAN_VIP',
      assignedTo: 'user-sales-1',
      customFields: {},
      wonAt: '2026-11-20T14:15:00Z',
      createdAt: '2026-11-15T09:00:00Z',
      updatedAt: '2026-11-20T14:15:00Z'
    }
  ]]
]);

const transactionsStore = new Map<string, CRMTransaction[]>([
  ['org-smilecare-01', [
    {
      id: 'tx-001',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      branchName: 'Trụ sở Quận 1',
      transactionNumber: 'TX-20261120-001',
      customerId: 'c-01',
      customerName: 'Phạm Minh Đức',
      customerPhone: '0912345678',
      dealId: 'deal-999',
      partnerId: 'partner-001',
      partnerName: 'Nguyễn Văn Tuấn',
      referralCode: 'REF_TUAN_VIP',
      items: [
        {
          productId: 'prod-01',
          productName: 'Cấy ghép Implant Straumann Thụy Sĩ',
          sku: 'IMP-STRAUMANN',
          quantity: 1,
          unitPrice: 35000000,
          amount: 35000000
        }
      ],
      subtotal: 35000000,
      discount: 0,
      totalAmount: 35000000,
      currency: 'VND',
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      idempotencyKey: 'idem-tx-001',
      notes: 'Thanh toán đợt 1 cấy trụ',
      createdAt: '2026-11-20T14:30:00Z',
      updatedAt: '2026-11-20T14:30:00Z'
    }
  ]]
]);

const activitiesStore = new Map<string, CRMActivity[]>([
  ['org-smilecare-01', [
    {
      id: 'act-01',
      tenantId: 'org-smilecare-01',
      contactId: 'c-01',
      dealId: 'deal-999',
      type: 'order_created',
      title: 'Tạo đơn hàng & Giao dịch',
      description: 'Giao dịch TX-20261120-001 trị giá 35,000,000 ₫ đã thanh toán thành công',
      performedByUserId: 'user-demo-1',
      performedByUserName: 'Bác Sĩ Nguyễn Văn An',
      createdAt: '2026-11-20T14:30:00Z'
    }
  ]]
]);

const auditLogsStore = new Map<string, CRMAuditLog[]>([]);

// ==========================================
// 1. CUSTOMERS / CONTACTS ENDPOINTS
// ==========================================

// List contacts with search, branch filter, and tag filter
crmRouter.get('/contacts', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const search = c.req.query('search')?.toLowerCase();
  const branchId = c.req.query('branchId');
  const tag = c.req.query('tag');

  let list = contactsStore.get(tenantId) || [];

  if (search) {
    list = list.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.phone.includes(search) ||
      (item.email && item.email.toLowerCase().includes(search))
    );
  }

  if (branchId) {
    list = list.filter(item => item.branchId === branchId);
  }

  if (tag) {
    list = list.filter(item => item.tags?.includes(tag));
  }

  return c.json({ success: true, data: list });
});

// Create new contact with duplicate phone detection
crmRouter.post('/contacts', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const body = await c.req.json();
  const validation = createContactSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu khách hàng không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const existingContacts = contactsStore.get(tenantId) || [];
  
  // Duplicate phone detection
  const duplicate = existingContacts.find(item => item.phone === validation.data.phone);
  if (duplicate) {
    return c.json({
      success: false,
      error: {
        code: 'DUPLICATE_CONTACT',
        message: `Số điện thoại ${validation.data.phone} đã tồn tại trên hệ thống (Khách hàng: ${duplicate.name})`,
        details: { existingContactId: duplicate.id }
      }
    }, 409);
  }

  const contactId = `c_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const newContact: CRMContact = {
    id: contactId,
    tenantId,
    branchId: validation.data.branchId || null,
    name: validation.data.name,
    phone: validation.data.phone,
    email: validation.data.email || null,
    address: validation.data.address || null,
    partnerId: validation.data.partnerId || null,
    referralCode: validation.data.referralCode || null,
    source: validation.data.partnerId ? 'Affiliate' : 'Direct',
    tags: validation.data.tags || [],
    assignedTo: validation.data.assignedTo || userId,
    customFields: validation.data.customFields || {},
    notesCount: 0,
    activitiesCount: 1,
    dealsCount: 0,
    totalSpent: 0,
    createdAt: now,
    updatedAt: now
  };

  existingContacts.unshift(newContact);
  contactsStore.set(tenantId, existingContacts);

  // Log activity
  logActivity(tenantId, {
    contactId,
    type: 'system',
    title: 'Khách hàng mới được khởi tạo',
    description: `Khởi tạo bởi nhân viên ${userId}`,
    performedByUserId: userId,
    performedByUserName: 'Nhân viên hệ thống'
  });

  return c.json({ success: true, data: newContact }, 201);
});

// Get contact details with timeline
crmRouter.get('/contacts/:id', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const contactId = c.req.param('id');
  const contacts = contactsStore.get(tenantId) || [];
  const contact = contacts.find(item => item.id === contactId);

  if (!contact) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông tin khách hàng' } }, 404);
  }

  const activities = (activitiesStore.get(tenantId) || []).filter(a => a.contactId === contactId);
  const deals = (dealsStore.get(tenantId) || []).filter(d => d.contactId === contactId);
  const transactions = (transactionsStore.get(tenantId) || []).filter(t => t.customerId === contactId);

  return c.json({
    success: true,
    data: {
      contact,
      activities,
      deals,
      transactions
    }
  });
});

// Update contact profile & tags
crmRouter.patch('/contacts/:id', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const contactId = c.req.param('id');
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const contacts = contactsStore.get(tenantId) || [];
  const index = contacts.findIndex(item => item.id === contactId);

  if (index === -1) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy khách hàng' } }, 404);
  }

  const body = await c.req.json();
  const validation = updateContactSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu cập nhật không hợp lệ' } }, 400);
  }

  const oldContact = contacts[index];
  const updatedContact = {
    ...oldContact,
    ...validation.data,
    updatedAt: new Date().toISOString()
  };

  contacts[index] = updatedContact;
  contactsStore.set(tenantId, contacts);

  // Audit log
  logAudit(tenantId, {
    entityType: 'contact',
    entityId: contactId,
    action: 'update',
    performedByUserId: userId,
    performedByUserName: 'Nhân viên hệ thống',
    changes: { before: oldContact, after: updatedContact }
  });

  return c.json({ success: true, data: updatedContact });
});

// ==========================================
// 2. LEADS MANAGEMENT & CONVERSION
// ==========================================

// List leads
crmRouter.get('/leads', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const status = c.req.query('status');
  let leads = leadsStore.get(tenantId) || [];

  if (status) {
    leads = leads.filter(l => l.status === status);
  }

  return c.json({ success: true, data: leads });
});

// Create lead
crmRouter.post('/leads', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const body = await c.req.json();
  const validation = createLeadSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu lead không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const leadId = `lead_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const newLead: CRMLead = {
    id: leadId,
    tenantId,
    branchId: validation.data.branchId || null,
    name: validation.data.name,
    phone: validation.data.phone,
    email: validation.data.email || null,
    source: validation.data.source || 'direct',
    status: validation.data.status || 'new',
    score: validation.data.score ?? 50,
    estimatedValue: validation.data.estimatedValue ?? 0,
    assignedTo: validation.data.assignedTo || userId,
    partnerId: validation.data.partnerId || null,
    referralCode: validation.data.referralCode || null,
    followUpDate: validation.data.followUpDate || null,
    notes: validation.data.notes || null,
    customFields: validation.data.customFields || {},
    createdAt: now,
    updatedAt: now
  };

  const leads = leadsStore.get(tenantId) || [];
  leads.unshift(newLead);
  leadsStore.set(tenantId, leads);

  return c.json({ success: true, data: newLead }, 201);
});

// Convert Lead into Customer & Opportunity (Deal)
crmRouter.post('/leads/:id/convert', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const leadId = c.req.param('id');
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const body = await c.req.json();
  const validation = convertLeadSchema.safeParse(body);

  const leads = leadsStore.get(tenantId) || [];
  const leadIndex = leads.findIndex(l => l.id === leadId);

  if (leadIndex === -1) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy lead' } }, 404);
  }

  const lead = leads[leadIndex];
  const now = new Date().toISOString();

  // 1. Create or link Customer
  const contactId = `c_${crypto.randomUUID()}`;
  const newContact: CRMContact = {
    id: contactId,
    tenantId,
    branchId: lead.branchId,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    source: lead.source,
    partnerId: lead.partnerId,
    referralCode: lead.referralCode,
    tags: ['Từ Lead chuyển đổi'],
    assignedTo: lead.assignedTo,
    customFields: lead.customFields,
    notesCount: 0,
    activitiesCount: 1,
    dealsCount: 1,
    totalSpent: 0,
    createdAt: now,
    updatedAt: now
  };

  const contacts = contactsStore.get(tenantId) || [];
  contacts.unshift(newContact);
  contactsStore.set(tenantId, contacts);

  // 2. Create Deal if requested
  let newDeal: CRMDeal | null = null;
  if (validation.success && validation.data.createDeal) {
    const dealId = `deal_${crypto.randomUUID()}`;
    newDeal = {
      id: dealId,
      tenantId,
      branchId: lead.branchId,
      contactId,
      contactName: lead.name,
      pipelineId: validation.data.pipelineId || 'pipe-dental',
      stageId: validation.data.stageId || 'stage-won',
      title: validation.data.dealTitle || `Hợp đồng: ${lead.name}`,
      value: validation.data.dealValue ?? lead.estimatedValue ?? 0,
      currency: 'VND',
      status: 'open',
      partnerId: lead.partnerId,
      referralCode: lead.referralCode,
      assignedTo: lead.assignedTo,
      customFields: {},
      createdAt: now,
      updatedAt: now
    };

    const deals = dealsStore.get(tenantId) || [];
    deals.unshift(newDeal);
    dealsStore.set(tenantId, deals);
  }

  // 3. Mark Lead as converted
  lead.status = 'converted';
  lead.convertedContactId = contactId;
  lead.convertedDealId = newDeal?.id || null;
  lead.updatedAt = now;
  leads[leadIndex] = lead;
  leadsStore.set(tenantId, leads);

  return c.json({
    success: true,
    data: {
      lead,
      contact: newContact,
      deal: newDeal
    }
  });
});

// ==========================================
// 3. PRODUCTS & SERVICES CATALOG
// ==========================================

// List products & services
crmRouter.get('/products', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const products = productsStore.get(tenantId) || [];
  return c.json({ success: true, data: products });
});

// Create product/service
crmRouter.post('/products', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const body = await c.req.json();
  const validation = createProductSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu sản phẩm không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const existingProducts = productsStore.get(tenantId) || [];
  const duplicateSku = existingProducts.find(p => p.sku.toUpperCase() === validation.data.sku.toUpperCase());
  if (duplicateSku) {
    return c.json({
      success: false,
      error: { code: 'DUPLICATE_SKU', message: `Mã SKU ${validation.data.sku} đã tồn tại trong danh mục` }
    }, 409);
  }

  const newProduct: CRMProduct = {
    id: `prod_${crypto.randomUUID()}`,
    tenantId,
    sku: validation.data.sku.toUpperCase(),
    name: validation.data.name,
    description: validation.data.description || null,
    category: validation.data.category,
    type: validation.data.type,
    unitPrice: validation.data.unitPrice,
    currency: validation.data.currency || 'VND',
    isCommissionEligible: validation.data.isCommissionEligible,
    defaultCommissionRate: validation.data.defaultCommissionRate || null,
    isActive: validation.data.isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  existingProducts.unshift(newProduct);
  productsStore.set(tenantId, existingProducts);

  return c.json({ success: true, data: newProduct }, 201);
});

// ==========================================
// 4. DEALS & PIPELINE MANAGEMENT
// ==========================================

// List deals
crmRouter.get('/deals', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const deals = dealsStore.get(tenantId) || [];
  return c.json({ success: true, data: deals });
});

// Create deal
crmRouter.post('/deals', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const body = await c.req.json();
  const validation = createDealSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu Deal không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const newDeal: CRMDeal = {
    id: `deal_${crypto.randomUUID()}`,
    tenantId,
    branchId: validation.data.branchId || null,
    contactId: validation.data.contactId,
    pipelineId: validation.data.pipelineId,
    stageId: validation.data.stageId,
    title: validation.data.title,
    value: validation.data.value,
    currency: validation.data.currency || 'VND',
    status: 'open',
    partnerId: validation.data.partnerId || null,
    referralCode: validation.data.referralCode || null,
    assignedTo: validation.data.assignedTo || null,
    customFields: validation.data.customFields || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const deals = dealsStore.get(tenantId) || [];
  deals.unshift(newDeal);
  dealsStore.set(tenantId, deals);

  return c.json({ success: true, data: newDeal }, 201);
});

// Update deal stage
crmRouter.patch('/deals/:dealId/stage', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const dealId = c.req.param('dealId');
  const { stageId, isWon } = await c.req.json<{ stageId: string; isWon?: boolean }>();

  const deals = dealsStore.get(tenantId) || [];
  const dealIndex = deals.findIndex(d => d.id === dealId);

  if (dealIndex === -1) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy Deal' } }, 404);
  }

  const deal = deals[dealIndex];
  deal.stageId = stageId;
  deal.status = isWon ? 'won' : deal.status;
  if (isWon) {
    deal.wonAt = new Date().toISOString();
  }
  deal.updatedAt = new Date().toISOString();
  deals[dealIndex] = deal;
  dealsStore.set(tenantId, deals);

  return c.json({
    success: true,
    data: {
      deal,
      commissionTriggered: !!isWon
    }
  });
});

// ==========================================
// 5. TRANSACTIONS & SALES ORDERS
// ==========================================

// List transactions
crmRouter.get('/transactions', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const transactions = transactionsStore.get(tenantId) || [];
  return c.json({ success: true, data: transactions });
});

// Create sales transaction
crmRouter.post('/transactions', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const body = await c.req.json();
  const validation = createTransactionSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu giao dịch không hợp lệ', details: validation.error.format() }
    }, 400);
  }

  const transactions = transactionsStore.get(tenantId) || [];

  // Idempotency key check
  if (validation.data.idempotencyKey) {
    const existing = transactions.find(t => t.idempotencyKey === validation.data.idempotencyKey);
    if (existing) {
      return c.json({ success: true, data: existing, idempotentReplay: true });
    }
  }

  // Calculate totals
  const subtotal = validation.data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAmount = Math.max(0, subtotal - (validation.data.discount || 0));

  // Find customer
  const contacts = contactsStore.get(tenantId) || [];
  const customer = contacts.find(c => c.id === validation.data.customerId) || {
    id: validation.data.customerId,
    name: 'Khách hàng giao dịch',
    phone: '0900000000'
  };

  const txId = `tx_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const txNumber = `TX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(transactions.length + 1).padStart(4, '0')}`;

  const newTx: CRMTransaction = {
    id: txId,
    tenantId,
    branchId: validation.data.branchId || null,
    transactionNumber: txNumber,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    dealId: validation.data.dealId || null,
    partnerId: validation.data.partnerId || null,
    referralCode: validation.data.referralCode || null,
    items: validation.data.items.map(i => ({
      ...i,
      amount: i.quantity * i.unitPrice
    })),
    subtotal,
    discount: validation.data.discount || 0,
    totalAmount,
    currency: validation.data.currency || 'VND',
    status: validation.data.status || 'paid',
    paymentStatus: validation.data.paymentStatus || 'paid',
    paymentMethod: validation.data.paymentMethod || 'bank_transfer',
    idempotencyKey: validation.data.idempotencyKey,
    notes: validation.data.notes,
    createdAt: now,
    updatedAt: now
  };

  transactions.unshift(newTx);
  transactionsStore.set(tenantId, transactions);

  // Update customer totalSpent
  const contactIndex = contacts.findIndex(c => c.id === customer.id);
  if (contactIndex !== -1) {
    contacts[contactIndex].totalSpent = (contacts[contactIndex].totalSpent || 0) + totalAmount;
    contactsStore.set(tenantId, contacts);
  }

  // Log activity
  logActivity(tenantId, {
    contactId: customer.id,
    type: 'order_created',
    title: `Giao dịch mới ${txNumber}`,
    description: `Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VND qua ${newTx.paymentMethod}`,
    performedByUserId: userId,
    performedByUserName: 'Nhân viên hệ thống'
  });

  return c.json({ success: true, data: newTx }, 201);
});

// ==========================================
// 6. REPORTS & OVERVIEW METRICS
// ==========================================
crmRouter.get('/reports/overview', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  
  const transactions = transactionsStore.get(tenantId) || [];
  const contacts = contactsStore.get(tenantId) || [];
  const leads = leadsStore.get(tenantId) || [];
  const deals = dealsStore.get(tenantId) || [];

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.paymentStatus === 'paid' ? tx.totalAmount : 0), 0);
  const convertedLeadsCount = leads.filter(l => l.status === 'converted').length;
  const leadConversionRate = leads.length > 0 ? (convertedLeadsCount / leads.length) * 100 : 0;
  const dealsWon = deals.filter(d => d.status === 'won');

  const summary: CRMReportSummary = {
    totalRevenue,
    revenueChangeMonth: 18.4,
    totalCustomers: contacts.length,
    newCustomersWeek: contacts.length,
    activeLeads: leads.filter(l => l.status !== 'converted').length,
    leadConversionRate: Math.round(leadConversionRate * 10) / 10,
    dealsWonCount: dealsWon.length,
    averageDealSize: dealsWon.length > 0 ? totalRevenue / dealsWon.length : 0,
    revenueByBranch: [
      { branchId: 'branch-main', branchName: 'Trụ sở Quận 1', revenue: totalRevenue }
    ],
    topProducts: [
      { productId: 'prod-01', name: 'Cấy ghép Implant Straumann', salesCount: 8, revenue: 280000000 },
      { productId: 'prod-02', name: 'Răng sứ Cercon HT', salesCount: 14, revenue: 84000000 }
    ]
  };

  return c.json({ success: true, data: summary });
});

// ==========================================
// 7. ACTIVITIES & AUDIT LOGS
// ==========================================
crmRouter.get('/activities', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const contactId = c.req.query('contactId');
  let activities = activitiesStore.get(tenantId) || [];

  if (contactId) {
    activities = activities.filter(a => a.contactId === contactId);
  }

  return c.json({ success: true, data: activities });
});

crmRouter.post('/activities', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const body = await c.req.json();
  const validation = createActivitySchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu hoạt động không hợp lệ' } }, 400);
  }

  const activity = logActivity(tenantId, {
    contactId: validation.data.contactId,
    dealId: validation.data.dealId,
    leadId: validation.data.leadId,
    type: validation.data.type,
    title: validation.data.title,
    description: validation.data.description,
    performedByUserId: userId,
    performedByUserName: 'Nhân viên'
  });

  return c.json({ success: true, data: activity }, 201);
});

crmRouter.get('/audit-logs', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'org-smilecare-01';
  const logs = auditLogsStore.get(tenantId) || [];
  return c.json({ success: true, data: logs });
});

// Helper Loggers
function logActivity(tenantId: string, payload: Omit<CRMActivity, 'id' | 'tenantId' | 'createdAt'>): CRMActivity {
  const newActivity: CRMActivity = {
    id: `act_${crypto.randomUUID()}`,
    tenantId,
    ...payload,
    createdAt: new Date().toISOString()
  };

  const list = activitiesStore.get(tenantId) || [];
  list.unshift(newActivity);
  activitiesStore.set(tenantId, list);
  return newActivity;
}

function logAudit(tenantId: string, payload: Omit<CRMAuditLog, 'id' | 'tenantId' | 'createdAt'>): CRMAuditLog {
  const newLog: CRMAuditLog = {
    id: `audit_${crypto.randomUUID()}`,
    tenantId,
    ...payload,
    createdAt: new Date().toISOString()
  };

  const list = auditLogsStore.get(tenantId) || [];
  list.unshift(newLog);
  auditLogsStore.set(tenantId, list);
  return newLog;
}
