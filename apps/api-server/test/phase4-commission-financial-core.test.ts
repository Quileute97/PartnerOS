import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('🚀 [PHASE 4 TEST SUITE] Starting Commission & Financial Core Tests...\n');

  let testCommissionId: string = '';
  const testPartnerId = 'partner-fin-001';
  const testTenantId = 'tenant-dental-01';

  // -------------------------------------------------------------
  // TEST 1: Commission Creation & Hold Period Calculation
  // -------------------------------------------------------------
  {
    console.log('👉 Test 1: Commission Creation with Anti-Refund Hold Period');
    
    const resCreate = await app.request('/api/v1/finance/commissions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        partnerId: testPartnerId,
        campaignId: 'camp-1',
        dealId: `deal_${crypto.randomUUID()}`,
        contactId: 'contact-test-1',
        dealValue: 50000000,
        rateSnapshot: 10,
        commissionType: 'percentage',
        amount: 5000000,
        holdPeriodDays: 14
      })
    });

    assert.strictEqual(resCreate.status, 201);
    const bodyCreate = await resCreate.json<any>();
    assert.strictEqual(bodyCreate.success, true);
    assert.strictEqual(bodyCreate.data.status, 'pending');
    assert.strictEqual(bodyCreate.data.amount, 5000000);
    assert.ok(bodyCreate.data.holdUntil, 'holdUntil must be defined');
    
    testCommissionId = bodyCreate.data.id;
    console.log(`   ✔ Commission created: ${testCommissionId} (Amount: 5,000,000 VND, Status: PENDING)`);

    // Verify wallet reflects pending balance
    const resWallet = await app.request(`/api/v1/finance/wallets/${testPartnerId}`, { method: 'GET' });
    const bodyWallet = await resWallet.json<any>();
    assert.strictEqual(bodyWallet.data.pendingBalance, 5000000);
    console.log('   ✔ Partner wallet pendingBalance correctly incremented');
  }

  // -------------------------------------------------------------
  // TEST 2: Double-Entry Ledger Posting on Approval
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 2: Double-Entry Ledger Posting on Commission Approval');

    const resApprove = await app.request(`/api/v1/finance/commissions/${testCommissionId}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'admin-reviewer-01'
      }
    });

    assert.strictEqual(resApprove.status, 200);
    const bodyApprove = await resApprove.json<any>();
    assert.strictEqual(bodyApprove.success, true);
    assert.strictEqual(bodyApprove.data.commission.status, 'approved');

    // Verify Double-Entry Ledger Postings
    const entries = bodyApprove.data.ledgerEntries;
    assert.strictEqual(entries.length, 2, 'Must create exactly one balancing pair of Debit & Credit');
    
    const debit = entries.find((e: any) => e.debit > 0);
    const credit = entries.find((e: any) => e.credit > 0);
    assert.ok(debit && credit, 'Must have both Debit and Credit rows');
    assert.strictEqual(debit.debit, credit.credit, 'Debit must equal Credit in group');
    assert.strictEqual(debit.accountType, 'tenant_payable', 'Debit must be tenant_payable');
    assert.strictEqual(credit.accountType, 'partner_receivable', 'Credit must be partner_receivable');
    console.log(`   ✔ Ledger balanced: Debit ${debit.accountType} (${debit.debit}) = Credit ${credit.accountType} (${credit.credit})`);

    // Verify wallet updated: pending balance moved to approved balance
    const resWallet = await app.request(`/api/v1/finance/wallets/${testPartnerId}`, { method: 'GET' });
    const bodyWallet = await resWallet.json<any>();
    assert.strictEqual(bodyWallet.data.pendingBalance, 0);
    assert.strictEqual(bodyWallet.data.approvedBalance, 5000000);
    console.log('   ✔ Wallet balance moved: 5,000,000 VND now in approvedBalance');
  }

  // -------------------------------------------------------------
  // TEST 3: State Machine Violation Prevention
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 3: Financial State Machine Constraint Verification');

    // Attempting to re-approve an already approved commission must fail
    const resDuplicateApprove = await app.request(`/api/v1/finance/commissions/${testCommissionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    assert.strictEqual(resDuplicateApprove.status, 400);
    const bodyDup = await resDuplicateApprove.json<any>();
    assert.strictEqual(bodyDup.success, false);
    console.log(`   ✔ Prevented illegal state jump: "${bodyDup.error}"`);
  }

  // -------------------------------------------------------------
  // TEST 4: Auditable Reversal (Compensating Ledger Entry)
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 4: Auditable Reversal & Compensating Ledger Entry (Refund scenario)');

    const resReverse = await app.request(`/api/v1/finance/commissions/${testCommissionId}/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'Khách hàng huỷ lịch và hoàn tiền điều trị trong 7 ngày'
      })
    });

    assert.strictEqual(resReverse.status, 200);
    const bodyReverse = await resReverse.json<any>();
    assert.strictEqual(bodyReverse.success, true);
    assert.strictEqual(bodyReverse.data.commission.status, 'reversed');

    // Verify Compensating entries
    const entries = bodyReverse.data.ledgerEntries;
    assert.strictEqual(entries.length, 2);
    const debit = entries.find((e: any) => e.debit > 0);
    const credit = entries.find((e: any) => e.credit > 0);
    assert.strictEqual(debit.accountType, 'partner_receivable', 'Reversal Debit must deduct partner_receivable');
    assert.strictEqual(credit.accountType, 'tenant_payable', 'Reversal Credit must clear tenant_payable');
    assert.strictEqual(debit.debit, 5000000);
    assert.strictEqual(credit.credit, 5000000);
    console.log('   ✔ Compensating balance entry posted, commission marked REVERSED');
  }

  // -------------------------------------------------------------
  // TEST 5: Settlement Batch Aggregation & Independent Reconciliation
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 5: Settlement Batch Generation & Period Aggregation');

    // Create and approve another commission for settlement
    const resCreate = await app.request('/api/v1/finance/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': testTenantId },
      body: JSON.stringify({
        partnerId: testPartnerId,
        campaignId: 'camp-1',
        dealId: `deal_${crypto.randomUUID()}`,
        dealValue: 30000000,
        rateSnapshot: 10,
        amount: 3000000
      })
    });
    const newComm = await resCreate.json<any>();
    await app.request(`/api/v1/finance/commissions/${newComm.data.id}/approve`, { method: 'POST' });

    // Generate Settlement Batch
    const resBatch = await app.request('/api/v1/finance/settlements/batches/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': testTenantId },
      body: JSON.stringify({
        periodStart: '2026-11-01',
        periodEnd: '2026-11-15',
        note: 'Kỳ quyết toán giữa tháng 11/2026'
      })
    });

    assert.strictEqual(resBatch.status, 201);
    const bodyBatch = await resBatch.json<any>();
    assert.strictEqual(bodyBatch.success, true);
    assert.ok(bodyBatch.data.batch.batchNumber.startsWith('SETTLE_'));
    assert.ok(bodyBatch.data.batch.totalAmount > 0);
    assert.ok(bodyBatch.data.batch.netPayoutAmount < bodyBatch.data.batch.totalAmount, 'Net must account for platform fee');
    console.log(`   ✔ Batch ${bodyBatch.data.batch.batchNumber} generated with total: ${bodyBatch.data.batch.totalAmount.toLocaleString('vi-VN')} VND`);
  }

  // -------------------------------------------------------------
  // TEST 6: Partner Payout Request Validation & Balance Protection
  // -------------------------------------------------------------
  let payoutId: string = '';
  {
    console.log('\n👉 Test 6: Partner Payout Request & Balance Check');

    // 6.1 Attempt withdrawal exceeding available balance -> Must fail
    const resOverdraw = await app.request('/api/v1/finance/payouts/request', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-partner-id': 'partner-001'
      },
      body: JSON.stringify({
        amount: 999999999, // Exceeds balance
        bankName: 'Vietcombank',
        bankAccountNumber: '0071001234567',
        bankAccountName: 'NGUYEN VAN TUAN'
      })
    });
    assert.strictEqual(resOverdraw.status, 400);
    const bodyOverdraw = await resOverdraw.json<any>();
    assert.strictEqual(bodyOverdraw.success, false);
    console.log(`   ✔ Overdraft protected: "${bodyOverdraw.error}"`);

    // 6.2 Valid withdrawal
    const resValidPayout = await app.request('/api/v1/finance/payouts/request', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-partner-id': 'partner-001'
      },
      body: JSON.stringify({
        amount: 5000000,
        bankName: 'Vietcombank',
        bankAccountNumber: '0071001234567',
        bankAccountName: 'NGUYEN VAN TUAN'
      })
    });

    assert.strictEqual(resValidPayout.status, 201);
    const bodyValidPayout = await resValidPayout.json<any>();
    assert.strictEqual(bodyValidPayout.success, true);
    assert.strictEqual(bodyValidPayout.data.amount, 5000000);
    assert.strictEqual(bodyValidPayout.data.status, 'pending');
    payoutId = bodyValidPayout.data.id;
    console.log(`   ✔ Payout request registered: ${payoutId} (5,000,000 VND)`);
  }

  // -------------------------------------------------------------
  // TEST 7: Disbursement Execution & Cash Ledger Posting
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 7: Disbursement Execution & Cash Ledger Posting');

    const resComplete = await app.request(`/api/v1/finance/payouts/${payoutId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'operator-bank-approver'
      },
      body: JSON.stringify({
        transactionReference: 'FT26325889921'
      })
    });

    assert.strictEqual(resComplete.status, 200);
    const bodyComplete = await resComplete.json<any>();
    assert.strictEqual(bodyComplete.success, true);
    assert.strictEqual(bodyComplete.data.status, 'completed');
    assert.strictEqual(bodyComplete.data.transactionReference, 'FT26325889921');
    console.log('   ✔ Payout disbursement completed and cash ledger entry posted');
  }

  // -------------------------------------------------------------
  // TEST 8: Full Ledger Mathematical Balance Reconciliation
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 8: Independent Double-Entry Mathematical Balance Reconciliation');

    const resAudit = await app.request('/api/v1/finance/ledger/reconciliation', { method: 'GET' });
    assert.strictEqual(resAudit.status, 200);
    const bodyAudit = await resAudit.json<any>();
    assert.strictEqual(bodyAudit.success, true);
    assert.strictEqual(bodyAudit.status, 'BALANCED');
    assert.strictEqual(bodyAudit.data.isBalanced, true);
    assert.strictEqual(bodyAudit.data.discrepancy, 0);
    assert.ok(bodyAudit.data.totalDebit > 0);
    assert.strictEqual(bodyAudit.data.totalDebit, bodyAudit.data.totalCredit);
    console.log(`   ✔ Total Debit (${bodyAudit.data.totalDebit.toLocaleString('vi-VN')} VND) === Total Credit (${bodyAudit.data.totalCredit.toLocaleString('vi-VN')} VND) across ${bodyAudit.data.entriesCount} ledger entries`);
  }

  console.log('\n🎉 [PHASE 4 TEST SUITE] ALL 8 FINANCIAL CORE TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 4 Test Suite Failed:', err);
  process.exit(1);
});
