export type CommissionStatus =
  | 'pending'        // Deal won, commission calculated, in hold period
  | 'approved'       // Verified by business, ready for settlement
  | 'rejected'       // Invalid deal or cancellation
  | 'in_settlement'  // Included in an active settlement batch
  | 'paid'           // Successfully disbursed to partner
  | 'reversed';      // Post-payout refund or fraud chargeback

export interface Commission {
  id: string;
  tenantId: string;
  partnerId: string;
  campaignId: string;
  dealId: string;
  contactId?: string | null;
  dealValue: number;
  rateSnapshot: number;
  commissionType: 'percentage' | 'fixed_amount';
  amount: number;
  status: CommissionStatus;
  holdUntil?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  paidAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LedgerAccountType =
  | 'partner_receivable'   // Partner's asset: money owed to partner
  | 'tenant_payable'       // Tenant's liability: money tenant must pay
  | 'platform_revenue'     // PartnerOS service fee
  | 'escrow_cash';         // Cash held for disbursement

export type LedgerReferenceType =
  | 'commission_accrual'
  | 'commission_approval'
  | 'commission_reversal'
  | 'settlement_payout'
  | 'platform_fee';

export interface LedgerEntry {
  id: string;
  transactionGroupId: string; // Groups debit + credit pairs
  tenantId: string;
  partnerId?: string | null;
  accountType: LedgerAccountType;
  debit: number;
  credit: number;
  currency: string;
  referenceType: LedgerReferenceType;
  referenceId: string; // ID of commission, settlement_batch, or payment
  description: string;
  createdAt: string;
}

export interface PartnerWallet {
  partnerId: string;
  pendingBalance: number;   // Pending commissions still in hold period
  approvedBalance: number;  // Approved, eligible for next settlement
  settledBalance: number;   // In settlement transit
  totalPaid: number;        // Lifetime paid out
  currency: string;
  updatedAt: string;
}

export type SettlementStatus = 'draft' | 'processing' | 'completed' | 'disputed' | 'cancelled';

export interface SettlementBatch {
  id: string;
  tenantId: string;
  batchNumber: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  platformFee: number;
  netPayoutAmount: number;
  partnersCount: number;
  status: SettlementStatus;
  note?: string;
  settledAt?: string | null;
  createdAt: string;
}

export interface SettlementItem {
  id: string;
  batchId: string;
  partnerId: string;
  amount: number;
  commissionIds: string[];
  paymentMethod: 'bank_transfer' | 'e_wallet' | 'manual';
  paymentReference?: string | null;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: string | null;
}

export type PayoutRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface PayoutRequest {
  id: string;
  partnerId: string;
  amount: number;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: PayoutRequestStatus;
  transactionReference?: string | null;
  rejectionReason?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
}

export interface CommissionRule {
  id: string;
  tenantId: string;
  campaignId: string;
  name: string;
  priority: number;
  ruleType: 'standard' | 'tiered_volume' | 'product_specific' | 'first_time_customer';
  conditions: Record<string, any>;
  commissionType: 'percentage' | 'fixed_amount';
  commissionRate: number;
  holdPeriodDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface LedgerReconciliationReport {
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  entriesCount: number;
  discrepancy: number;
  verifiedAt: string;
}
