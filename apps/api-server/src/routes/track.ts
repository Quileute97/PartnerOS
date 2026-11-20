import { Hono } from 'hono';
import type { TrackingClickPayload, TrackingConversionPayload } from '@partner-os/shared-types';

export const trackRouter = new Hono();

// Record a click on a partner referral link
trackRouter.post('/click', async (c) => {
  const body = await c.req.json<TrackingClickPayload>();
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const userAgent = c.req.header('user-agent') || '';
  const referer = c.req.header('referer') || body.referrerUrl || '';

  if (!body.referralCode) {
    return c.json({ success: false, error: 'referralCode is required' }, 400);
  }

  // Generate a tracking session ID if not already provided
  const sessionId = body.sessionId || crypto.randomUUID();

  // In production, insert into Supabase tracking_clicks table
  const trackingRecord = {
    id: crypto.randomUUID(),
    referralCode: body.referralCode,
    sessionId,
    ipHash: await hashString(clientIp),
    userAgent,
    referer,
    landingPage: body.landingPageUrl,
    deviceFingerprint: body.deviceFingerprint,
    createdAt: new Date().toISOString()
  };

  return c.json({
    success: true,
    data: {
      sessionId,
      referralCode: body.referralCode,
      trackedAt: trackingRecord.createdAt
    }
  });
});

// Record a conversion (lead submission or purchase)
trackRouter.post('/conversion', async (c) => {
  const body = await c.req.json<TrackingConversionPayload>();

  if (!body.contactPhone && !body.contactEmail) {
    return c.json({ success: false, error: 'Either phone or email is required for customer identification' }, 400);
  }

  // Attribution resolution logic:
  // 1. Check if referralCode is explicitly passed
  // 2. Or query last click matching sessionId
  // 3. Or query existing contact in CRM for prior attribution
  const attributedPartnerCode = body.referralCode || 'DIRECT';

  const conversionId = crypto.randomUUID();

  return c.json({
    success: true,
    data: {
      conversionId,
      attributedCode: attributedPartnerCode,
      status: 'attributed',
      recordedAt: new Date().toISOString()
    }
  });
});

async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
