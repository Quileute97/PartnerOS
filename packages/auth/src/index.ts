import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Permission, StandardRole } from '@partner-os/permissions';
import { hasPermission, getRolePermissions } from '@partner-os/permissions';

export interface AuthContext {
  user: User | null;
  session: Session | null;
  activeOrgId: string | null;
  activeRole: StandardRole | null;
  permissions: Permission[];
}

export interface UserSessionData {
  userId: string;
  email: string;
  fullName: string;
  platformRole: 'super_admin' | 'business_user' | 'partner' | 'hybrid';
  memberships: {
    orgId: string;
    orgName: string;
    orgSlug: string;
    role: StandardRole;
    permissions: Permission[];
    isOwner: boolean;
    branchId?: string | null;
  }[];
}

/**
 * Create a configured Supabase client instance
 */
export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

/**
 * Check if the active session has a specific permission in the active organization
 */
export function can(context: AuthContext, requiredPermission: Permission): boolean {
  if (!context.user || !context.activeOrgId) return false;
  return hasPermission(context.permissions, requiredPermission);
}

/**
 * Extract authorization token from HTTP Authorization header
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}
