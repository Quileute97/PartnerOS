import type { 
  Commission, 
  CommissionStatus, 
  LedgerEntry, 
  LedgerAccountType, 
  LedgerReferenceType 
} from '@partner-os/shared-types';

export interface StateTransitionResult {
  success: boolean;
  commission: Commission;
  ledgerEntries?: LedgerEntry[];
  error?: string;
}

/**
 * Commission Engine & Financial State Machine
 * Strictly enforces Double-entry Bookkeeping and Immutable Ledger rules.
 */
export class CommissionEngine {

  /**
   * Validate if a state transition is legally allowed
   */
  public static canTransition(from: CommissionStatus, to: CommissionStatus): boolean {
    const allowedTransitions: Record<CommissionStatus, CommissionStatus[]> = {
      pending: ['approved', 'rejected'],
      approved: ['in_settlement', 'reversed'],
      rejected: [], // Terminal state
      in_settlement: ['paid', 'approved'], // Can revert back to approved if settlement fails
      paid: ['reversed'], // Post-payment dispute/chargeback
      reversed: [] // Terminal state
    };

    return allowedTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Transition: PENDING -> APPROVED
   * Triggers:
   * 1. Debit Tenant Payable (Doanh nghiệp ghi nhận nghĩa vụ nợ phải trả)
   * 2. Credit Partner Receivable (Cộng quyền nhận hoa hồng của CTV)
   */
  public static approveCommission(
    commission: Commission,
    approvedByUserId: string
  ): StateTransitionResult {
    if (!this.canTransition(commission.status, 'approved')) {
      return {
        success: false,
        commission,
        error: `Cannot transition commission from status '${commission.status}' to 'approved'.`
      };
    }

    const transactionGroupId = crypto.randomUUID();
    const now = new Date().toISOString();

    const debitEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: commission.partnerId,
      accountType: 'tenant_payable',
      debit: commission.amount,
      credit: 0,
      currency: 'VND',
      referenceType: 'commission_approval',
      referenceId: commission.id,
      description: `Ghi nhận nợ phải trả hoa hồng (Deal ID: ${commission.dealId})`,
      createdAt: now
    };

    const creditEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: commission.partnerId,
      accountType: 'partner_receivable',
      debit: 0,
      credit: commission.amount,
      currency: 'VND',
      referenceType: 'commission_approval',
      referenceId: commission.id,
      description: `Ghi nhận khoản phải thu hoa hồng cho CTV ${commission.partnerId}`,
      createdAt: now
    };

    // Verify double-entry balance: Debit must equal Credit
    this.assertDoubleEntryBalance([debitEntry, creditEntry]);

    const updatedCommission: Commission = {
      ...commission,
      status: 'approved',
      approvedAt: now,
      approvedBy: approvedByUserId,
      updatedAt: now
    };

    return {
      success: true,
      commission: updatedCommission,
      ledgerEntries: [debitEntry, creditEntry]
    };
  }

  /**
   * Transition: APPROVED / PAID -> REVERSED (Compensating Reversal Entry)
   * If an order is refunded, cancelled, or flagged for fraud:
   * We NEVER delete existing ledger rows. Instead, we post an exact opposite Reversal Entry.
   */
  public static reverseCommission(
    commission: Commission,
    reason: string
  ): StateTransitionResult {
    if (!this.canTransition(commission.status, 'reversed')) {
      return {
        success: false,
        commission,
        error: `Cannot reverse commission with current status '${commission.status}'.`
      };
    }

    const transactionGroupId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Exact opposite postings:
    const debitEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: commission.partnerId,
      accountType: 'partner_receivable',
      debit: commission.amount, // Deduct partner receivable
      credit: 0,
      currency: 'VND',
      referenceType: 'commission_reversal',
      referenceId: commission.id,
      description: `Bút toán đảo: Hủy hoa hồng do [${reason}] (Deal ID: ${commission.dealId})`,
      createdAt: now
    };

    const creditEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: commission.partnerId,
      accountType: 'tenant_payable',
      debit: 0,
      credit: commission.amount, // Clear tenant liability
      currency: 'VND',
      referenceType: 'commission_reversal',
      referenceId: commission.id,
      description: `Bút toán đảo: Giảm nghĩa vụ phải trả cho doanh nghiệp`,
      createdAt: now
    };

    this.assertDoubleEntryBalance([debitEntry, creditEntry]);

    const updatedCommission: Commission = {
      ...commission,
      status: 'reversed',
      rejectionReason: reason,
      updatedAt: now
    };

    return {
      success: true,
      commission: updatedCommission,
      ledgerEntries: [debitEntry, creditEntry]
    };
  }

  /**
   * Transition: IN_SETTLEMENT -> PAID
   * Final disbursement payout to partner bank account.
   */
  public static markAsPaid(
    commission: Commission,
    paymentBatchId: string
  ): StateTransitionResult {
    if (!this.canTransition(commission.status, 'paid')) {
      return {
        success: false,
        commission,
        error: `Cannot disburse commission with current status '${commission.status}'.`
      };
    }

    const transactionGroupId = crypto.randomUUID();
    const now = new Date().toISOString();

    const debitEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: commission.partnerId,
      accountType: 'partner_receivable',
      debit: commission.amount,
      credit: 0,
      currency: 'VND',
      referenceType: 'settlement_payout',
      referenceId: paymentBatchId,
      description: `Tất toán giải ngân hoa hồng vào tài khoản ngân hàng của CTV`,
      createdAt: now
    };

    const creditEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionGroupId,
      tenantId: commission.tenantId,
      partnerId: null,
      accountType: 'escrow_cash',
      debit: 0,
      credit: commission.amount,
      currency: 'VND',
      referenceType: 'settlement_payout',
      referenceId: paymentBatchId,
      description: `Xuất quỹ tiền mặt / chuyển khoản đối soát kỳ settlement`,
      createdAt: now
    };

    this.assertDoubleEntryBalance([debitEntry, creditEntry]);

    const updatedCommission: Commission = {
      ...commission,
      status: 'paid',
      paidAt: now,
      updatedAt: now
    };

    return {
      success: true,
      commission: updatedCommission,
      ledgerEntries: [debitEntry, creditEntry]
    };
  }

  /**
   * Safety invariant: Total Debit MUST always equal Total Credit in any transaction group.
   */
  private static assertDoubleEntryBalance(entries: LedgerEntry[]): void {
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      throw new Error(`Double-entry balance check failed! Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit}).`);
    }
  }
}
