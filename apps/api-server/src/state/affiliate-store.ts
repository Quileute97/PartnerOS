import type {
  AffiliateCampaign,
  CampaignPolicyVersion,
  PartnerCampaignRegistration,
  ReferralLink,
  MarketplaceFilterOptions,
  TrackingClick,
  TrackingConversion,
  AttributionRecord,
  AttributionDecision
} from '@partner-os/shared-types';

export class AffiliateStore {
  private static instance: AffiliateStore;

  public campaigns: Map<string, AffiliateCampaign> = new Map();
  public policyVersions: Map<string, CampaignPolicyVersion[]> = new Map();
  public registrations: Map<string, PartnerCampaignRegistration> = new Map(); // key: `${campaignId}_${partnerId}`
  public referralLinks: Map<string, ReferralLink> = new Map(); // key: code
  public clicks: TrackingClick[] = [];
  public conversions: TrackingConversion[] = [];
  public attributionRecords: Map<string, AttributionRecord> = new Map(); // key: conversionId
  public idempotencyKeys: Map<string, any> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): AffiliateStore {
    if (!AffiliateStore.instance) {
      AffiliateStore.instance = new AffiliateStore();
    }
    return AffiliateStore.instance;
  }

  private seedInitialData() {
    // 1. Initial Campaigns
    const c1: AffiliateCampaign = {
      id: 'camp-1',
      tenantId: 'tenant-dental-01',
      tenantName: 'Nha Khoa SmileCare',
      industry: 'Nha khoa & Y tế',
      title: 'Giới thiệu khách hàng Trồng răng & Niềng răng SmileCare',
      slug: 'smilecare-dental-affiliate',
      description: 'Hoa hồng 10% trên tổng giá trị hợp đồng điều trị. Thanh toán định kỳ ngày 15 hàng tháng.',
      commissionType: 'percentage',
      commissionRate: 10,
      cookieWindowDays: 60,
      minDealValue: 5000000,
      termsAndConditions: 'Chi trả hoa hồng sau 15 ngày kể từ ngày thanh toán hoàn tất. Cookie bảo vệ nguồn 60 ngày.',
      policyVersion: 1,
      isPublicMarketplace: true,
      status: 'published',
      isActive: true,
      activePartnersCount: 14,
      totalConversionsCount: 48,
      totalCommissionsPaid: 168000000,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    };

    const c2: AffiliateCampaign = {
      id: 'camp-2',
      tenantId: 'tenant-re-02',
      tenantName: 'BĐS SkyLand',
      industry: 'Bất động sản',
      title: 'Môi giới BĐS Căn hộ cao cấp Vinhomes Grand View',
      slug: 'vinhomes-grand-view-affiliate',
      description: 'Hoa hồng cố định 50,000,000 VNĐ / căn hộ hoàn tất giao dịch đặt cọc hợp lệ.',
      commissionType: 'fixed_amount',
      commissionRate: 50000000,
      cookieWindowDays: 90,
      minDealValue: 1000000000,
      termsAndConditions: 'Hoa hồng chi trả sau khi hợp đồng mua bán được công chứng. Cookie bảo vệ nguồn 90 ngày.',
      policyVersion: 1,
      isPublicMarketplace: true,
      status: 'published',
      isActive: true,
      activePartnersCount: 8,
      totalConversionsCount: 6,
      totalCommissionsPaid: 300000000,
      createdAt: '2026-11-10T00:00:00Z',
      updatedAt: '2026-11-10T00:00:00Z'
    };

    const c3: AffiliateCampaign = {
      id: 'camp-3',
      tenantId: 'tenant-edu-03',
      tenantName: 'Học viện Oxford Star',
      industry: 'Giáo dục & Đào tạo',
      title: 'Giới thiệu học viên Luyện thi IELTS 7.5+ & Du học',
      slug: 'oxford-star-ielts-affiliate',
      description: 'Hoa hồng 15% trên học phí trọn khoá khi học viên ghi danh thành công.',
      commissionType: 'percentage',
      commissionRate: 15,
      cookieWindowDays: 45,
      minDealValue: 12000000,
      termsAndConditions: 'Hoa hồng chi trả vào ngày 20 hàng tháng. Áp dụng cho mọi chi nhánh toàn quốc.',
      policyVersion: 2,
      isPublicMarketplace: true,
      status: 'published',
      isActive: true,
      activePartnersCount: 22,
      totalConversionsCount: 75,
      totalCommissionsPaid: 210000000,
      createdAt: '2026-10-15T00:00:00Z',
      updatedAt: '2026-11-05T00:00:00Z'
    };

    const c4: AffiliateCampaign = {
      id: 'camp-4',
      tenantId: 'tenant-beauty-04',
      tenantName: 'Aura Beauty Clinic & Spa',
      industry: 'Thẩm mỹ & Làm đẹp',
      title: 'Giới thiệu khách hàng Gói Trẻ hoá Da & Nâng cơ Hifu',
      slug: 'aura-beauty-spa-affiliate',
      description: 'Hoa hồng 12% trên mọi hoá đơn điều trị thẩm mỹ công nghệ cao.',
      commissionType: 'percentage',
      commissionRate: 12,
      cookieWindowDays: 30,
      minDealValue: 3000000,
      termsAndConditions: 'Đối soát 2 tuần một lần. Không giới hạn số lượng khách hàng giới thiệu.',
      policyVersion: 1,
      isPublicMarketplace: true,
      status: 'published',
      isActive: true,
      activePartnersCount: 19,
      totalConversionsCount: 52,
      totalCommissionsPaid: 125000000,
      createdAt: '2026-11-12T00:00:00Z',
      updatedAt: '2026-11-12T00:00:00Z'
    };

    this.campaigns.set(c1.id, c1);
    this.campaigns.set(c2.id, c2);
    this.campaigns.set(c3.id, c3);
    this.campaigns.set(c4.id, c4);

    // 2. Policy Versions
    this.policyVersions.set(c1.id, [
      {
        id: 'policy-v1-camp-1',
        campaignId: c1.id,
        version: 1,
        commissionType: 'percentage',
        commissionRate: 10,
        cookieWindowDays: 60,
        minDealValue: 5000000,
        termsAndConditions: c1.termsAndConditions || '',
        effectiveFrom: '2026-11-01T00:00:00Z',
        effectiveTo: null,
        createdAt: '2026-11-01T00:00:00Z'
      }
    ]);

    this.policyVersions.set(c2.id, [
      {
        id: 'policy-v1-camp-2',
        campaignId: c2.id,
        version: 1,
        commissionType: 'fixed_amount',
        commissionRate: 50000000,
        cookieWindowDays: 90,
        minDealValue: 1000000000,
        termsAndConditions: c2.termsAndConditions || '',
        effectiveFrom: '2026-11-10T00:00:00Z',
        effectiveTo: null,
        createdAt: '2026-11-10T00:00:00Z'
      }
    ]);

    this.policyVersions.set(c3.id, [
      {
        id: 'policy-v1-camp-3',
        campaignId: c3.id,
        version: 1,
        commissionType: 'percentage',
        commissionRate: 12,
        cookieWindowDays: 30,
        minDealValue: 10000000,
        termsAndConditions: 'Chính sách v1 cũ',
        effectiveFrom: '2026-10-15T00:00:00Z',
        effectiveTo: '2026-11-05T00:00:00Z',
        createdAt: '2026-10-15T00:00:00Z'
      },
      {
        id: 'policy-v2-camp-3',
        campaignId: c3.id,
        version: 2,
        commissionType: 'percentage',
        commissionRate: 15,
        cookieWindowDays: 45,
        minDealValue: 12000000,
        termsAndConditions: c3.termsAndConditions || '',
        effectiveFrom: '2026-11-05T00:00:00Z',
        effectiveTo: null,
        createdAt: '2026-11-05T00:00:00Z'
      }
    ]);

    // 3. Initial Partner Registration for demo
    const reg1: PartnerCampaignRegistration = {
      id: 'reg-001',
      campaignId: c1.id,
      campaignTitle: c1.title,
      partnerId: 'partner-001',
      partnerName: 'Nguyễn Văn Tuấn',
      partnerEmail: 'tuan.nguyen@partneros.vn',
      tenantId: c1.tenantId,
      tenantName: c1.tenantName,
      policyVersionAgreed: 1,
      status: 'approved',
      referralLinkCode: 'REF_TUAN_VIP',
      createdAt: '2026-11-02T10:00:00Z',
      reviewedAt: '2026-11-02T10:15:00Z'
    };
    this.registrations.set(`${c1.id}_partner-001`, reg1);

    // 4. Initial Referral Link for partner-001
    const link1: ReferralLink = {
      id: 'link-001',
      campaignId: c1.id,
      campaignTitle: c1.title,
      tenantId: c1.tenantId,
      partnerId: 'partner-001',
      code: 'REF_TUAN_VIP',
      destinationUrl: 'https://smilecare.partneros.vn/booking',
      fullReferralUrl: 'https://smilecare.partneros.vn/booking?ref=REF_TUAN_VIP',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fsmilecare.partneros.vn%2Fbooking%3Fref%3DREF_TUAN_VIP',
      clicksCount: 348,
      leadsCount: 48,
      conversionsCount: 12,
      isActive: true,
      createdAt: '2026-11-02T10:15:00Z'
    };
    this.referralLinks.set('REF_TUAN_VIP', link1);
  }

  // --- Campaign Methods ---
  public getMarketplaceCampaigns(filters?: MarketplaceFilterOptions): AffiliateCampaign[] {
    let result = Array.from(this.campaigns.values()).filter(c => c.isPublicMarketplace && c.status === 'published');

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description?.toLowerCase().includes(q) || 
        c.tenantName?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q)
      );
    }

    if (filters?.industry && filters.industry !== 'all') {
      result = result.filter(c => c.industry === filters.industry);
    }

    if (filters?.commissionType) {
      result = result.filter(c => c.commissionType === filters.commissionType);
    }

    if (filters?.minCommissionRate !== undefined) {
      result = result.filter(c => c.commissionRate >= filters.minCommissionRate!);
    }

    if (filters?.tenantId) {
      result = result.filter(c => c.tenantId === filters.tenantId);
    }

    return result;
  }

  public getCampaignById(id: string): AffiliateCampaign | undefined {
    return this.campaigns.get(id);
  }

  public createCampaign(campaign: AffiliateCampaign): AffiliateCampaign {
    this.campaigns.set(campaign.id, campaign);
    
    // Store policy version 1
    const p1: CampaignPolicyVersion = {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      version: 1,
      commissionType: campaign.commissionType,
      commissionRate: campaign.commissionRate,
      cookieWindowDays: campaign.cookieWindowDays,
      minDealValue: campaign.minDealValue || 0,
      termsAndConditions: campaign.termsAndConditions || '',
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
      createdAt: new Date().toISOString()
    };
    this.policyVersions.set(campaign.id, [p1]);

    return campaign;
  }

  public updateCampaignPolicy(
    campaignId: string, 
    newPolicy: {
      commissionType: 'percentage' | 'fixed_amount';
      commissionRate: number;
      cookieWindowDays: number;
      minDealValue?: number;
      termsAndConditions?: string;
    }
  ): { campaign: AffiliateCampaign; policyVersion: CampaignPolicyVersion } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const versions = this.policyVersions.get(campaignId) || [];
    const now = new Date().toISOString();

    // Close out previous version
    if (versions.length > 0) {
      const last = versions[versions.length - 1];
      last.effectiveTo = now;
    }

    const nextVer = campaign.policyVersion + 1;
    const newVersionRecord: CampaignPolicyVersion = {
      id: crypto.randomUUID(),
      campaignId,
      version: nextVer,
      commissionType: newPolicy.commissionType,
      commissionRate: newPolicy.commissionRate,
      cookieWindowDays: newPolicy.cookieWindowDays,
      minDealValue: newPolicy.minDealValue || 0,
      termsAndConditions: newPolicy.termsAndConditions || campaign.termsAndConditions || '',
      effectiveFrom: now,
      effectiveTo: null,
      createdAt: now
    };

    versions.push(newVersionRecord);
    this.policyVersions.set(campaignId, versions);

    campaign.commissionType = newPolicy.commissionType;
    campaign.commissionRate = newPolicy.commissionRate;
    campaign.cookieWindowDays = newPolicy.cookieWindowDays;
    if (newPolicy.minDealValue !== undefined) campaign.minDealValue = newPolicy.minDealValue;
    if (newPolicy.termsAndConditions !== undefined) campaign.termsAndConditions = newPolicy.termsAndConditions;
    campaign.policyVersion = nextVer;
    campaign.updatedAt = now;

    return { campaign, policyVersion: newVersionRecord };
  }

  // --- Partner Registration & Applications ---
  public registerPartnerToCampaign(params: {
    campaignId: string;
    partnerId: string;
    partnerName?: string;
    partnerEmail?: string;
    applicationNote?: string;
    policyVersionAgreed?: number;
  }): { registration: PartnerCampaignRegistration; referralLink: ReferralLink } {
    const campaign = this.campaigns.get(params.campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${params.campaignId} not found`);
    }

    const regKey = `${params.campaignId}_${params.partnerId}`;
    const now = new Date().toISOString();

    // Auto-approve partner and generate unique link
    const code = `REF_${params.partnerName ? params.partnerName.split(' ').pop()?.toUpperCase() : 'PARTNER'}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const destinationUrl = `https://${campaign.tenantId}.partneros.vn/offer/${campaign.slug}`;
    const fullReferralUrl = `${destinationUrl}?ref=${code}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullReferralUrl)}`;

    const referralLink: ReferralLink = {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      tenantId: campaign.tenantId,
      partnerId: params.partnerId,
      code,
      destinationUrl,
      fullReferralUrl,
      qrCodeUrl,
      clicksCount: 0,
      leadsCount: 0,
      conversionsCount: 0,
      isActive: true,
      createdAt: now
    };
    this.referralLinks.set(code, referralLink);

    const registration: PartnerCampaignRegistration = {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      partnerId: params.partnerId,
      partnerName: params.partnerName || 'Đối tác PartnerOS',
      partnerEmail: params.partnerEmail,
      tenantId: campaign.tenantId,
      tenantName: campaign.tenantName,
      policyVersionAgreed: params.policyVersionAgreed || campaign.policyVersion,
      applicationNote: params.applicationNote,
      status: 'approved',
      referralLinkCode: code,
      createdAt: now,
      reviewedAt: now
    };
    this.registrations.set(regKey, registration);

    // Update active partners count
    campaign.activePartnersCount = (campaign.activePartnersCount || 0) + 1;

    return { registration, referralLink };
  }

  public getPartnerCampaigns(partnerId: string): PartnerCampaignRegistration[] {
    return Array.from(this.registrations.values()).filter(r => r.partnerId === partnerId);
  }

  public getPartnerLinks(partnerId: string): ReferralLink[] {
    return Array.from(this.referralLinks.values()).filter(l => l.partnerId === partnerId);
  }

  public getReferralLinkByCode(code: string): ReferralLink | undefined {
    return this.referralLinks.get(code);
  }

  // --- Tracking & Attribution Engine ---
  public recordClick(payload: {
    referralCode: string;
    sessionId?: string;
    landingPageUrl: string;
    referrerUrl?: string | null;
    userAgent?: string;
    deviceFingerprint?: string;
    clientIp?: string;
  }): { click: TrackingClick; referralLink: ReferralLink } {
    const link = this.referralLinks.get(payload.referralCode);
    if (!link) {
      throw new Error(`Referral code '${payload.referralCode}' does not exist`);
    }

    if (!link.isActive) {
      throw new Error(`Referral code '${payload.referralCode}' is inactive`);
    }

    const sessionId = payload.sessionId || crypto.randomUUID();
    const clickId = crypto.randomUUID();
    const now = new Date().toISOString();

    const click: TrackingClick = {
      id: clickId,
      referralLinkId: link.id,
      referralCode: link.code,
      tenantId: link.tenantId,
      partnerId: link.partnerId,
      campaignId: link.campaignId,
      sessionId,
      ipHash: hashSync(payload.clientIp || '127.0.0.1'),
      userAgent: payload.userAgent,
      referer: payload.referrerUrl || undefined,
      landingPage: payload.landingPageUrl,
      deviceFingerprint: payload.deviceFingerprint,
      createdAt: now
    };

    this.clicks.push(click);
    link.clicksCount += 1;

    return { click, referralLink: link };
  }

  public attributeConversion(payload: {
    referralCode?: string;
    sessionId?: string;
    tenantId?: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    dealValue?: number;
    dealTitle?: string;
    idempotencyKey?: string;
  }): { conversion: TrackingConversion; attribution: AttributionDecision } {
    const now = new Date().toISOString();
    const dealValue = payload.dealValue || 0;

    // Check Idempotency Replay
    if (payload.idempotencyKey && this.idempotencyKeys.has(payload.idempotencyKey)) {
      return this.idempotencyKeys.get(payload.idempotencyKey);
    }

    // Determine Attribution Target:
    // Priority 1: Explicit referral code
    // Priority 2: SessionId lookup in clicks history (Last-Click model)
    let candidateClick: TrackingClick | undefined;
    let referralLink: ReferralLink | undefined;

    if (payload.referralCode) {
      referralLink = this.referralLinks.get(payload.referralCode);
      // Find latest click matching this code
      for (let i = this.clicks.length - 1; i >= 0; i--) {
        if (this.clicks[i].referralCode === payload.referralCode) {
          candidateClick = this.clicks[i];
          break;
        }
      }
    } else if (payload.sessionId) {
      for (let i = this.clicks.length - 1; i >= 0; i--) {
        if (this.clicks[i].sessionId === payload.sessionId) {
          candidateClick = this.clicks[i];
          referralLink = Array.from(this.referralLinks.values()).find(l => l.id === candidateClick!.referralLinkId);
          break;
        }
      }
    }

    const conversionId = crypto.randomUUID();
    const tenantId = payload.tenantId || referralLink?.tenantId || 'tenant-dental-01';

    // Scenario A: No Referral Link or Click found -> Organic Conversion
    if (!referralLink) {
      const organicDecision: AttributionDecision = {
        conversionId,
        status: 'organic',
        model: 'last_click',
        referralCode: null,
        attributedPartnerId: null,
        attributedPartnerName: null,
        campaignId: null,
        campaignTitle: null,
        clickId: null,
        clickedAt: null,
        convertedAt: now,
        cookieWindowDays: 0,
        timeToConversionHours: null,
        commissionRate: 0,
        commissionType: null,
        calculatedCommission: 0,
        explanation: 'Khách hàng tiếp cận trực tiếp (Organic). Không tìm thấy mã giới thiệu hoặc click session hợp lệ.'
      };

      const conversion: TrackingConversion = {
        id: conversionId,
        clickId: null,
        referralLinkId: null,
        referralCode: null,
        tenantId,
        partnerId: null,
        contactId: `contact-${crypto.randomUUID().substring(0, 8)}`,
        dealId: `deal-${crypto.randomUUID().substring(0, 8)}`,
        conversionValue: dealValue,
        createdAt: now
      };

      this.conversions.push(conversion);
      this.attributionRecords.set(conversionId, {
        id: crypto.randomUUID(),
        tenantId,
        conversionId,
        contactId: conversion.contactId,
        dealId: conversion.dealId,
        partnerId: null,
        campaignId: null,
        clickId: null,
        referralCode: null,
        model: 'last_click',
        decision: organicDecision,
        createdAt: now
      });

      const res = { conversion, attribution: organicDecision };
      if (payload.idempotencyKey) this.idempotencyKeys.set(payload.idempotencyKey, res);
      return res;
    }

    // Scenario B: Referral Link found -> Evaluate Campaign & Cookie Window
    const campaign = this.campaigns.get(referralLink.campaignId);
    const cookieWindowDays = campaign?.cookieWindowDays || 60;
    
    let isExpired = false;
    let timeToConversionHours: number | null = null;

    if (candidateClick) {
      const clickTime = new Date(candidateClick.createdAt).getTime();
      const convTime = new Date(now).getTime();
      timeToConversionHours = Math.max(0, Math.round((convTime - clickTime) / (1000 * 3600)));
      const daysElapsed = timeToConversionHours / 24;
      if (daysElapsed > cookieWindowDays) {
        isExpired = true;
      }
    }

    // If expired cookie window:
    if (isExpired) {
      const expiredDecision: AttributionDecision = {
        conversionId,
        status: 'expired_window',
        model: 'last_click',
        referralCode: referralLink.code,
        attributedPartnerId: referralLink.partnerId,
        attributedPartnerName: 'Đối tác giới thiệu',
        campaignId: campaign?.id,
        campaignTitle: campaign?.title,
        clickId: candidateClick?.id,
        clickedAt: candidateClick?.createdAt,
        convertedAt: now,
        cookieWindowDays,
        timeToConversionHours,
        commissionRate: 0,
        commissionType: campaign?.commissionType,
        calculatedCommission: 0,
        explanation: `Lượt click diễn ra ${timeToConversionHours} giờ trước, đã vượt quá thời hạn cookie window bảo vệ (${cookieWindowDays} ngày). Giao dịch chuyển sang ghi nhận Organic.`
      };

      const conversion: TrackingConversion = {
        id: conversionId,
        clickId: candidateClick?.id || null,
        referralLinkId: referralLink.id,
        referralCode: referralLink.code,
        tenantId,
        partnerId: referralLink.partnerId,
        contactId: `contact-${crypto.randomUUID().substring(0, 8)}`,
        dealId: `deal-${crypto.randomUUID().substring(0, 8)}`,
        conversionValue: dealValue,
        createdAt: now
      };

      this.conversions.push(conversion);
      this.attributionRecords.set(conversionId, {
        id: crypto.randomUUID(),
        tenantId,
        conversionId,
        contactId: conversion.contactId,
        dealId: conversion.dealId,
        partnerId: referralLink.partnerId,
        campaignId: campaign?.id,
        clickId: candidateClick?.id,
        referralCode: referralLink.code,
        model: 'last_click',
        decision: expiredDecision,
        createdAt: now
      });

      const res = { conversion, attribution: expiredDecision };
      if (payload.idempotencyKey) this.idempotencyKeys.set(payload.idempotencyKey, res);
      return res;
    }

    // Scenario C: Valid Attribution within Cookie Window
    let calculatedCommission = 0;
    const rate = campaign?.commissionRate || 10;
    const type = campaign?.commissionType || 'percentage';

    if (type === 'percentage') {
      calculatedCommission = Math.round((dealValue * rate) / 100);
    } else {
      calculatedCommission = rate;
    }

    // Check minDealValue constraint
    if (campaign?.minDealValue && dealValue < campaign.minDealValue) {
      calculatedCommission = 0;
    }

    const attributedDecision: AttributionDecision = {
      conversionId,
      status: 'attributed',
      model: 'last_click',
      referralCode: referralLink.code,
      attributedPartnerId: referralLink.partnerId,
      attributedPartnerName: 'Nguyễn Văn Tuấn',
      campaignId: campaign?.id,
      campaignTitle: campaign?.title,
      clickId: candidateClick?.id || null,
      clickedAt: candidateClick?.createdAt || now,
      convertedAt: now,
      cookieWindowDays,
      timeToConversionHours: timeToConversionHours ?? 0,
      commissionRate: rate,
      commissionType: type,
      calculatedCommission,
      explanation: `Quy kết thành công cho đối tác theo mô hình Last-Click. Click ghi nhận hợp lệ trong thời hạn cookie (${cookieWindowDays} ngày). Hoa hồng tính theo Policy v${campaign?.policyVersion || 1}: ${rate}${type === 'percentage' ? '%' : ' VNĐ'} = ${calculatedCommission.toLocaleString('vi-VN')} VNĐ.`
    };

    const conversion: TrackingConversion = {
      id: conversionId,
      clickId: candidateClick?.id || null,
      referralLinkId: referralLink.id,
      referralCode: referralLink.code,
      tenantId,
      partnerId: referralLink.partnerId,
      contactId: `contact-${crypto.randomUUID().substring(0, 8)}`,
      dealId: `deal-${crypto.randomUUID().substring(0, 8)}`,
      conversionValue: dealValue,
      createdAt: now
    };

    this.conversions.push(conversion);
    referralLink.conversionsCount += 1;
    referralLink.leadsCount += 1;

    if (campaign) {
      campaign.totalConversionsCount = (campaign.totalConversionsCount || 0) + 1;
    }

    this.attributionRecords.set(conversionId, {
      id: crypto.randomUUID(),
      tenantId,
      conversionId,
      contactId: conversion.contactId,
      dealId: conversion.dealId,
      partnerId: referralLink.partnerId,
      campaignId: campaign?.id,
      clickId: candidateClick?.id,
      referralCode: referralLink.code,
      model: 'last_click',
      decision: attributedDecision,
      createdAt: now
    });

    const res = { conversion, attribution: attributedDecision };
    if (payload.idempotencyKey) this.idempotencyKeys.set(payload.idempotencyKey, res);
    return res;
  }

  public getAttributionExplanation(conversionId: string): AttributionRecord | undefined {
    return this.attributionRecords.get(conversionId);
  }
}

function hashSync(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
