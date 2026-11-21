import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('🚀 [PHASE 5 TEST SUITE] Starting Trust, Risk & Fraud Prevention Tests...\n');

  // 1. Evaluate normal low-risk conversion
  {
    console.log('👉 Test 1: Evaluate Normal Low-Risk Conversion');
    const res = await app.request('/api/v1/risk/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: 'partner-clean-01',
        partnerPhone: '0988111222',
        customerPhone: '0912999888',
        clickIp: '113.161.45.89',
        conversionIp: '14.241.12.33',
        deviceFingerprintClick: 'fp_iphone_123',
        deviceFingerprintConversion: 'fp_windows_456'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.data.status, 'CLEARED');
    assert.strictEqual(body.data.isHoldRecommended, false);
    assert.strictEqual(body.data.riskScore, 0);
    console.log('   ✔ Clean transaction cleared with Risk Score = 0');
  }

  // 2. Detect Self-Referral Fraud (Customer phone matches partner phone)
  let detectedFraudCaseId: string = '';
  {
    console.log('\n👉 Test 2: Detect Self-Referral Fraud & Auto-Open Investigation Case');
    const res = await app.request('/api/v1/risk/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: 'partner-fraud-01',
        partnerPhone: '0903123456',
        customerPhone: '0903123456', // MATCHES! Self-referral
        partnerEmail: 'test@fraud.com',
        customerEmail: 'test@fraud.com',
        clickIp: '118.69.10.1',
        conversionIp: '118.69.10.1' // IP collision
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.data.status, 'HIGH_RISK_HELD');
    assert.strictEqual(body.data.isHoldRecommended, true);
    assert.ok(body.data.riskScore >= 70);
    assert.ok(body.data.fraudCaseId, 'Must auto-create fraud case');
    detectedFraudCaseId = body.data.fraudCaseId;
    console.log(`   ✔ High risk detected (Score: ${body.data.riskScore}/100), opened case ${detectedFraudCaseId}`);
  }

  // 3. Operator Resolves Fraud Case
  {
    console.log('\n👉 Test 3: Operator Reviews & Resolves Fraud Case');
    const res = await app.request(`/api/v1/risk/fraud-cases/${detectedFraudCaseId}/resolve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'operator-senior-compliance'
      },
      body: JSON.stringify({
        decision: 'confirmed_fraud',
        notes: 'Xác minh qua lịch sử cuộc gọi: Số điện thoại CTV và người mua là cùng một người. Hủy toàn bộ hoa hồng.'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.data.status, 'confirmed_fraud');
    console.log('   ✔ Fraud confirmed and action logged by operator');
  }

  // 4. Submit and Review KYC Verification
  {
    console.log('\n👉 Test 4: Partner Identity Verification (KYC)');
    const resSubmit = await app.request('/api/v1/risk/verifications/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-entity-id': 'partner-kyc-01' },
      body: JSON.stringify({
        entityType: 'partner',
        idType: 'cccd',
        idNumber: '001099887766'
      })
    });
    assert.strictEqual(resSubmit.status, 201);
    const bodySubmit = await resSubmit.json<any>();
    assert.strictEqual(bodySubmit.data.status, 'pending');

    const resReview = await app.request(`/api/v1/risk/verifications/${bodySubmit.data.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'verified' })
    });
    assert.strictEqual(resReview.status, 200);
    const bodyReview = await resReview.json<any>();
    assert.strictEqual(bodyReview.data.status, 'verified');
    console.log('   ✔ Partner KYC submitted and approved successfully');
  }

  console.log('\n🎉 [PHASE 5 TEST SUITE] ALL TRUST & RISK TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 5 Test Suite Failed:', err);
  process.exit(1);
});
