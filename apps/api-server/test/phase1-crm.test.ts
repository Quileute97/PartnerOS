import assert from 'node:assert';
import app from '../src/index.ts';

console.log('--- RUNNING PHASE 1 BUSINESS CRM INTEGRATION TESTS ---');

async function testPhase1() {
  const tenantId = 'org-smilecare-01';
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
    'x-user-id': 'user-demo-1'
  };

  // 1. Test Customer Creation
  console.log('1. Testing Customer Creation...');
  const newPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
  const custRes = await app.request('/api/v1/crm/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Đặng Thùy Dương',
      phone: newPhone,
      email: 'duong.dang@test.com',
      address: '77 Hai Bà Trưng, Quận 1',
      tags: ['Tư vấn niềng răng', 'Mới'],
      customFields: {
        dental_concern: 'Răng khấp khểnh hàm dưới'
      }
    })
  });

  assert.strictEqual(custRes.status, 201, 'Contact creation should return 201 Created');
  const custData = await custRes.json();
  assert.strictEqual(custData.success, true);
  assert.strictEqual(custData.data.name, 'Đặng Thùy Dương');
  assert.strictEqual(custData.data.phone, newPhone);
  const createdContactId = custData.data.id;
  console.log('✓ Customer creation passed');

  // 2. Test Duplicate Phone Detection
  console.log('2. Testing Duplicate Phone Detection...');
  const dupRes = await app.request('/api/v1/crm/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Trùng Số Điện Thoại',
      phone: newPhone, // Same phone
      email: 'other@test.com'
    })
  });
  assert.strictEqual(dupRes.status, 409, 'Duplicate phone number must be rejected with 409 Conflict');
  const dupData = await dupRes.json();
  assert.strictEqual(dupData.error.code, 'DUPLICATE_CONTACT');
  console.log('✓ Duplicate phone detection passed');

  // 3. Test Activity Logging on Customer
  console.log('3. Testing Activity Logging...');
  const actRes = await app.request('/api/v1/crm/activities', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contactId: createdContactId,
      type: 'call',
      title: 'Gọi điện tư vấn ban đầu',
      description: 'Khách hàng có nhu cầu niềng răng trong suốt Invisalign, hẹn lịch khám thứ 7'
    })
  });
  assert.strictEqual(actRes.status, 201, 'Activity creation should return 201 Created');
  const actData = await actRes.json();
  assert.strictEqual(actData.data.title, 'Gọi điện tư vấn ban đầu');
  console.log('✓ Activity logging passed');

  // 4. Test Lead Creation & Lead Conversion
  console.log('4. Testing Lead Creation & Conversion...');
  const leadPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
  const leadRes = await app.request('/api/v1/crm/leads', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Ngô Quốc Bảo',
      phone: leadPhone,
      email: 'bao.ngo@test.com',
      source: 'Facebook Ads',
      score: 75,
      estimatedValue: 50000000,
      notes: 'Khách muốn làm 4 răng sứ hàm trên'
    })
  });
  assert.strictEqual(leadRes.status, 201, 'Lead creation should return 201 Created');
  const leadData = await leadRes.json();
  const createdLeadId = leadData.data.id;

  // Convert Lead
  const convertRes = await app.request(`/api/v1/crm/leads/${createdLeadId}/convert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      createDeal: true,
      dealTitle: 'Hợp đồng thẩm mỹ răng sứ - Ngô Quốc Bảo',
      dealValue: 50000000
    })
  });
  assert.strictEqual(convertRes.status, 200, 'Lead conversion should return 200 OK');
  const convertData = await convertRes.json();
  assert.strictEqual(convertData.data.lead.status, 'converted');
  assert(convertData.data.contact.id, 'Must create or link contact');
  assert(convertData.data.deal.id, 'Must create opportunity/deal');
  assert.strictEqual(convertData.data.deal.value, 50000000);
  console.log('✓ Lead creation & conversion passed');

  // 5. Test Products & Services Catalog
  console.log('5. Testing Products & Services Catalog...');
  const sku = `TEST-PROD-${Date.now()}`;
  const prodRes = await app.request('/api/v1/crm/products', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sku,
      name: 'Gói Tẩy Trắng Răng Laser Whitening',
      category: 'Nha khoa Thẩm mỹ',
      type: 'service',
      unitPrice: 3500000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 15
    })
  });
  assert.strictEqual(prodRes.status, 201, 'Product creation should return 201 Created');
  const prodData = await prodRes.json();
  assert.strictEqual(prodData.data.sku, sku);
  console.log('✓ Product catalog creation passed');

  // 6. Test Transaction Creation with Line Items & Idempotency
  console.log('6. Testing Sales Transaction Creation...');
  const idemKey = `idem-${Date.now()}-${Math.random()}`;
  const txRes = await app.request('/api/v1/crm/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customerId: createdContactId,
      branchId: 'branch-main',
      partnerId: 'partner-001',
      referralCode: 'REF_TUAN_VIP',
      items: [
        {
          productId: prodData.data.id,
          productName: prodData.data.name,
          sku: prodData.data.sku,
          quantity: 2,
          unitPrice: 3500000
        }
      ],
      discount: 500000,
      paymentMethod: 'credit_card',
      status: 'paid',
      paymentStatus: 'paid',
      idempotencyKey: idemKey
    })
  });

  assert.strictEqual(txRes.status, 201, 'Transaction should return 201 Created');
  const txData = await txRes.json();
  assert.strictEqual(txData.data.subtotal, 7000000, 'Subtotal: 2 * 3.5M = 7M');
  assert.strictEqual(txData.data.totalAmount, 6500000, 'Total: 7M - 500K discount = 6.5M');
  assert.strictEqual(txData.data.paymentStatus, 'paid');

  // Idempotency check: Repeat request with same idempotencyKey
  const replayRes = await app.request('/api/v1/crm/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customerId: createdContactId,
      items: [{ productId: 'prod-01', productName: 'Prod', sku: 'S', quantity: 1, unitPrice: 100 }],
      idempotencyKey: idemKey
    })
  });
  const replayData = await replayRes.json();
  assert.strictEqual(replayData.data.id, txData.data.id, 'Idempotent replay must return original transaction');
  assert.strictEqual(replayData.idempotentReplay, true);
  console.log('✓ Transaction creation & idempotency protection passed');

  // 7. Test Reports Overview Metrics
  console.log('7. Testing Reports Overview Metrics...');
  const repRes = await app.request('/api/v1/crm/reports/overview', {
    method: 'GET',
    headers
  });
  assert.strictEqual(repRes.status, 200, 'Reports should return 200 OK');
  const repData = await repRes.json();
  assert(typeof repData.data.totalRevenue === 'number', 'Total revenue must be numeric');
  assert(repData.data.totalRevenue > 0, 'Total revenue should reflect transactions');
  assert(Array.isArray(repData.data.topProducts), 'Top products array must exist');
  console.log('✓ Reports overview metrics passed');

  console.log('ALL PHASE 1 BUSINESS CRM TESTS PASSED SUCCESSFULLY! 🎉');
}

testPhase1().catch(err => {
  console.error('PHASE 1 TEST FAILED:', err);
  process.exit(1);
});
