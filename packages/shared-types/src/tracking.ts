export interface TrackingClickPayload {
  referralCode: string;
  tenantSlug?: string;
  landingPageUrl: string;
  referrerUrl?: string | null;
  userAgent?: string;
  deviceFingerprint?: string;
  sessionId?: string;
}

export interface TrackingClick {
  id: string;
  referralLinkId: string;
  referralCode?: string;
  tenantId: string;
  partnerId: string;
  campaignId?: string;
  sessionId: string;
  ipHash: string;
  userAgent?: string;
  referer?: string;
  landingPage: string;
  deviceFingerprint?: string;
  createdAt: string;
}

export interface TrackingConversionPayload {
  referralCode?: string;
  sessionId?: string;
  tenantId?: string;
  tenantSlug?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  dealValue?: number;
  dealTitle?: string;
  customFields?: Record<string, any>;
  idempotencyKey?: string;
}

export interface TrackingConversion {
  id: string;
  clickId?: string | null;
  referralLinkId?: string | null;
  referralCode?: string | null;
  tenantId: string;
  partnerId?: string | null;
  contactId: string;
  dealId?: string | null;
  conversionValue: number;
  createdAt: string;
}

export type AttributionModel = 'last_click' | 'first_click' | 'linear';

export type AttributionStatus = 
  | 'attributed' 
  | 'organic' 
  | 'expired_window' 
  | 'partner_suspended'
  | 'duplicate_ignored';

export interface AttributionDecision {
  conversionId: string;
  dealId?: string | null;
  status: AttributionStatus;
  model: AttributionModel;
  referralCode?: string | null;
  attributedPartnerId?: string | null;
  attributedPartnerName?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  clickId?: string | null;
  clickedAt?: string | null;
  convertedAt: string;
  cookieWindowDays: number;
  timeToConversionHours?: number | null;
  commissionRate?: number | null;
  commissionType?: string | null;
  calculatedCommission?: number | null;
  explanation: string;
}

export interface AttributionRecord {
  id: string;
  tenantId: string;
  conversionId: string;
  dealId?: string | null;
  contactId: string;
  partnerId?: string | null;
  campaignId?: string | null;
  clickId?: string | null;
  referralCode?: string | null;
  model: AttributionModel;
  decision: AttributionDecision;
  createdAt: string;
}
