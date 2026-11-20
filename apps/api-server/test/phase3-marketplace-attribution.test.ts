import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('🚀 [PHASE 3 TEST SUITE] Starting Affiliate Marketplace & Attribution Engine Tests...\n');

  // -------------------------------------------------------------
  // TEST 1: Marketplace Campaigns Discovery & Industry Filtering
  // -------------------------------------------------------------
  {
    console.log('👉 Test 1: Marketplace Discovery & Multi-Industry Filtering');
    
    // 1.1 Fetch all marketplace campaigns
    const resAll = await app.request('/api/v1/affiliate/campaigns/marketplace', { method: 'GET' });
    assert.strictEqual(resAll.status, 200);
    const bodyAll = await resAll.json<any>();
    assert.strictEqual(bodyAll.success, true);
    assert.ok(bodyAll.data.length >= 4, 'Marketplace should contain initial seed campaigns');
    console.log(`   ✔ Retrieved ${bodyAll.data.length} marketplace campaigns successfully`);

    // 1.2 Filter by Industry: 'Nha khoa & Y tế'
    const resDental = await app.request('/api/v1/affiliate/campaigns/marketplace?industry=Nha%20khoa%20%26%20Y%20t%E1%BA%BF', { method: 'GET' });
    const bodyDental = await resDental.json<any>();
    assert.ok(bodyDental.data.length >= 1);
    assert.ok(bodyDental.data.every((c: any) => c.industry === 'Nha khoa & Y tế'));
    console.log(`   ✔ Industry filter verified: ${bodyDental.data[0].title}`);

    // 1.3 Search by Keyword: 'Grand View'
    const resSearch = await app.request('/api/v1/affiliate/campaigns/marketplace?search=Grand%20View', { method: 'GET' });
    const bodySearch = await resSearch.json<any>();
    assert.strictEqual(bodySearch.data.length, 1);
    assert.strictEqual(bodySearch.data[0].id, 'camp-2');
    console.log(`   ✔ Keyword search verified: Matched ${bodySearch.data[0].title}`);
  }

  // -------------------------------------------------------------
  // TEST 2: Campaign Policy Versioning & Audit History
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 2: Campaign Policy Versioning & Immutable History');
    
    // 2.1 Get details of camp-1
    const resDetail = await app.request('/api/v1/affiliate/campaigns/camp-1', { method: 'GET' });
    assert.strictEqual(resDetail.status, 200);
    const bodyDetail = await resDetail.json<any>();
    assert.strictEqual(bodyDetail.data.policyVersion, 1);
    assert.strictEqual(bodyDetail.data.policyVersions.length, 1);
    console.log(`   ✔ Policy v1 verified (Commission: ${bodyDetail.data.commissionRate}%)`);

    // 2.2 Update policy (bump to v2 with 12% commission)
    const resUpdatePolicy = await app.request('/api/v1/affiliate/campaigns/camp-1/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commissionType: 'percentage',
        commissionRate: 12,
        cookieWindowDays: 60,
        minDealValue: 5000000,
        termsAndConditions: 'Cập nhật chính sách v2: Tăng hoa hồng lên 12% cho mọi đơn hàng.'
      })
    });
    assert.strictEqual(resUpdatePolicy.status, 200);
    const bodyUpdatePolicy = await resUpdatePolicy.json<any>();
    assert.strictEqual(bodyUpdatePolicy.data.campaign.policyVersion, 2);
    assert.strictEqual(bodyUpdatePolicy.data.policyVersion.version, 2);
    assert.strictEqual(bodyUpdatePolicy.data.campaign.commissionRate, 12);
    console.log('   ✔ Successfully updated policy to v2 (12%), archived prior version');
  }

  // -------------------------------------------------------------
  // TEST 3: Partner Application & Dynamic Referral Link Generation
  // -------------------------------------------------------------
  let generatedLinkCode: string = '';
  {
    console.log('\n👉 Test 3: Partner Joins Campaign & Obtains Unique Referral Link + QR');
    
    const resJoin = await app.request('/api/v1/affiliate/campaigns/camp-2/apply', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-partner-id': 'partner-auto-01',
        'x-partner-name': encodeURIComponent('Trần Văn Hoàng'),
        'x-partner-email': 'hoang.tran@partneros.vn'
      },
      body: JSON.stringify({
        applicationNote: 'Kênh TikTok BĐS 200K followers',
        policyVersionAgreed: 1
      })
    });

    assert.strictEqual(resJoin.status, 201);
    const bodyJoin = await resJoin.json<any>();
    assert.strictEqual(bodyJoin.success, true);
    assert.strictEqual(bodyJoin.data.registration.status, 'approved');
    assert.ok(bodyJoin.data.referralLink.code.startsWith('REF_'));
    assert.ok(bodyJoin.data.referralLink.qrCodeUrl.includes('api.qrserver.com'));
    generatedLinkCode = bodyJoin.data.referralLink.code;
    console.log(`   ✔ Partner joined camp-2, generated link code: ${generatedLinkCode}`);
  }

  // -------------------------------------------------------------
  // TEST 4: Click Stream Tracking Engine
  // -------------------------------------------------------------
  const testSessionId = `sess_${crypto.randomUUID()}`;
  {
    console.log('\n👉 Test 4: Tracking Click Event Stream & Session Binding');
    
    const resClick = await app.request('/api/v1/track/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '113.161.45.89',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      },
      body: JSON.stringify({
        referralCode: generatedLinkCode,
        sessionId: testSessionId,
        landingPageUrl: 'https://vinhomes.partneros.vn/offer/grand-view',
        referrerUrl: 'https://tiktok.com/@bds_hoang'
      })
    });

    assert.strictEqual(resClick.status, 200);
    const bodyClick = await resClick.json<any>();
    assert.strictEqual(bodyClick.success, true);
    assert.strictEqual(bodyClick.data.sessionId, testSessionId);
    assert.strictEqual(bodyClick.data.referralCode, generatedLinkCode);
    console.log(`   ✔ Click tracked and indexed to session: ${testSessionId}`);
  }

  // -------------------------------------------------------------
  // TEST 5: Deterministic Conversion Attribution (Last-Click)
  // -------------------------------------------------------------
  let conversionId: string = '';
  {
    console.log('\n👉 Test 5: Deterministic Conversion Attribution Engine');

    const resConv = await app.request('/api/v1/track/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode: generatedLinkCode,
        contactName: 'Đặng Quốc Huy',
        contactPhone: '0933112233',
        dealValue: 3500000000, // 3.5 tỷ VNĐ
        dealTitle: 'Hợp đồng cọc Căn 2PN Grand View'
      })
    });

    assert.strictEqual(resConv.status, 200);
    const bodyConv = await resConv.json<any>();
    assert.strictEqual(bodyConv.success, true);
    assert.strictEqual(bodyConv.data.status, 'attributed');
    assert.strictEqual(bodyConv.data.model, 'last_click');
    assert.strictEqual(bodyConv.data.referralCode, generatedLinkCode);
    assert.strictEqual(bodyConv.data.attributedPartnerId, 'partner-auto-01');
    assert.strictEqual(bodyConv.data.calculatedCommission, 50000000); // 50M fixed commission
    conversionId = bodyConv.data.conversionId;
    console.log(`   ✔ Attributed 50,000,000 VND to partner-auto-01 (Conversion ID: ${conversionId})`);
  }

  // -------------------------------------------------------------
  // TEST 6: Session-based Attribution (No referral code in payload)
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 6: Attribution via Session Cookie (No explicit referralCode passed)');

    const resConvSession = await app.request('/api/v1/track/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: testSessionId, // Matched via previous click
        contactName: 'Lê Thuỳ Trang',
        contactPhone: '0988223344',
        dealValue: 4200000000
      })
    });

    assert.strictEqual(resConvSession.status, 200);
    const bodyConvSession = await resConvSession.json<any>();
    assert.strictEqual(bodyConvSession.data.status, 'attributed');
    assert.strictEqual(bodyConvSession.data.referralCode, generatedLinkCode);
    assert.strictEqual(bodyConvSession.data.attributedPartnerId, 'partner-auto-01');
    console.log('   ✔ Successfully resolved attribution using sessionId lookup');
  }

  // -------------------------------------------------------------
  // TEST 7: Idempotency Protection on Conversions
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 7: Idempotency Protection against Replay & Duplicate Events');

    const idempotencyKey = `idem_${crypto.randomUUID()}`;

    // First conversion call
    const resFirst = await app.request('/api/v1/track/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey,
        referralCode: 'REF_TUAN_VIP',
        contactName: 'Nguyễn Văn Test',
        contactPhone: '0909999888',
        dealValue: 10000000
      })
    });
    const bodyFirst = await resFirst.json<any>();

    // Duplicate conversion call with same key
    const resSecond = await app.request('/api/v1/track/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey,
        referralCode: 'REF_TUAN_VIP',
        contactName: 'Nguyễn Văn Test',
        contactPhone: '0909999888',
        dealValue: 10000000
      })
    });
    const bodySecond = await resSecond.json<any>();

    assert.strictEqual(bodyFirst.data.conversionId, bodySecond.data.conversionId);
    console.log(`   ✔ Idempotency confirmed: Returned cached result for key ${idempotencyKey}`);
  }

  // -------------------------------------------------------------
  // TEST 8: Explainable Attribution Audit Record
  // -------------------------------------------------------------
  {
    console.log('\n👉 Test 8: Explainable Attribution Decision & Audit Trail');

    const resExplain = await app.request(`/api/v1/track/attribution/${conversionId}/explain`, {
      method: 'GET'
    });

    assert.strictEqual(resExplain.status, 200);
    const bodyExplain = await resExplain.json<any>();
    assert.strictEqual(bodyExplain.success, true);
    assert.strictEqual(bodyExplain.data.conversionId, conversionId);
    assert.ok(bodyExplain.data.decision.explanation.length > 0);
    console.log(`   ✔ Explanation retrieved: "${bodyExplain.data.decision.explanation}"`);
  }

  console.log('\n🎉 [PHASE 3 TEST SUITE] ALL 8 INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 3 Test Suite Failed:', err);
  process.exit(1);
});
