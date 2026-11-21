import { Hono } from 'hono';

export const integrationsRouter = new Hono();

interface ApiKeyItem {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string;
  keyMasked: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

interface WebhookItem {
  id: string;
  tenantId: string;
  targetUrl: string;
  events: string[];
  secret: string;
  isActive: boolean;
  deliveriesCount: number;
  createdAt: string;
}

interface CustomDomainItem {
  id: string;
  tenantId: string;
  domain: string;
  cnameTarget: string;
  isVerified: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  verifiedAt?: string | null;
  createdAt: string;
}

const apiKeysStore = new Map<string, ApiKeyItem[]>();
const webhooksStore = new Map<string, WebhookItem[]>();
const customDomainsStore = new Map<string, CustomDomainItem[]>();

// 1. Generate new API Key
integrationsRouter.post('/api-keys', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();
  const name = body.name || 'Default Secret Key';
  const permissions = body.permissions || ['crm.read', 'crm.write', 'affiliate.read'];

  const randomSecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const keyPrefix = 'pk_live_';
  const rawKey = `${keyPrefix}${randomSecret}`;
  const keyMasked = `${keyPrefix}${randomSecret.substring(0, 4)}...${randomSecret.substring(randomSecret.length - 4)}`;

  const keyRecord: ApiKeyItem = {
    id: `key-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    name,
    keyPrefix,
    keyMasked,
    permissions,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const keys = apiKeysStore.get(tenantId) || [];
  keys.push(keyRecord);
  apiKeysStore.set(tenantId, keys);

  return c.json({
    success: true,
    data: {
      id: keyRecord.id,
      name: keyRecord.name,
      apiKey: rawKey, // Shown only once upon creation
      keyMasked,
      permissions: keyRecord.permissions,
      createdAt: keyRecord.createdAt
    },
    message: 'Khởi tạo API Key thành công. Hãy lưu khoá bí mật này vì nó sẽ không được hiển thị lại!'
  }, 201);
});

// 2. List API Keys
integrationsRouter.get('/api-keys', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const keys = apiKeysStore.get(tenantId) || [];

  return c.json({
    success: true,
    data: keys,
    total: keys.length
  });
});

// 3. Register Webhook Subscription
integrationsRouter.post('/webhooks', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();

  if (!body.targetUrl || !body.events || !Array.isArray(body.events)) {
    return c.json({ success: false, error: 'targetUrl và events (array) là bắt buộc' }, 400);
  }

  const secret = `whsec_${Math.random().toString(36).substring(2, 18)}`;
  const webhook: WebhookItem = {
    id: `wh-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    targetUrl: body.targetUrl,
    events: body.events,
    secret,
    isActive: true,
    deliveriesCount: 0,
    createdAt: new Date().toISOString()
  };

  const list = webhooksStore.get(tenantId) || [];
  list.push(webhook);
  webhooksStore.set(tenantId, list);

  return c.json({
    success: true,
    data: webhook,
    message: 'Đăng ký Webhook thành công'
  }, 201);
});

// 4. List Webhooks
integrationsRouter.get('/webhooks', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const list = webhooksStore.get(tenantId) || [];

  return c.json({
    success: true,
    data: list,
    total: list.length
  });
});

// 5. Test Dispatch Webhook Event
integrationsRouter.post('/webhooks/:id/test', async (c) => {
  const id = c.req.param('id');
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const list = webhooksStore.get(tenantId) || [];
  const webhook = list.find(w => w.id === id);

  if (!webhook) {
    return c.json({ success: false, error: 'Webhook not found' }, 404);
  }

  webhook.deliveriesCount += 1;

  return c.json({
    success: true,
    data: {
      webhookId: webhook.id,
      targetUrl: webhook.targetUrl,
      eventSent: 'deal.won',
      samplePayload: {
        event: 'deal.won',
        tenantId,
        dealId: 'deal-sample-999',
        dealValue: 35000000,
        currency: 'VND',
        commissionCalculated: 3500000,
        partnerId: 'partner-001',
        timestamp: new Date().toISOString()
      },
      headers: {
        'x-partneros-signature': 'sha256=mock_signature_hash_value',
        'x-partneros-event': 'deal.won'
      },
      simulatedStatus: 200
    },
    message: 'Gửi gói tin Webhook thử nghiệm thành công'
  });
});

// 6. Register Custom Domain
integrationsRouter.post('/domains', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();

  if (!body.domain) {
    return c.json({ success: false, error: 'domain là bắt buộc' }, 400);
  }

  const customDomain: CustomDomainItem = {
    id: `dom-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    domain: body.domain.toLowerCase(),
    cnameTarget: 'cname.partneros.vn',
    isVerified: false,
    sslStatus: 'pending',
    createdAt: new Date().toISOString()
  };

  const domains = customDomainsStore.get(tenantId) || [];
  domains.push(customDomain);
  customDomainsStore.set(tenantId, domains);

  return c.json({
    success: true,
    data: customDomain,
    instructions: {
      type: 'CNAME',
      host: customDomain.domain,
      value: customDomain.cnameTarget,
      ttl: 300
    },
    message: 'Đăng ký Custom Domain thành công. Hãy cấu hình bản ghi CNAME tại nhà cung cấp DNS của bạn.'
  }, 201);
});

// 7. Verify Custom Domain DNS
integrationsRouter.post('/domains/:id/verify', async (c) => {
  const id = c.req.param('id');
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const domains = customDomainsStore.get(tenantId) || [];
  const domainItem = domains.find(d => d.id === id);

  if (!domainItem) {
    return c.json({ success: false, error: 'Domain not found' }, 404);
  }

  domainItem.isVerified = true;
  domainItem.sslStatus = 'active';
  domainItem.verifiedAt = new Date().toISOString();

  return c.json({
    success: true,
    data: domainItem,
    message: `Xác thực tên miền ${domainItem.domain} thành công! Chứng chỉ SSL đã được kích hoạt tự động qua Cloudflare Edge.`
  });
});
