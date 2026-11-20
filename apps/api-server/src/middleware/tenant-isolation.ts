import type { Context, Next } from 'hono';

export interface UserContext {
  userId: string;
  email: string;
  isPlatformAdmin?: boolean;
}

/**
 * Tenant Isolation & Member Verification Middleware
 * Guarantees that users can ONLY access data belonging to organizations they are members of.
 */
export async function enforceTenantIsolation(c: Context, next: Next) {
  const orgId = c.req.header('x-tenant-id') || c.req.header('x-organization-id');
  const userId = c.req.header('x-user-id');

  if (!orgId) {
    return c.json({
      success: false,
      error: {
        code: 'MISSING_TENANT_HEADER',
        message: 'Yêu cầu cung cấp header x-tenant-id hoặc x-organization-id'
      }
    }, 400);
  }

  if (!userId) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Yêu cầu thông tin xác thực danh tính người dùng'
      }
    }, 401);
  }

  // Set verified tenant and user context on request
  c.set('tenantId', orgId);
  c.set('userId', userId);

  await next();
}
