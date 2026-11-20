import assert from 'node:assert';
import { CommissionEngine } from '../src/services/commission-engine.ts';
import type { Commission } from '@partner-os/shared-types';

console.log('Testing CommissionEngine...');

const mockCommission: Commission = {
  id: 'comm-test-01',
  tenantId: 'tenant-test',
  partnerId: 'partner-test',
  campaignId: 'camp-test',
  dealId: 'deal-test',
  dealValue: 10000000,
  rateSnapshot: 10,
  commissionType: 'percentage',
  amount: 1000000,
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 1. Test Approval transition (PENDING -> APPROVED)
const approvalResult = CommissionEngine.approveCommission(mockCommission, 'user-admin');
assert.strictEqual(approvalResult.success, true, 'Approval should succeed');
assert.strictEqual(approvalResult.commission.status, 'approved', 'Status should be approved');
assert.strictEqual(approvalResult.ledgerEntries?.length, 2, 'Should create 2 balanced ledger entries');

const debitEntry = approvalResult.ledgerEntries?.find(e => e.accountType === 'tenant_payable');
const creditEntry = approvalResult.ledgerEntries?.find(e => e.accountType === 'partner_receivable');
assert(debitEntry, 'Debit tenant_payable must exist');
assert(creditEntry, 'Credit partner_receivable must exist');
assert.strictEqual(debitEntry.debit, 1000000, 'Debit amount matches');
assert.strictEqual(creditEntry.credit, 1000000, 'Credit amount matches');
assert.strictEqual(debitEntry.debit, creditEntry.credit, 'Debit must equal Credit');
console.log('✓ Approval & Double-entry balance check passed');

// 2. Test Invalid Transition (PENDING -> PAID directly should fail)
assert.strictEqual(CommissionEngine.canTransition('pending', 'paid'), false, 'Cannot transition pending directly to paid');
console.log('✓ State transition constraint check passed');

// 3. Test Reversal transition (APPROVED -> REVERSED)
const reversalResult = CommissionEngine.reverseCommission(approvalResult.commission, 'Khách hủy hợp đồng');
assert.strictEqual(reversalResult.success, true, 'Reversal should succeed');
assert.strictEqual(reversalResult.commission.status, 'reversed', 'Status should be reversed');
assert.strictEqual(reversalResult.ledgerEntries?.length, 2, 'Reversal creates 2 compensating ledger entries');

const revDebit = reversalResult.ledgerEntries?.find(e => e.accountType === 'partner_receivable');
const revCredit = reversalResult.ledgerEntries?.find(e => e.accountType === 'tenant_payable');
assert(revDebit && revCredit, 'Compensating ledger entries exist');
assert.strictEqual(revDebit.debit, 1000000, 'Compensating debit reduces partner receivable');
assert.strictEqual(revCredit.credit, 1000000, 'Compensating credit clears tenant payable');
console.log('✓ Reversal entry & Compensating balance check passed');

// 4. Test Final Payout (APPROVED -> IN_SETTLEMENT -> PAID)
const approvedComm = approvalResult.commission;
const inSettlementComm: Commission = { ...approvedComm, status: 'in_settlement' };
const paidResult = CommissionEngine.markAsPaid(inSettlementComm, 'batch-2026-11');
assert.strictEqual(paidResult.success, true, 'Mark as paid should succeed');
assert.strictEqual(paidResult.commission.status, 'paid', 'Status should be paid');
console.log('✓ Settlement payout check passed');

console.log('ALL COMMISSION ENGINE TESTS PASSED SUCCESSFULLY! 🎉');
