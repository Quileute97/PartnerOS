import type {
  Commission,
  CommissionStatus,
  LedgerEntry,
  PartnerWallet,
  SettlementBatch,
  PayoutRequest,
  CommissionRule,
  LedgerReconciliationReport
} from '@partner-os/shared-types';
import { CommissionEngine } from '../services/commission-engine';

export class FinanceStore {
  private static instance: FinanceStore;

  public commissions: Map<string, Commission> = new Map();
  public ledger: LedgerEntry[] = [];
  public settlementBatches: Map<string, SettlementBatch> = new Map();
  public payoutRequests: Map<string, PayoutRequest> = new Map();
  public wallets: Map<string, PartnerWallet> = new Map();
  public rules: CommissionRule[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): FinanceStore {
    if (!FinanceStore.instance) {
      FinanceStore.instance = new FinanceStore();
    }
    return FinanceStore.instance;
  }

  private seedInitialData() {
    // 1. Initial Wallet for partner-001
    this.wallets.set('partner-001', {
      partnerId: 'partner-001',
      pendingBalance: 3500000,
      approvedBalance: 16500000,
      settledBalance: 0,
      totalPaid: 128400000,
      currency: 'VND',
      updatedAt: '2026-11-20T10:00:00Z'
    });

    // 2. Initial Commission (Pending)
    const comm1: Commission = {
      id: 'comm-101',
      tenantId: 'tenant-dental-01',
      partnerId: 'partner-001',
      campaignId: 'camp-1',
      dealId: 'deal-999',
      contactId: 'contact-01',
      dealValue: 35000000,
      rateSnapshot: 10,
      commissionType: 'percentage',
      amount: 3500000,
      status: 'pending',
      holdUntil: '2026-12-05T00:00:00Z',
      createdAt: '2026-11-20T10:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z'
    };
    this.commissions.set(comm1.id, comm1);

    // 3. Initial Approved Commission
    const comm2: Commission = {
      id: 'comm-102',
      tenantId: 'tenant-dental-01',
      partnerId: 'partner-001',
      campaignId: 'camp-1',
      dealId: 'deal-888',
      contactId: 'contact-02',
      dealValue: 24000000,
      rateSnapshot: 10,
      commissionType: 'percentage',
      amount: 2400000,
      status: 'approved',
      approvedAt: '2026-11-18T14:00:00Z',
      approvedBy: 'user-admin-01',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-18T14:00:00Z'
    };
    this.commissions.set(comm2.id, comm2);

    // Initial Ledger entries for comm2
    const txGroup = 'tx-group-seed-01';
    this.ledger.push(
      {
        id: 'ledger-seed-debit-01',
        transactionGroupId: txGroup,
        tenantId: 'tenant-dental-01',
        partnerId: 'partner-001',
        accountType: 'tenant_payable',
        debit: 2400000,
        credit: 0,
        currency: 'VND',
        referenceType: 'commission_approval',
        referenceId: comm2.id,
        description: `Ghi nhận nghĩa vụ nợ phải trả hoa hồng cho hợp đồng deal-888`,
        createdAt: '2026-11-18T14:00:00Z'
      },
      {
        id: 'ledger-seed-credit-01',
        transactionGroupId: txGroup,
        tenantId: 'tenant-dental-01',
        partnerId: 'partner-001',
        accountType: 'partner_receivable',
        debit: 0,
        credit: 2400000,
        currency: 'VND',
        referenceType: 'commission_approval',
        referenceId: comm2.id,
        description: `Ghi nhận quyền thụ hưởng hoa hồng cho CTV partner-001`,
        createdAt: '2026-11-18T14:00:00Z'
      }
    );
  }

  // --- Partner Wallet Helpers ---
  public getOrCreateWallet(partnerId: string): PartnerWallet {
    let wallet = this.wallets.get(partnerId);
    if (!wallet) {
      wallet = {
        partnerId,
        pendingBalance: 0,
        approvedBalance: 0,
        settledBalance: 0,
        totalPaid: 0,
        currency: 'VND',
        updatedAt: new Date().toISOString()
      };
      this.wallets.set(partnerId, wallet);
    }
    return wallet;
  }

