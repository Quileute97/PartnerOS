export type CommissionType = 'percentage' | 'fixed_amount';

export interface AffiliateCampaign {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description?: string | null;
  commissionType: CommissionType;
  commissionRate: number; // percentage (e.g. 10.5 for 10.5%) or fixed amount (e.g. 500000 VND)
  cookieWindowDays: number;
  minDealValue?: number | null;
  termsAndConditions?: string | null;
  isPublicMarketplace: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PartnerRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerCampaignRegistration {
  id: string;
  campaignId: string;
  partnerId: string;
  tenantId: string;
  status: PartnerRegistrationStatus;
  approvedAt?: string | null;
  createdAt: string;
}

export interface ReferralLink {
  id: string;
  tenantId: string;
  campaignId: string;
  partnerId: string;
  code: string;
  destinationUrl: string;
  fullReferralUrl: string;
  qrCodeUrl?: string | null;
  clicksCount: number;
  leadsCount: number;
  conversionsCount: number;
  isActive: boolean;
  createdAt: string;
}
