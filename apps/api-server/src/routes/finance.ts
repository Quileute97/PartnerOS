import { Hono } from 'hono';
import type { Commission, LedgerEntry, SettlementBatch } from '@partner-os/shared-types';

export const financeRouter = new Hono();

// List commissions for a tenant
financeRouter.get('/commissions', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';

  const commissions: Commission[] = [
    {
      id: 'comm-101',
      tenantId,
      partnerId: 'partner-001',
      campaignId: 'camp-1',
      dealId: 'deal-999',
      dealValue: 35000000,
      rateSnapshot: 10,
      commissionType: 'percentage',
      amount: 3500000,
      status: 'pending',
      holdUntil: '2026-12-01T00:00:00Z',
      createdAt: '2026-11-20T10:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z'
    }
  ];

  return c.json({ success: true, data: commissions });
});

// Approve commission (moves status: pending -> approved, posts to Ledger)
financeRouter.post('/commissions/:id/approve', async (c) => {
  const commissionId = c.req.param('id');
  const userId = c.req.header('x-user-id') || 'business-admin';

  const transactionGroupId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Double-entry bookkeeping:
  // 1. Debit: Platform Tenant Payable (Nợ phải trả của DN)
  // 2. Credit: Partner Receivable (Phải thu của CTV)
  const ledgerEntries: LedgerEntry[] = [
    {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: 'tenant-dental-01',
      partnerId: 'partner-001',
      accountType: 'tenant_payable',
      debit: 3500000,
      credit: 0,
      currency: 'VND',
      referenceType: 'commission_approval',
      referenceId: commissionId,
      description: `Ghi nhận nghĩa vụ hoa hồng cho đơn hàng deal-999`,
      createdAt: now
    },
    {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: 'tenant-dental-01',
      partnerId: 'partner-001',
      accountType: 'partner_receivable',
      debit: 0,
      credit: 3500000,
      currency: 'VND',
      referenceType: 'commission_approval',
      referenceId: commissionId,
      description: `Hoa hồng được duyệt cho CTV partner-001 từ đơn deal-999`,
      createdAt: now
    }
  ];

  return c.json({
    success: true,
    data: {
      commissionId,
      status: 'approved',
      approvedBy: userId,
      approvedAt: now,
      ledgerEntries
    }
  });
});
