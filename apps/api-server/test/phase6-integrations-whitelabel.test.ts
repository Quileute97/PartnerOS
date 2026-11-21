import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('🚀 [PHASE 6 TEST SUITE] Starting Integrations, Webhooks & White-label Tests...\n');

  const testTenantId = 'tenant-dental-01';

  // 1. Generate and List API Keys
  {
    console.log('👉 Test 1: Generate & Mask Tenant API Key');
    const resCreate = await app.request('/api/v1/integrations/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        name: 'Production Ingestion Key'
      })
    });
    assert.strictEqual(resCreate.status, 201);
    const bodyCreate = await resCreate.json<any>();
    assert.strictEqual(bodyCreate.success, true);
    assert.ok(bodyCreate.data.apiKey.startsWith('pk_live_'));
    assert.ok(bodyCreate.data.keyMasked.includes('...'));
    console.log(`   ✔ API Key generated: ${bodyCreate.data.keyMasked}`);

    // List API keys
    const resList = await app.request('/api/v1/integrations/api-keys', {
      method: 'GET',
      headers: { 'x-tenant-id': testTenantId }
    });
    assert.strictEqual(resList.status, 200);
    const bodyList = await resList.json<any>();
    assert.ok(bodyList.data.length >= 1);
    console.log(`   ✔ Retrieved ${bodyList.data.length} active API keys for tenant`);
  }

  // 2. Register and Test Webhook
  {
    console.log('\n👉 Test 2: Register & Test Webhook Event Dispatch');
    const resReg = await app.request('/api/v1/integrations/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        targetUrl: 'https://webhook.site/test-partneros-events',
        events: ['deal.won', 'commission.approved']
      })
    });
    assert.strictEqual(resReg.status, 201);
    const bodyReg = await resReg.json<any>();
    assert.ok(bodyReg.data.secret.startsWith('whsec_'));
    const webhookId = bodyReg.data.id;
    console.log(`   ✔ Webhook registered (${webhookId}) with secret signature`);

    // Test dispatch simulation
    const resTest = await app.request(`/api/v1/integrations/webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: { 'x-tenant-id': testTenantId }
    });
    assert.strictEqual(resTest.status, 200);
    const bodyTest = await resTest.json<any>();
    assert.strictEqual(bodyTest.data.simulatedStatus, 200);
    assert.ok(bodyTest.data.headers['x-partneros-signature']);
    console.log('   ✔ Webhook mock dispatch verified with signature header');
  }

  // 3. Register and Verify White-label Custom Domain
  {
    console.log('\n👉 Test 3: White-label Custom Domain Registration & DNS Verification');
    const resDom = await app.request('/api/v1/integrations/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        domain: 'affiliate.smilecare.vn'
      })
    });
    assert.strictEqual(resDom.status, 201);
    const bodyDom = await resDom.json<any>();
    assert.strictEqual(bodyDom.data.domain, 'affiliate.smilecare.vn');
    assert.strictEqual(bodyDom.data.isVerified, false);
    const domainId = bodyDom.data.id;
    console.log(`   ✔ Custom domain registered: ${bodyDom.data.domain} -> Target: ${bodyDom.data.cnameTarget}`);

    // Verify DNS
    const resVerify = await app.request(`/api/v1/integrations/domains/${domainId}/verify`, {
      method: 'POST',
      headers: { 'x-tenant-id': testTenantId }
    });
    assert.strictEqual(resVerify.status, 200);
    const bodyVerify = await resVerify.json<any>();
    assert.strictEqual(bodyVerify.data.isVerified, true);
    assert.strictEqual(bodyVerify.data.sslStatus, 'active');
    console.log('   ✔ DNS verified and SSL status set to active');
  }

  console.log('\n🎉 [PHASE 6 TEST SUITE] ALL INTEGRATIONS & WHITE-LABEL TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 6 Test Suite Failed:', err);
  process.exit(1);
});