  // --- Commission Lifecycle Operations ---
  public createCommission(params: {
    tenantId: string;
    partnerId: string;
    campaignId: string;
    dealId: string;
    contactId?: string;
    dealValue: number;
    rateSnapshot: number;
    commissionType: 'percentage' | 'fixed_amount';
    amount: number;
    holdPeriodDays?: number;
  }): Commission {
    const now = new Date();
    const holdDays = params.holdPeriodDays || 14;
    const holdUntilDate = new Date(now.getTime() + holdDays * 86400 * 1000);

    const commission: Commission = {
      id: `comm-${crypto.randomUUID().substring(0, 8)}`,
      tenantId: params.tenantId,
      partnerId: params.partnerId,
      campaignId: params.campaignId,
      dealId: params.dealId,
      contactId: params.contactId,
      dealValue: params.dealValue,
      rateSnapshot: params.rateSnapshot,
      commissionType: params.commissionType,
      amount: params.amount,
      status: 'pending',
      holdUntil: holdUntilDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.commissions.set(commission.id, commission);

    // Update partner wallet pending balance
    const wallet = this.getOrCreateWallet(params.partnerId);
    wallet.pendingBalance += params.amount;
    wallet.updatedAt = now.toISOString();

    return commission;
  }

  public approveCommission(commissionId: string, approvedBy: string): { commission: Commission; ledgerEntries: LedgerEntry[] } {
    const commission = this.commissions.get(commissionId);
    if (!commission) {
      throw new Error(`Commission ${commissionId} not found`);
    }

    const result = CommissionEngine.approveCommission(commission, approvedBy);
    if (!result.success || !result.ledgerEntries) {
      throw new Error(result.error || 'Failed to approve commission');
    }

    // Save updated commission
    this.commissions.set(commissionId, result.commission);

    // Append to immutable Ledger
    this.ledger.push(...result.ledgerEntries);

    // Update Partner Wallet: Move from pending to approved
    const wallet = this.getOrCreateWallet(commission.partnerId);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - commission.amount);
    wallet.approvedBalance += commission.amount;
    wallet.updatedAt = new Date().toISOString();

    return { commission: result.commission, ledgerEntries: result.ledgerEntries };
  }

  public reverseCommission(commissionId: string, reason: string): { commission: Commission; ledgerEntries: LedgerEntry[] } {
    const commission = this.commissions.get(commissionId);
    if (!commission) {
      throw new Error(`Commission ${commissionId} not found`);
    }

    const previousStatus = commission.status;
    const result = CommissionEngine.reverseCommission(commission, reason);
    if (!result.success || !result.ledgerEntries) {
      throw new Error(result.error || 'Failed to reverse commission');
    }

    this.commissions.set(commissionId, result.commission);
    this.ledger.push(...result.ledgerEntries);

    // Deduct from wallet based on prior state
    const wallet = this.getOrCreateWallet(commission.partnerId);
    if (previousStatus === 'approved') {
      wallet.approvedBalance = Math.max(0, wallet.approvedBalance - commission.amount);
    } else if (previousStatus === 'pending') {
      wallet.pendingBalance = Math.max(0, wallet.pendingBalance - commission.amount);
    }
    wallet.updatedAt = new Date().toISOString();

    return { commission: result.commission, ledgerEntries: result.ledgerEntries };
  }

