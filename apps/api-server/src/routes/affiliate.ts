import { Hono } from 'hono';
import { 
  createCampaignSchema, 
  updateCampaignPolicySchema, 
  applyCampaignSchema,
  createReferralLinkSchema
} from '@partner-os/validation';
import type { AffiliateCampaign, ReferralLink } from '@partner-os/shared-types';
import { AffiliateStore } from '../state/affiliate-store';

export const affiliateRouter = new Hono();
const getStore = () => AffiliateStore.getInstance();

// 1. Get marketplace campaigns with filters
affiliateRouter.get('/campaigns/marketplace', async (c) => {
  const store = getStore();
  const search = c.req.query('search');
  const industry = c.req.query('industry');
  const commissionType = c.req.query('commissionType') as any;
  const minCommissionRate = c.req.query('minRate') ? Number(c.req.query('minRate')) : undefined;
  const tenantId = c.req.query('tenantId');

  const campaigns = store.getMarketplaceCampaigns({
    search,
    industry,
    commissionType,
    minCommissionRate,
    tenantId
  });

  return c.json({
    success: true,
    data: campaigns,
    total: campaigns.length,
    filtersApplied: { search, industry, commissionType, minCommissionRate }
  });
});

// 2. Get campaign details & policy versions
affiliateRouter.get('/campaigns/:id', async (c) => {
  const store = getStore();
  const id = c.req.param('id');
  const campaign = store.getCampaignById(id);

  if (!campaign) {
    return c.json({ success: false, error: 'Campaign not found' }, 404);
  }

  const versions = store.policyVersions.get(id) || [];

  return c.json({
    success: true,
    data: {
      ...campaign,
      policyVersions: versions
    }
  });
});

// 3. Create a new campaign (Tenant/Business action)
affiliateRouter.post('/campaigns', async (c) => {
  const store = getStore();
  const tenantId = c.req.header('x-tenant-id') || 'tenant-dental-01';
  const body = await c.req.json();
  const parsed = createCampaignSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu chiến dịch không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const now = new Date().toISOString();
  const newCampaign: AffiliateCampaign = {
    id: `camp-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    tenantName: body.tenantName || 'Doanh nghiệp đối tác',
    industry: body.industry || 'Khác',
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    commissionType: parsed.data.commissionType,
    commissionRate: parsed.data.commissionRate,
    cookieWindowDays: parsed.data.cookieWindowDays,
    minDealValue: parsed.data.minDealValue,
    termsAndConditions: body.termsAndConditions || 'Chính sách mặc định của đối tác.',
    policyVersion: 1,
    isPublicMarketplace: parsed.data.isPublicMarketplace,
    status: 'published',
    isActive: true,
    activePartnersCount: 0,
    totalConversionsCount: 0,
    totalCommissionsPaid: 0,
    createdAt: now,
    updatedAt: now
  };

  const created = store.createCampaign(newCampaign);

  return c.json({
    success: true,
    data: created,
    message: 'Tạo chiến dịch Affiliate thành công'
  }, 201);
});

// 4. Update campaign policy (creates immutable policy version)
affiliateRouter.put('/campaigns/:id/policy', async (c) => {
  const store = getStore();
  const campaignId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCampaignPolicySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu chính sách không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  try {
    const result = store.updateCampaignPolicy(campaignId, parsed.data);
    return c.json({
      success: true,
      data: result,
      message: `Cập nhật chính sách thành công (Phiên bản v${result.campaign.policyVersion})`
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 404);
  }
});

// 5. Partner applies to join campaign
affiliateRouter.post('/campaigns/:id/apply', async (c) => {
  const store = getStore();
  const campaignId = c.req.param('id');
  const partnerId = c.req.header('x-partner-id') || 'partner-001';
  const rawPartnerName = c.req.header('x-partner-name');
  const partnerName = rawPartnerName ? decodeURIComponent(rawPartnerName) : 'Nguyễn Văn Tuấn';
  const partnerEmail = c.req.header('x-partner-email') || 'partner@partneros.vn';

  const body = await c.req.json().catch(() => ({}));
  const parsed = applyCampaignSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu đăng ký không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  try {
    const result = store.registerPartnerToCampaign({
      campaignId,
      partnerId,
      partnerName,
      partnerEmail,
      applicationNote: parsed.data.applicationNote,
      policyVersionAgreed: parsed.data.policyVersionAgreed
    });

    return c.json({
      success: true,
      data: result,
      message: 'Đăng ký tham gia chiến dịch thành công và đã cấp link giới thiệu'
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 404);
  }
});

// 6. List campaigns joined by current partner
affiliateRouter.get('/my-campaigns', async (c) => {
  const store = getStore();
  const partnerId = c.req.header('x-partner-id') || 'partner-001';
  const registrations = store.getPartnerCampaigns(partnerId);

  return c.json({
    success: true,
    data: registrations
  });
});

// 7. Generate a new custom referral link
affiliateRouter.post('/links', async (c) => {
  const store = getStore();
  const partnerId = c.req.header('x-partner-id') || 'partner-001';
  const body = await c.req.json();
  const parsed = createReferralLinkSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu tạo link không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const campaign = store.getCampaignById(parsed.data.campaignId);
  if (!campaign) {
    return c.json({ success: false, error: 'Chiến dịch không tồn tại' }, 404);
  }

  const code = parsed.data.customSlug 
    ? `REF_${parsed.data.customSlug.toUpperCase()}`
    : `REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const destinationUrl = parsed.data.destinationUrl || `https://${campaign.tenantId}.partneros.vn/offer/${campaign.slug}`;
  const fullReferralUrl = `${destinationUrl}?ref=${code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullReferralUrl)}`;

  const link: ReferralLink = {
    id: crypto.randomUUID(),
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    tenantId: campaign.tenantId,
    partnerId,
    code,
    destinationUrl,
    fullReferralUrl,
    qrCodeUrl,
    clicksCount: 0,
    leadsCount: 0,
    conversionsCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  store.referralLinks.set(code, link);

  return c.json({
    success: true,
    data: link,
    message: 'Tạo link giới thiệu thành công'
  }, 201);
});

// 8. List partner's links and QR codes
affiliateRouter.get('/my-links', async (c) => {
  const store = getStore();
  const partnerId = c.req.header('x-partner-id') || 'partner-001';
  const links = store.getPartnerLinks(partnerId);

  return c.json({
    success: true,
    data: links
  });
});
