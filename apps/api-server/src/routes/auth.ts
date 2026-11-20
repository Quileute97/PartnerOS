import { Hono } from 'hono';
import { registerSchema, loginSchema } from '@partner-os/validation';
import { getRolePermissions } from '@partner-os/permissions';

export const authRouter = new Hono();

// In-memory persistent store for development & mock fallback
const mockUsers = new Map<string, any>([
  ['user-demo-1', {
    id: 'user-demo-1',
    email: 'admin@smilecare.vn',
    fullName: 'Bác Sĩ Nguyễn Văn An',
    phone: '0901234567',
    platformRole: 'business_user',
    createdAt: new Date().toISOString()
  }],
  ['user-partner-1', {
    id: 'user-partner-1',
    email: 'tuan.partner@gmail.com',
    fullName: 'Nguyễn Văn Tuấn',
    phone: '0912345678',
    platformRole: 'partner',
    createdAt: new Date().toISOString()
  }]
]);

const mockMemberships = new Map<string, any[]>([
  ['user-demo-1', [
    {
      orgId: 'org-smilecare-01',
      orgName: 'Nha Khoa SmileCare VN',
      orgSlug: 'smilecare',
      role: 'owner',
      permissions: getRolePermissions('owner'),
      isOwner: true,
      branchId: 'branch-main'
    },
    {
      orgId: 'org-skyland-02',
      orgName: 'BĐS SkyLand Group',
      orgSlug: 'skyland',
      role: 'sales_rep',
      permissions: getRolePermissions('sales_rep'),
      isOwner: false,
      branchId: 'branch-hcm'
    }
  ]],
  ['user-partner-1', []]
]);

// 1. User Registration (One Global Identity)
authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const validation = registerSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đăng ký không hợp lệ',
        details: validation.error.format()
      }
    }, 400);
  }

  const { email, fullName, phone, platformRole } = validation.data;

  // Check existing user
  const existing = Array.from(mockUsers.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return c.json({
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'Email này đã được đăng ký tài khoản trên PartnerOS'
      }
    }, 409);
  }

  const userId = `user_${crypto.randomUUID()}`;
  const newUser = {
    id: userId,
    email,
    fullName,
    phone: phone || null,
    platformRole,
    createdAt: new Date().toISOString()
  };

  mockUsers.set(userId, newUser);
  mockMemberships.set(userId, []);

  const token = `pos_jwt_${crypto.randomUUID()}`;

  return c.json({
    success: true,
    data: {
      user: newUser,
      token,
      memberships: []
    }
  }, 201);
});

// 2. User Login
authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const validation = loginSchema.safeParse(body);

  if (!validation.success) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email hoặc mật khẩu không hợp lệ',
        details: validation.error.format()
      }
    }, 400);
  }

  const { email } = validation.data;
  const user = Array.from(mockUsers.values()).find(u => u.email.toLowerCase() === email.toLowerCase()) || {
    id: 'user-demo-1',
    email,
    fullName: email.split('@')[0],
    phone: '0901234567',
    platformRole: 'business_user',
    createdAt: new Date().toISOString()
  };

  const memberships = mockMemberships.get(user.id) || mockMemberships.get('user-demo-1') || [];
  const token = `pos_jwt_${crypto.randomUUID()}`;

  return c.json({
    success: true,
    data: {
      user,
      token,
      memberships
    }
  });
});

// 3. Current User Context & Multi-org Memberships
authRouter.get('/me', async (c) => {
  const userId = c.req.header('x-user-id') || 'user-demo-1';
  const user = mockUsers.get(userId) || mockUsers.get('user-demo-1');

  if (!user) {
    return c.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Không tìm thấy thông tin tài khoản'
      }
    }, 404);
  }

  const memberships = mockMemberships.get(user.id) || mockMemberships.get('user-demo-1') || [];

  return c.json({
    success: true,
    data: {
      user,
      memberships
    }
  });
});

// 4. Logout / Session Revocation
authRouter.post('/logout', async (c) => {
  return c.json({
    success: true,
    data: {
      message: 'Đăng xuất thành công, phiên làm việc đã được thu hồi'
    }
  });
});
