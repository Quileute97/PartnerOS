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
  entityType: 'contact' | 'deal';
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
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  partnerId?: string | null;
  referralCode?: string | null;
  source?: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned';

export interface CRMDeal {
  id: string;
  tenantId: string;
  contactId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  value: number;
  currency: string;
  status: DealStatus;
  partnerId?: string | null;
  referralCode?: string | null;
  customFields: Record<string, any>;
  wonAt?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
}
