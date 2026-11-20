import { Hono } from 'hono';
import { 
  createPayoutRequestSchema, 
  generateSettlementBatchSchema, 
  reverseCommissionSchema 
} from '@partner-os/validation';
import { FinanceStore } from '../state/finance-store';

export const financeRouter = new Hono();
const store = FinanceStore.getInstance();

// 1. List commissions with optional filtering
financeRouter.get('/commissions', async (c) => {
  const tenantId = c.req.header('x-tenant-id');
  const partnerId = c.req.query('partnerId') || c.req.header('x-partner-id');
  const status = c.req.query('status');

  let commissions = Array.from(store.commissions.values());

  if (tenantId) {
    commissions = commissions.filter(c => c.tenantId === tenantId);
  }
  if (partnerId) {
    commissions = commissions.filter(c => c.partnerId === partnerId);
  }
  if (status) {
    commissions = commissions.filter(c => c.status === status);
  }

  return c.json({
    success: true,
    data: commissions,
    total: commissions.length
  });
});

// 2. Record new commission (typically called when a deal or order is completed)
financeRouter.post('/commissions', async (c) => {
  const body = await c.req.json();
  const tenantId = c.req.header('x-tenant-id') || body.tenantId || 'tenant-dental-01';

  if (!body.partnerId || !body.dealId || body.amount === undefined) {
    return c.json({
      success: false,
      error: 'partnerId, dealId và amount là các trường bắt buộc'
    }, 400);
  }

  const commission = store.createCommission({
    tenantId,
    partnerId: body.partnerId,
    campaignId: body.campaignId || 'camp-1',
    dealId: body.dealId,
    contactId: body.contactId,
    dealValue: body.dealValue || 0,
    rateSnapshot: body.rateSnapshot || 10,
    commissionType: body.commissionType || 'percentage',
    amount: body.amount,
    holdPeriodDays: body.holdPeriodDays || 14
  });

  return c.json({
    success: true,
    data: commission,
    message: 'Ghi nhận hoa hồng thành công (Trạng thái: Pending, đang trong thời gian bảo lưu)'
  }, 201);
});

// 3. Approve commission (Moves status: pending -> approved, posts to Double-Entry Ledger)
financeRouter.post('/commissions/:id/approve', async (c) => {
  const commissionId = c.req.param('id');
  const userId = c.req.header('x-user-id') || 'business-admin';

  try {
    const result = store.approveCommission(commissionId, userId);
    return c.json({
      success: true,
      data: result,
      message: 'Duyệt hoa hồng thành công và đã hạch toán vào sổ cái kế toán kép (Ledger)'
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 4. Reverse commission (Compensating reversal entry in Ledger)
financeRouter.post('/commissions/:id/reverse', async (c) => {
  const commissionId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const parsed = reverseCommissionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu huỷ hoa hồng không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  try {
    const result = store.reverseCommission(commissionId, parsed.data.reason);
    return c.json({
      success: true,
      data: result,
      message: 'Huỷ hoa hồng thành công, đã ghi nhận bút toán đảo bù trừ vào sổ cái'
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 5. Get partner wallet balance
financeRouter.get('/wallets/:partnerId', async (c) => {
  const partnerId = c.req.param('partnerId');
  const wallet = store.getOrCreateWallet(partnerId);

  return c.json({
    success: true,
    data: wallet
  });
});

// 6. Partner submits payout request
financeRouter.post('/payouts/request', async (c) => {
  const partnerId = c.req.header('x-partner-id') || 'partner-001';
  const body = await c.req.json();
  const parsed = createPayoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Thông tin rút tiền không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  try {
    const payout = store.requestPayout({
      partnerId,
      amount: parsed.data.amount,
      bankName: parsed.data.bankName,
      bankAccountNumber: parsed.data.bankAccountNumber,
      bankAccountName: parsed.data.bankAccountName
    });

    return c.json({
      success: true,
      data: payout,
      message: 'Gửi yêu cầu rút tiền thành công, hệ thống đã trừ số dư khả dụng và đưa vào hàng đợi giải ngân'
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 7. List payout requests
financeRouter.get('/payouts', async (c) => {
  const partnerId = c.req.query('partnerId') || c.req.header('x-partner-id');
  let payouts = Array.from(store.payoutRequests.values());

  if (partnerId) {
    payouts = payouts.filter(p => p.partnerId === partnerId);
  }

  return c.json({
    success: true,
    data: payouts,
    total: payouts.length
  });
});

// 8. Operator or Tenant completes payout (disburses cash)
financeRouter.post('/payouts/:id/complete', async (c) => {
  const payoutId = c.req.param('id');
  const processedBy = c.req.header('x-user-id') || 'operator-settler';
  const body = await c.req.json().catch(() => ({}));
  const referenceCode = body.transactionReference || `TX_BANK_${Date.now()}`;

  try {
    const payout = store.completePayout(payoutId, processedBy, referenceCode);
    return c.json({
      success: true,
      data: payout,
      message: 'Xác nhận chuyển khoản thành công, đã ghi nhận chi tiền mặt/ngân hàng trong Ledger'
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 9. Generate Settlement Batch (aggregates approved commissions)
financeRouter.post('/settlements/batches/generate', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json().catch(() => ({}));
  const parsed = generateSettlementBatchSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu kỳ đối soát không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  try {
    const result = store.generateSettlementBatch({
      tenantId,
      periodStart: parsed.data.periodStart,
      periodEnd: parsed.data.periodEnd,
      note: parsed.data.note
    });

    return c.json({
      success: true,
      data: result,
      message: `Tạo kỳ quyết toán ${result.batch.batchNumber} thành công gồm ${result.eligibleCommissions.length} hoa hồng hợp lệ.`
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 10. List settlement batches
financeRouter.get('/settlements/batches', async (c) => {
  const tenantId = c.req.header('x-tenant-id');
  let batches = Array.from(store.settlementBatches.values());

  if (tenantId) {
    batches = batches.filter(b => b.tenantId === tenantId);
  }

  return c.json({
    success: true,
    data: batches,
    total: batches.length
  });
});

// 11. View immutable Double-Entry Ledger entries
financeRouter.get('/ledger', async (c) => {
  const tenantId = c.req.header('x-tenant-id');
  let entries = store.ledger;

  if (tenantId) {
    entries = entries.filter(e => e.tenantId === tenantId || e.tenantId === 'platform-central');
  }

  return c.json({
    success: true,
    data: entries,
    total: entries.length
  });
});

// 12. Independent Ledger Reconciliation Report (Mathematical Balance Verification)
financeRouter.get('/ledger/reconciliation', async (c) => {
  const report = store.getReconciliationReport();

  return c.json({
    success: true,
    data: report,
    status: report.isBalanced ? 'BALANCED' : 'DISCREPANCY_DETECTED'
  });
});