  // --- Settlement Batches ---
  public generateSettlementBatch(params: {
    tenantId: string;
    periodStart: string;
    periodEnd: string;
    note?: string;
  }): { batch: SettlementBatch; eligibleCommissions: Commission[] } {
    const approvedCommissions = Array.from(this.commissions.values()).filter(
      c => c.tenantId === params.tenantId && c.status === 'approved'
    );

    if (approvedCommissions.length === 0) {
      throw new Error('Không có hoa hồng nào ở trạng thái Approved đủ điều kiện kết toán đợt này.');
    }

    const totalAmount = approvedCommissions.reduce((sum, c) => sum + c.amount, 0);
    const platformFee = Math.round(totalAmount * 0.05); // 5% platform fee
    const netPayoutAmount = totalAmount - platformFee;
    const uniquePartners = new Set(approvedCommissions.map(c => c.partnerId)).size;

    const batchNumber = `SETTLE_${new Date().getFullYear()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date().toISOString();

    const batch: SettlementBatch = {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      batchNumber,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totalAmount,
      platformFee,
      netPayoutAmount,
      partnersCount: uniquePartners,
      status: 'processing',
      note: params.note || 'Kỳ quyết toán hoa hồng định kỳ',
      createdAt: now
    };

    // Transition eligible commissions to in_settlement
    for (const comm of approvedCommissions) {
      comm.status = 'in_settlement';
      comm.updatedAt = now;
      this.commissions.set(comm.id, comm);

      // Adjust wallet balances
      const wallet = this.getOrCreateWallet(comm.partnerId);
      wallet.approvedBalance = Math.max(0, wallet.approvedBalance - comm.amount);
      wallet.settledBalance += comm.amount;
      wallet.updatedAt = now;
    }

    this.settlementBatches.set(batch.id, batch);

    return { batch, eligibleCommissions: approvedCommissions };
  }

  // --- Partner Payout Requests ---
  public requestPayout(params: {
    partnerId: string;
    amount: number;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }): PayoutRequest {
    const wallet = this.getOrCreateWallet(params.partnerId);

    if (params.amount > wallet.approvedBalance) {
      throw new Error(
        `Số tiền yêu cầu rút (${params.amount.toLocaleString('vi-VN')} VND) vượt quá số dư khả dụng (${wallet.approvedBalance.toLocaleString('vi-VN')} VND).`
      );
    }

    const now = new Date().toISOString();
    const payout: PayoutRequest = {
      id: `payout-${crypto.randomUUID().substring(0, 8)}`,
      partnerId: params.partnerId,
      amount: params.amount,
      currency: 'VND',
      bankName: params.bankName,
      bankAccountNumber: params.bankAccountNumber,
      bankAccountName: params.bankAccountName,
      status: 'pending',
      requestedAt: now
    };

    this.payoutRequests.set(payout.id, payout);

    // Deduct immediately from approved balance and move to settled/in-flight
    wallet.approvedBalance -= params.amount;
    wallet.settledBalance += params.amount;
    wallet.updatedAt = now;

    return payout;
  }

  public completePayout(payoutId: string, processedBy: string, referenceCode: string): PayoutRequest {
    const payout = this.payoutRequests.get(payoutId);
    if (!payout) {
      throw new Error(`Payout request ${payoutId} not found`);
    }

    if (payout.status !== 'pending' && payout.status !== 'processing') {
      throw new Error(`Cannot complete payout with status '${payout.status}'`);
    }

    const now = new Date().toISOString();
    payout.status = 'completed';
    payout.processedAt = now;
    payout.processedBy = processedBy;
    payout.transactionReference = referenceCode;

    // Double-entry Ledger entries for cash disbursement:
    const txGroup = crypto.randomUUID();
    const debitEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId: txGroup,
      tenantId: 'platform-central',
      partnerId: payout.partnerId,
      accountType: 'partner_receivable',
      debit: payout.amount,
      credit: 0,
      currency: payout.currency,
      referenceType: 'settlement_payout',
      referenceId: payout.id,
      description: `Tất toán chuyển khoản qua ngân hàng ${payout.bankName} - STK: ${payout.bankAccountNumber} (${referenceCode})`,
      createdAt: now
    };

    const creditEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId: txGroup,
      tenantId: 'platform-central',
      partnerId: null,
      accountType: 'escrow_cash',
      debit: 0,
      credit: payout.amount,
      currency: payout.currency,
      referenceType: 'settlement_payout',
      referenceId: payout.id,
      description: `Xuất tiền mặt/tài khoản ngân hàng thanh toán hoa hồng`,
      createdAt: now
    };

    this.ledger.push(debitEntry, creditEntry);

    // Finalize wallet
    const wallet = this.getOrCreateWallet(payout.partnerId);
    wallet.settledBalance = Math.max(0, wallet.settledBalance - payout.amount);
    wallet.totalPaid += payout.amount;
    wallet.updatedAt = now;

    return payout;
  }

  // --- Independent Ledger Reconciliation ---
  public getReconciliationReport(): LedgerReconciliationReport {
    const totalDebit = this.ledger.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = this.ledger.reduce((sum, e) => sum + e.credit, 0);
    const discrepancy = Math.abs(totalDebit - totalCredit);
    const isBalanced = discrepancy < 0.0001;

    return {
      totalDebit,
      totalCredit,
      isBalanced,
      entriesCount: this.ledger.length,
      discrepancy,
      verifiedAt: new Date().toISOString()
    };
  }
}
