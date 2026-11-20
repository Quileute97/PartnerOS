export type CRMFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'phone'
  | 'email'
  | 'url'
  | 'textarea';

export interface CRMFieldOption {
  label: string;
  value: string;
  color?: string;
}

export interface CRMFieldDefinition {
  id: string;
  tenantId: string;
  entityType: 'contact' | 'deal' | 'lead' | 'product';
  fieldName: string;
  label: string;
  fieldType: CRMFieldType;
  options?: CRMFieldOption[] | null;
  isRequired: boolean;
  defaultValue?: any;
  placeholder?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CRMPipeline {
  id: string;
  tenantId: string;
  name: string;
  isDefault: boolean;
  stages?: CRMStage[];
  createdAt: string;
}

export interface CRMStage {
  id: string;
  pipelineId: string;
  name: string;
  stageOrder: number;
  color: string;
  isWonStage: boolean;
  isLostStage: boolean;
}

export interface CRMContact {
  id: string;
  tenantId: string;
  branchId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  partnerId?: string | null;
  referralCode?: string | null;
  source?: string;
  tags?: string[];
  assignedTo?: string | null;
  customFields: Record<string, any>;
  notesCount?: number;
  activitiesCount?: number;
  dealsCount?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';

export interface CRMLead {
  id: string;
  tenantId: string;
  branchId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  status: LeadStatus;
  score?: number;
  estimatedValue?: number;
  assignedTo?: string | null;
  partnerId?: string | null;
  referralCode?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  customFields: Record<string, any>;
  convertedContactId?: string | null;
  convertedDealId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned';

export interface CRMDeal {
  id: string;
  tenantId: string;
  branchId?: string | null;
  contactId: string;
  contactName?: string;
  pipelineId: string;
  stageId: string;
  stageName?: string;
  title: string;
  value: number;
  currency: string;
  status: DealStatus;
  partnerId?: string | null;
  partnerName?: string;
  referralCode?: string | null;
  assignedTo?: string | null;
  customFields: Record<string, any>;
  wonAt?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductType = 'product' | 'service';

export interface CRMProduct {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  type: ProductType;
  unitPrice: number;
  currency: string;
  isCommissionEligible: boolean;
  defaultCommissionRate?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export interface CRMOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CRMTransaction {
  id: string;
  tenantId: string;
  branchId?: string | null;
  branchName?: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dealId?: string | null;
  partnerId?: string | null;
  partnerName?: string;
  referralCode?: string | null;
  items: CRMOrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  idempotencyKey?: string;
  externalRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'note' | 'stage_change' | 'order_created' | 'system';

export interface CRMActivity {
  id: string;
  tenantId: string;
  contactId?: string | null;
  dealId?: string | null;
  leadId?: string | null;
  type: ActivityType;
  title: string;
  description: string;
  performedByUserId: string;
  performedByUserName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CRMAuditLog {
  id: string;
  tenantId: string;
  entityType: 'contact' | 'lead' | 'deal' | 'product' | 'transaction' | 'member';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'convert' | 'status_change';
  performedByUserId: string;
  performedByUserName: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  createdAt: string;
}

export interface CRMReportSummary {
  totalRevenue: number;
  revenueChangeMonth: number;
  totalCustomers: number;
  newCustomersWeek: number;
  activeLeads: number;
  leadConversionRate: number;
  dealsWonCount: number;
  averageDealSize: number;
  revenueByBranch: {
    branchId: string;
    branchName: string;
    revenue: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    salesCount: number;
    revenue: number;
  }[];
}
