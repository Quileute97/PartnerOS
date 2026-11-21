import { Hono } from 'hono';

export const riskRouter = new Hono();

interface FraudSignal {
  id: string;
  tenantId: string;
  partnerId: string;
  conversionId?: string;
  signalType: 'self_referral' | 'ip_collision' | 'fingerprint_collision' | 'velocity_spike';
  riskScore: number;
  details: Record<string, any>;
  createdAt: string;
}

interface FraudCase {
  id: string;
  tenantId: string;
  partnerId: string;
  conversionId?: string;
  commissionId?: string;
  riskScore: number;
  status: 'investigating' | 'confirmed_fraud' | 'cleared' | 'appealed';
  reasons: string[];
  investigationNotes?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
}

interface Verification {
  id: string;
  entityType: 'partner' | 'business';
  entityId: string;
  idType: 'cccd' | 'passport' | 'business_license' | 'tax_certificate';
  idNumber: string;
  documentUrls: string[];
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
}

const fraudSignalsStore: FraudSignal[] = [];
const fraudCasesStore: Map<string, FraudCase> = new Map([
  ['case-01', {
    id: 'case-01',
    tenantId: 'tenant-dental-01',
    partnerId: 'partner-suspicious-01',
    riskScore: 85,
    status: 'investigating',
    reasons: ['Tự giới thiệu chính mình (Self-referral: Trùng số điện thoại 0912345678)'],
    investigationNotes: 'Hệ thống tự động phát hiện số điện thoại khách hàng trùng 100% với số đăng ký CTV.',
    createdAt: '2026-11-20T12:00:00Z'
  }]
]);

const verificationsStore: Map<string, Verification> = new Map([
  ['ver-01', {
    id: 'ver-01',
    entityType: 'partner',
    entityId: 'partner-001',
    idType: 'cccd',
    idNumber: '001095012345',
    documentUrls: ['https://storage.partneros.vn/kyc/cccd_front.jpg', 'https://storage.partneros.vn/kyc/cccd_back.jpg'],
    status: 'verified',
    reviewedAt: '2026-11-15T09:00:00Z',
    reviewedBy: 'operator-compliance',
    createdAt: '2026-11-14T15:00:00Z'
  }]
]);

// 1. Evaluate Conversion Risk (Anti-Fraud Engine)
riskRouter.post('/evaluate', async (c) => {
  const body = await c.req.json();
  const {
    tenantId = 'tenant-dental-01',
    partnerId,
    partnerPhone,
    partnerEmail,
    customerPhone,
    customerEmail,
    clickIp,
    conversionIp,
    deviceFingerprintClick,
    deviceFingerprintConversion,
    conversionId
  } = body;

  const signals: FraudSignal[] = [];
  const reasons: string[] = [];
  let totalRiskScore = 0;

  // Rule 1: Self-referral detection (Trùng SĐT hoặc Email)
  if (partnerPhone && customerPhone && partnerPhone === customerPhone) {
    signals.push({
      id: crypto.randomUUID(),
      tenantId,
      partnerId,
      conversionId,
      signalType: 'self_referral',
      riskScore: 60,
      details: { partnerPhone, customerPhone },
      createdAt: new Date().toISOString()
    });
    totalRiskScore += 60;
    reasons.push('Tự giới thiệu chính mình: Trùng số điện thoại đăng ký CTV');
  }

  if (partnerEmail && customerEmail && partnerEmail.toLowerCase() === customerEmail.toLowerCase()) {
    signals.push({
      id: crypto.randomUUID(),
      tenantId,
      partnerId,
      conversionId,
      signalType: 'self_referral',
      riskScore: 50,
      details: { partnerEmail, customerEmail },
      createdAt: new Date().toISOString()
    });
    totalRiskScore += 50;
    reasons.push('Tự giới thiệu chính mình: Trùng địa chỉ email');
  }

  // Rule 2: IP Collision (Click và Chuyển đổi cùng IP từ thiết bị đối tác)
  if (clickIp && conversionIp && clickIp === conversionIp && clickIp !== '127.0.0.1') {
    signals.push({
      id: crypto.randomUUID(),
      tenantId,
      partnerId,
      conversionId,
      signalType: 'ip_collision',
      riskScore: 35,
      details: { clickIp, conversionIp },
      createdAt: new Date().toISOString()
    });
    totalRiskScore += 35;
    reasons.push('Trùng địa chỉ IP click và IP đặt hàng (IP Collision)');
  }

  // Rule 3: Device Fingerprint Collision
  if (deviceFingerprintClick && deviceFingerprintConversion && deviceFingerprintClick === deviceFingerprintConversion) {
    signals.push({
      id: crypto.randomUUID(),
      tenantId,
      partnerId,
      conversionId,
      signalType: 'fingerprint_collision',
      riskScore: 30,
      details: { deviceFingerprintClick },
      createdAt: new Date().toISOString()
    });
    totalRiskScore += 30;
    reasons.push('Trùng mã dấu vết thiết bị (Device Fingerprint collision)');
  }

  // Cap risk score at 100
  const finalRiskScore = Math.min(100, totalRiskScore);
  const isHighRisk = finalRiskScore >= 70;
  const isSuspicious = finalRiskScore >= 40 && finalRiskScore < 70;

  // Save detected signals
  fraudSignalsStore.push(...signals);

  // If high risk, automatically create an active fraud case
  let fraudCase: FraudCase | undefined;
  if (isHighRisk && partnerId) {
    fraudCase = {
      id: `case-${crypto.randomUUID().substring(0, 8)}`,
      tenantId,
      partnerId,
      conversionId,
      commissionId: body.commissionId,
      riskScore: finalRiskScore,
      status: 'investigating',
      reasons,
      investigationNotes: 'Hệ thống tự động mở hồ sơ điều tra và tạm giữ hoa hồng do vượt ngưỡng rủi ro 70 điểm.',
      createdAt: new Date().toISOString()
    };
    fraudCasesStore.set(fraudCase.id, fraudCase);
  }

  return c.json({
    success: true,
    data: {
      riskScore: finalRiskScore,
      status: isHighRisk ? 'HIGH_RISK_HELD' : isSuspicious ? 'SUSPICIOUS_FLAGGED' : 'CLEARED',
      isHoldRecommended: isHighRisk,
      signalsCount: signals.length,
      reasons,
      fraudCaseId: fraudCase?.id || null
    }
  });
});

