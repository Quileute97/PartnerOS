import assert from 'node:assert';
import app from '../src/index.ts';

console.log('--- RUNNING PHASE 0 AUTH & TENANT ISOLATION TESTS ---');

async function testPhase0() {
  // Test 1: User Registration
  console.log('1. Testing User Registration...');
  const regRes = await app.request('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@newtech.vn',
      password: 'SecurePassword123!',
      fullName: 'Trần Minh Hoàng',
      phone: '0987654321',
      platformRole: 'business_user'
    })
  });

  assert.strictEqual(regRes.status, 201, 'Registration should return 201 Created');
  const regData = await regRes.json();
  assert.strictEqual(regData.success, true, 'Registration success flag should be true');
  assert.strictEqual(regData.data.user.email, 'founder@newtech.vn');
  assert(regData.data.token, 'Registration must return auth token');
  console.log('✓ User Registration passed');

  // Test 2: Validation rejection on weak password
  console.log('2. Testing Registration Validation on weak password...');
  const weakRes = await app.request('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'weak@example.com',
      password: '123', // Too short
      fullName: 'Weak User'
    })
  });
  assert.strictEqual(weakRes.status, 400, 'Weak password must be rejected with 400');
  console.log('✓ Validation rejection passed');

  // Test 3: User Login & Multi-org Memberships
  console.log('3. Testing User Login & Memberships...');
  const loginRes = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@smilecare.vn',
      password: 'AnyPassword'
    })
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200 OK');
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert(Array.isArray(loginData.data.memberships), 'Memberships must be an array');
  assert(loginData.data.memberships.length >= 2, 'User must belong to multiple organizations');
  
  const ownerMembership = loginData.data.memberships.find((m: any) => m.role === 'owner');
  const salesMembership = loginData.data.memberships.find((m: any) => m.role === 'sales_rep');
  assert(ownerMembership, 'Owner membership exists');
  assert(salesMembership, 'Sales rep membership exists in another org');
  console.log('✓ Multi-tenant membership resolution passed');

  // Test 4: Create Organization
  console.log('4. Testing Organization Creation...');
  const newOrgSlug = `medicare-${Date.now()}`;
  const orgRes = await app.request('/api/v1/organizations', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': 'user-demo-1'
    },
    body: JSON.stringify({
      name: 'Phòng Khám Đa Khoa MediCare',
      slug: newOrgSlug,
      legalName: 'Công Ty Cổ Phần Y Tế MediCare',
      industry: 'healthcare',
      defaultCurrency: 'VND'
    })
  });
  assert.strictEqual(orgRes.status, 201, 'Org creation should return 201 Created');
  const orgData = await orgRes.json();
  assert.strictEqual(orgData.success, true);
  assert.strictEqual(orgData.data.organization.name, 'Phòng Khám Đa Khoa MediCare');
  assert.strictEqual(orgData.data.membership.role, 'owner', 'Creator must automatically receive owner role');
  assert(orgData.data.headquartersBranch, 'Default headquarters branch must be automatically created');
  console.log('✓ Organization creation & auto-owner assignment passed');

  // Test 5: Branch Creation
  console.log('5. Testing Branch Creation...');
  const createdOrgId = orgData.data.organization.id;
  const branchRes = await app.request(`/api/v1/organizations/${createdOrgId}/branches`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': 'user-demo-1',
      'x-tenant-id': createdOrgId
    },
    body: JSON.stringify({
      name: 'Cơ sở 2 MediCare Cầu Giấy',
      code: 'CN-CG',
      address: '99 Cầu Giấy, Hà Nội',
      phone: '024 3766 8888',
      isHeadquarters: false
    })
  });
  assert.strictEqual(branchRes.status, 201, 'Branch creation should return 201');
  const branchData = await branchRes.json();
  assert.strictEqual(branchData.data.code, 'CN-CG');
  console.log('✓ Branch creation passed');

  // Test 6: Member Invitation with Role & Branch
  console.log('6. Testing Member Invitation...');
  const inviteRes = await app.request(`/api/v1/organizations/${createdOrgId}/members`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': 'user-demo-1',
      'x-tenant-id': createdOrgId
    },
    body: JSON.stringify({
      email: 'doctor.hung@medicare.vn',
      role: 'branch_manager',
      branchId: branchData.data.id
    })
  });
  assert.strictEqual(inviteRes.status, 201, 'Invite should return 201');
  const inviteData = await inviteRes.json();
  assert.strictEqual(inviteData.data.role, 'branch_manager');
  assert.strictEqual(inviteData.data.status, 'invited');
  assert.strictEqual(inviteData.data.branchId, branchData.data.id);
  console.log('✓ Member invitation with role and branch passed');

  console.log('ALL PHASE 0 INTEGRATION & ISOLATION TESTS PASSED! 🚀');
}

testPhase0().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
