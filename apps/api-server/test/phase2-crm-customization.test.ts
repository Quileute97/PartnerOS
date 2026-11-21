import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('🚀 [PHASE 2 TEST SUITE] Starting CRM Customization Tests...\n');

  const testTenantId = 'tenant-dental-01';

  // 1. Fetch custom fields for tenant
  {
    console.log('👉 Test 1: Retrieve Tenant Custom Field Definitions');
    const res = await app.request('/api/v1/customization/custom-fields?entityType=contact', {
      method: 'GET',
      headers: { 'x-tenant-id': testTenantId }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length >= 2, 'Should have initial dental custom fields');
    console.log(`   ✔ Retrieved ${body.data.length} custom fields for contact entity`);
  }

  // 2. Define a new custom field (Tenant-isolated)
  {
    console.log('\n👉 Test 2: Define New Custom Field with Validation');
    const res = await app.request('/api/v1/customization/custom-fields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        entityType: 'lead',
        fieldName: 'budget_bracket',
        label: 'Mức ngân sách dự kiến',
        fieldType: 'select',
        options: [
          { label: 'Dưới 20 triệu', value: '<20M' },
          { label: 'Từ 20 - 50 triệu', value: '20-50M' },
          { label: 'Trên 50 triệu (VIP)', value: '>50M' }
        ],
        isRequired: true,
        sortOrder: 3
      })
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json<any>();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.fieldName, 'budget_bracket');
    console.log('   ✔ Custom field budget_bracket created successfully');

    // Duplicate field name in same entity should fail
    const resDup = await app.request('/api/v1/customization/custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': testTenantId },
      body: JSON.stringify({
        entityType: 'lead',
        fieldName: 'budget_bracket',
        label: 'Trùng tên',
        fieldType: 'text'
      })
    });
    assert.strictEqual(resDup.status, 409);
    console.log('   ✔ Duplicate field creation rejected with 409 Conflict');
  }

  // 3. Retrieve Pipelines & Custom Stages
  {
    console.log('\n👉 Test 3: Retrieve Tenant Pipelines & Stages');
    const res = await app.request('/api/v1/customization/pipelines', {
      method: 'GET',
      headers: { 'x-tenant-id': testTenantId }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length >= 1);
    assert.ok(body.data[0].stages.length >= 4);
    console.log(`   ✔ Pipeline "${body.data[0].name}" has ${body.data[0].stages.length} custom stages`);
  }

  // 4. Update Branding Theme
  {
    console.log('\n👉 Test 4: Update Tenant Branding & Theme Customization');
    const res = await app.request('/api/v1/customization/theme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': testTenantId
      },
      body: JSON.stringify({
        primaryColor: '#10b981',
        accentColor: '#06b6d4',
        portalTitle: 'SmileCare Premium Dental CRM'
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json<any>();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.primaryColor, '#10b981');
    console.log('   ✔ Branding theme updated successfully');
  }

  console.log('\n🎉 [PHASE 2 TEST SUITE] ALL CRM CUSTOMIZATION TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 2 Test Suite Failed:', err);
  process.exit(1);
});
