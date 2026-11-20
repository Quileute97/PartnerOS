export type CommissionType = 'percentage' | 'fixed_amount';

export type CampaignStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'published' 
  | 'paused' 
  | 'completed' 
  | 'rejected' 
  | 'suspended';

export interface CampaignPolicyVersion {
  id: string;
  campaignId: string;
  version: number;
  commissionType: CommissionType;
  commissionRate: number;
  cookieWindowDays: number;
  minDealValue: number;
  termsAndConditions: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt: string;
}

export interface AffiliateCampaign {
  id: string;
  tenantId: string;
  tenantName?: string;
  tenantLogoUrl?: string | null;
  industry?: string;
  title: string;
  slug: string;
  description?: string | null;
  commissionType: CommissionType;
  commissionRate: number; // percentage (e.g. 10.5 for 10.5%) or fixed amount (e.g. 50000000 VND)
  cookieWindowDays: number;
  minDealValue?: number | null;
  termsAndConditions?: string | null;
  policyVersion: number;
  isPublicMarketplace: boolean;
  status: CampaignStatus;
  isActive: boolean;
  activePartnersCount?: number;
  totalConversionsCount?: number;
  totalCommissionsPaid?: number;
  createdAt: string;
  updatedAt: string;
}

export type PartnerRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerCampaignRegistration {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  partnerId: string;
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  tenantId: string;
  tenantName?: string;
  policyVersionAgreed: number;
  applicationNote?: string | null;
  status: PartnerRegistrationStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  referralLinkCode?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralLink {
  id: string;
  tenantId: string;
  campaignId: string;
  campaignTitle?: string;
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

export interface MarketplaceFilterOptions {
  search?: string;
  industry?: string;
  commissionType?: CommissionType;
  minCommissionRate?: number;
  tenantId?: string;
}
