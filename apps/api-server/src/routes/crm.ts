import { Hono } from 'hono';
import type { CRMContact, CRMDeal } from '@partner-os/shared-types';

export const crmRouter = new Hono();

// List contacts with dynamic JSONB fields
crmRouter.get('/contacts', async (c) => {
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) {
    return c.json({ error: 'Tenant header required' }, 400);
  }

  // Sample contacts returned
  const contacts: CRMContact[] = [
    {
      id: 'c1',
      tenantId,
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an.nguyen@example.com',
      partnerId: 'partner-001',
      referralCode: 'REF_ANH_TUAN',
      source: 'Affiliate',
      customFields: {
        dental_service_type: 'Trồng răng Implant',
        appointment_date: '2026-11-25 09:30'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return c.json({ success: true, data: contacts });
});

// Create new contact
crmRouter.post('/contacts', async (c) => {
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) {
    return c.json({ error: 'Tenant header required' }, 400);
  }

  const body = await c.req.json<Partial<CRMContact>>();
  const newContact: CRMContact = {
    id: crypto.randomUUID(),
    tenantId,
    name: body.name || 'Khách hàng mới',
    phone: body.phone || '',
    email: body.email || null,
    partnerId: body.partnerId || null,
    referralCode: body.referralCode || null,
    customFields: body.customFields || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return c.json({ success: true, data: newContact }, 201);
});

// Update Deal & trigger Commission State Machine if won
crmRouter.patch('/deals/:dealId/stage', async (c) => {
  const dealId = c.req.param('dealId');
  const { stageId, isWon } = await c.req.json<{ stageId: string; isWon?: boolean }>();

  // If deal moved to won stage: Trigger commission accrual
  return c.json({
    success: true,
    data: {
      dealId,
      stageId,
      status: isWon ? 'won' : 'open',
      commissionTriggered: !!isWon
    }
  });
});
