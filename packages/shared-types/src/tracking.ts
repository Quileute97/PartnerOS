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
  tenantId: string;
  partnerId: string;
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
}

export interface TrackingConversion {
  id: string;
  clickId?: string | null;
  referralLinkId: string;
  tenantId: string;
  partnerId: string;
  contactId: string;
  dealId?: string | null;
  conversionValue: number;
  createdAt: string;
}
