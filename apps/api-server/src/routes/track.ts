import { Hono } from 'hono';
import { trackClickSchema, trackConversionSchema } from '@partner-os/validation';
import { AffiliateStore } from '../state/affiliate-store';

export const trackRouter = new Hono();
const store = AffiliateStore.getInstance();

// 1. Record a click on a partner referral link
trackRouter.post('/click', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = trackClickSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu click tracking không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const userAgent = c.req.header('user-agent') || parsed.data.userAgent || '';
  const referer = c.req.header('referer') || parsed.data.referrerUrl || '';

  try {
    const { click, referralLink } = store.recordClick({
      referralCode: parsed.data.referralCode,
      sessionId: parsed.data.sessionId,
      landingPageUrl: parsed.data.landingPageUrl,
      referrerUrl: referer,
      userAgent,
      deviceFingerprint: parsed.data.deviceFingerprint,
      clientIp
    });

    return c.json({
      success: true,
      data: {
        clickId: click.id,
        sessionId: click.sessionId,
        referralCode: click.referralCode,
        campaignId: click.campaignId,
        destinationUrl: referralLink.destinationUrl,
        trackedAt: click.createdAt
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 404);
  }
});

// 2. Record a conversion with deterministic attribution
trackRouter.post('/conversion', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = trackConversionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: 'Dữ liệu chuyển đổi (conversion) không hợp lệ',
      details: parsed.error.flatten().fieldErrors
    }, 400);
  }

  const result = store.attributeConversion({
    referralCode: parsed.data.referralCode,
    sessionId: parsed.data.sessionId,
    tenantId: parsed.data.tenantId,
    contactName: parsed.data.contactName,
    contactPhone: parsed.data.contactPhone,
    contactEmail: parsed.data.contactEmail,
    dealValue: parsed.data.dealValue,
    dealTitle: parsed.data.dealTitle,
    idempotencyKey: parsed.data.idempotencyKey
  });

  return c.json({
    success: true,
    data: {
      conversionId: result.conversion.id,
      contactId: result.conversion.contactId,
      dealId: result.conversion.dealId,
      status: result.attribution.status,
      model: result.attribution.model,
      referralCode: result.attribution.referralCode,
      attributedPartnerId: result.attribution.attributedPartnerId,
      attributedPartnerName: result.attribution.attributedPartnerName,
      campaignId: result.attribution.campaignId,
      campaignTitle: result.attribution.campaignTitle,
      dealValue: result.conversion.conversionValue,
      calculatedCommission: result.attribution.calculatedCommission,
      timeToConversionHours: result.attribution.timeToConversionHours,
      cookieWindowDays: result.attribution.cookieWindowDays,
      explanation: result.attribution.explanation,
      createdAt: result.conversion.createdAt
    }
  });
});

// 3. Explain attribution for a conversion
trackRouter.get('/attribution/:conversionId/explain', async (c) => {
  const conversionId = c.req.param('conversionId');
  const record = store.getAttributionExplanation(conversionId);

  if (!record) {
    return c.json({
      success: false,
      error: 'Không tìm thấy hồ sơ quy kết (attribution record) cho mã chuyển đổi này'
    }, 404);
  }

  return c.json({
    success: true,
    data: record
  });
});
