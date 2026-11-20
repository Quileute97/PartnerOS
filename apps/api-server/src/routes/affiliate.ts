import { Hono } from 'hono';
import type { AffiliateCampaign, ReferralLink } from '@partner-os/shared-types';

export const affiliateRouter = new Hono();

// Get public marketplace campaigns for collaborators
affiliateRouter.get('/campaigns/marketplace', async (c) => {
  const campaigns: AffiliateCampaign[] = [
    {
      id: 'camp-1',
      tenantId: 'tenant-dental-01',
      title: 'Giới thiệu khách hàng Trồng răng & Niềng răng SmileCare',
      slug: 'smilecare-dental-affiliate',
      description: 'Hoa hồng 10% trên tổng giá trị hợp đồng điều trị. Thanh toán định kỳ ngày 15 hàng tháng.',
      commissionType: 'percentage',
      commissionRate: 10,
      cookieWindowDays: 60,
      minDealValue: 5000000,
      isPublicMarketplace: true,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'camp-2',
      tenantId: 'tenant-re-02',
      title: 'Môi giới BĐS Căn hộ cao cấp Vinhomes Grand View',
      slug: 'vinhomes-grand-view-affiliate',
      description: 'Hoa hồng 1.5% giá trị giao dịch căn hộ hoặc cố định 50,000,000 VNĐ / căn hoàn tất.',
      commissionType: 'fixed_amount',
      commissionRate: 50000000,
      cookieWindowDays: 90,
      isPublicMarketplace: true,
      isActive: true,
      createdAt: '2026-11-10T00:00:00Z',
      updatedAt: '2026-11-10T00:00:00Z'
    }
  ];

  return c.json({ success: true, data: campaigns });
});

// Partner joins campaign & gets unique referral link + QR
affiliateRouter.post('/campaigns/:campaignId/join', async (c) => {
  const campaignId = c.req.param('campaignId');
  const partnerId = c.req.header('x-partner-id') || 'partner-current';

  const code = `REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const referralLink: ReferralLink = {
    id: crypto.randomUUID(),
    campaignId,
    tenantId: 'tenant-demo',
    partnerId,
    code,
    destinationUrl: 'https://smilecare.partneros.vn/booking',
    fullReferralUrl: `https://smilecare.partneros.vn/booking?ref=${code}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://smilecare.partneros.vn/booking?ref=${code}`)}`,
    clicksCount: 0,
    leadsCount: 0,
    conversionsCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  return c.json({ success: true, data: referralLink });
});
