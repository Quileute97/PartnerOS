import { Hono } from 'hono';
import { 
  createCustomFieldSchema, 
  createCustomFormSchema, 
  updateThemeConfigSchema 
} from '@partner-os/validation';
import type { CRMFieldDefinition, CRMPipeline, CRMStage } from '@partner-os/shared-types';

export const customizationRouter = new Hono();

// In-Memory Customization Stores (Tenant Isolated)
const customFieldsStore = new Map<string, CRMFieldDefinition[]>([
  ['tenant-dental-01', [
    {
      id: 'f-01',
      tenantId: 'tenant-dental-01',
      entityType: 'contact',
      fieldName: 'dental_service_type',
      label: 'Dịch vụ nha khoa quan tâm',
      fieldType: 'select',
      options: [
        { label: 'Trồng răng Implant', value: 'implant' },
        { label: 'Niềng răng máng trong suốt', value: 'invisalign' },
        { label: 'Bọc răng sứ thẩm mỹ', value: 'veneer' }
      ],
      isRequired: true,
      sortOrder: 1,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'f-02',
      tenantId: 'tenant-dental-01',
      entityType: 'contact',
      fieldName: 'appointment_date',
      label: 'Lịch hẹn khám ưu tiên',
      fieldType: 'datetime',
      isRequired: false,
      sortOrder: 2,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z'
    }
  ]],
  ['tenant-re-02', [
    {
      id: 'f-03',
      tenantId: 'tenant-re-02',
      entityType: 'deal',
      fieldName: 'apartment_type',
      label: 'Loại căn hộ BĐS',
      fieldType: 'select',
      options: [
        { label: 'Studio 35m2', value: 'studio' },
        { label: '2 Phòng ngủ 68m2', value: '2pn' },
        { label: 'Penthouse Panorama', value: 'penthouse' }
      ],
      isRequired: true,
      sortOrder: 1,
      isActive: true,
      createdAt: '2026-11-10T00:00:00Z'
    }
  ]]
]);

const pipelinesStore = new Map<string, CRMPipeline[]>([
  ['tenant-dental-01', [
    {
      id: 'pipe-dental-01',
      tenantId: 'tenant-dental-01',
      name: 'Quy trình Điều trị Nha Khoa Kỹ Thuật Cao',
      isDefault: true,
      createdAt: '2026-11-01T00:00:00Z',
      stages: [
        { id: 'st-01', pipelineId: 'pipe-dental-01', name: 'Tư vấn mới (Lead)', stageOrder: 1, color: '#94a3b8', isWonStage: false, isLostStage: false },
        { id: 'st-02', pipelineId: 'pipe-dental-01', name: 'Đã chụp X-Quang / CT', stageOrder: 2, color: '#38bdf8', isWonStage: false, isLostStage: false },
        { id: 'st-03', pipelineId: 'pipe-dental-01', name: 'Lên phác đồ & Báo giá', stageOrder: 3, color: '#818cf8', isWonStage: false, isLostStage: false },
        { id: 'st-04', pipelineId: 'pipe-dental-01', name: 'Thanh toán & Điều trị', stageOrder: 4, color: '#10b981', isWonStage: true, isLostStage: false },
        { id: 'st-05', pipelineId: 'pipe-dental-01', name: 'Huỷ liệu trình', stageOrder: 5, color: '#f43f5e', isWonStage: false, isLostStage: true }
      ]
    }
  ]]
]);

const themeStore = new Map<string, any>([
  ['tenant-dental-01', {
    tenantId: 'tenant-dental-01',
    primaryColor: '#059669', // Emerald
    accentColor: '#0284c7', // Sky
    portalTitle: 'SmileCare Dental CRM',
    logoUrl: 'https://smilecare.vn/logo.png'
  }],
  ['tenant-re-02', {
    tenantId: 'tenant-re-02',
    primaryColor: '#1e3a8a', // Deep Blue
    accentColor: '#d97706', // Amber
    portalTitle: 'SkyLand Luxury Real Estate',
    logoUrl: 'https://skyland.vn/logo.png'
  }]
]);

const formsStore = new Map<string, any>();

// 1. Get Custom Fields for Tenant
customizationRouter.get('/custom-fields', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const entityType = c.req.query('entityType');

  let fields = customFieldsStore.get(tenantId) || [];
  if (entityType) {
    fields = fields.filter(f => f.entityType === entityType);
  }

  return c.json({
    success: true,
    data: fields,
    tenantId
  });
});

// 2. Define New Custom Field (Tenant Isolated)
customizationRouter.post('/custom-fields', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();
  const parsed = createCustomFieldSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu custom field không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const existing = customFieldsStore.get(tenantId) || [];
  if (existing.some(f => f.entityType === parsed.data.entityType && f.fieldName === parsed.data.fieldName)) {
    return c.json({
      success: false,
      error: `Trường '${parsed.data.fieldName}' đã tồn tại cho đối tượng '${parsed.data.entityType}' trong doanh nghiệp này.`
    }, 409);
  }

  const newField: CRMFieldDefinition = {
    id: `cf-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    entityType: parsed.data.entityType,
    fieldName: parsed.data.fieldName,
    label: parsed.data.label,
    fieldType: parsed.data.fieldType,
    options: parsed.data.options as any,
    isRequired: parsed.data.isRequired,
    defaultValue: parsed.data.defaultValue,
    placeholder: parsed.data.placeholder,
    sortOrder: parsed.data.sortOrder,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  existing.push(newField);
  customFieldsStore.set(tenantId, existing);

  return c.json({
    success: true,
    data: newField,
    message: 'Tạo trường tuỳ biến thành công'
  }, 201);
});

// 3. Get Pipelines & Custom Stages
customizationRouter.get('/pipelines', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const pipelines = pipelinesStore.get(tenantId) || [];

  return c.json({
    success: true,
    data: pipelines
  });
});

// 4. Create Custom Form
customizationRouter.post('/forms', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();
  const parsed = createCustomFormSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu form không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const form = {
    id: `form-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    ...parsed.data,
    submissionsCount: 0,
    createdAt: new Date().toISOString()
  };

  formsStore.set(`${tenantId}_${form.slug}`, form);

  return c.json({
    success: true,
    data: form,
    message: 'Tạo form thu thập lead tuỳ biến thành công'
  }, 201);
});

// 5. Get Tenant Branding / Theme Configuration
customizationRouter.get('/theme', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const theme = themeStore.get(tenantId) || {
    tenantId,
    primaryColor: '#4f46e5',
    accentColor: '#06b6d4',
    portalTitle: 'PartnerOS CRM'
  };

  return c.json({
    success: true,
    data: theme
  });
});

// 6. Update Tenant Branding / Theme
customizationRouter.put('/theme', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();
  const parsed = updateThemeConfigSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Cấu hình giao diện không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const updated = {
    tenantId,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };
  themeStore.set(tenantId, updated);

  return c.json({
    success: true,
    data: updated,
    message: 'Cập nhật nhận diện thương hiệu thành công'
  });
});