// 2. List Fraud Cases
riskRouter.get('/fraud-cases', async (c) => {
  const cases = Array.from(fraudCasesStore.values());
  return c.json({
    success: true,
    data: cases,
    total: cases.length
  });
});

// 3. Resolve Fraud Case (Operator action)
riskRouter.post('/fraud-cases/:id/resolve', async (c) => {
  const caseId = c.req.param('id');
  const body = await c.req.json();
  const operatorId = c.req.header('x-user-id') || 'operator-compliance';

  const fraudCase = fraudCasesStore.get(caseId);
  if (!fraudCase) {
    return c.json({ success: false, error: 'Fraud case not found' }, 404);
  }

  if (body.decision !== 'confirmed_fraud' && body.decision !== 'cleared') {
    return c.json({ success: false, error: 'decision must be confirmed_fraud or cleared' }, 400);
  }

  fraudCase.status = body.decision;
  fraudCase.investigationNotes = body.notes || fraudCase.investigationNotes;
  fraudCase.resolvedAt = new Date().toISOString();
  fraudCase.resolvedBy = operatorId;

  return c.json({
    success: true,
    data: fraudCase,
    message: body.decision === 'confirmed_fraud' 
      ? 'Đã xác nhận vi phạm gian lận: Hoa hồng bị huỷ bỏ vĩnh viễn' 
      : 'Đã giải phóng nghi vấn gian lận: Hoa hồng được mở khóa'
  });
});

// 4. Submit Identity Verification (KYC / KYB)
riskRouter.post('/verifications/submit', async (c) => {
  const body = await c.req.json();
  const entityId = c.req.header('x-entity-id') || body.entityId || 'partner-001';

  if (!body.idNumber || !body.idType) {
    return c.json({ success: false, error: 'idType và idNumber là các trường bắt buộc' }, 400);
  }

  const ver: Verification = {
    id: `ver-${crypto.randomUUID().substring(0, 8)}`,
    entityType: body.entityType || 'partner',
    entityId,
    idType: body.idType,
    idNumber: body.idNumber,
    documentUrls: body.documentUrls || ['https://storage.partneros.vn/kyc/default.jpg'],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  verificationsStore.set(ver.id, ver);

  return c.json({
    success: true,
    data: ver,
    message: 'Nộp hồ sơ định danh thành công. Bộ phận Compliance sẽ duyệt trong vòng 24h.'
  }, 201);
});

// 5. List Verifications
riskRouter.get('/verifications', async (c) => {
  const list = Array.from(verificationsStore.values());
  return c.json({
    success: true,
    data: list,
    total: list.length
  });
});

// 6. Review Verification (Operator action)
riskRouter.post('/verifications/:id/review', async (c) => {
  const verId = c.req.param('id');
  const body = await c.req.json();
  const operatorId = c.req.header('x-user-id') || 'operator-compliance';

  const ver = verificationsStore.get(verId);
  if (!ver) {
    return c.json({ success: false, error: 'Verification record not found' }, 404);
  }

  if (body.status !== 'verified' && body.status !== 'rejected') {
    return c.json({ success: false, error: 'status must be verified or rejected' }, 400);
  }

  ver.status = body.status;
  ver.rejectionReason = body.rejectionReason;
  ver.reviewedAt = new Date().toISOString();
  ver.reviewedBy = operatorId;

  return c.json({
    success: true,
    data: ver,
    message: body.status === 'verified' ? 'Duyệt định danh thành công' : 'Từ chối định danh'
  });
});
