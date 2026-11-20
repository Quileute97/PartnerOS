export type UserPlatformRole = 'super_admin' | 'business_user' | 'partner' | 'hybrid';

export type TenantMemberRole = 'owner' | 'admin' | 'manager' | 'member' | 'accountant';

export interface UserProfile {
  id: string; // references auth.users
  email: string;
  phone?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  platformRole: UserPlatformRole;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantBranding {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  accentColor?: string;
  portalTitle?: string;
}

export interface TenantSettings {
  industry?: 'dental' | 'real_estate' | 'rental' | 'education' | 'tourism' | 'ecommerce' | 'services' | 'other';
  defaultCurrency: string;
  timezone: string;
  cookieWindowDays: number;
  attributionModel: 'last_click' | 'first_click';
  autoApproveCommissionDays?: number;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  isDomainVerified: boolean;
  branding: TenantBranding;
  settings: TenantSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantMemberRole;
  permissions?: string[];
  user?: UserProfile;
  createdAt: string;
  updatedAt: string;
}
