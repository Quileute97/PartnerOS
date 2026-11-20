/**
 * PartnerOS Fine-grained RBAC Permissions Matrix
 */

export const PERMISSIONS = {
  // Platform Superadmin
  PLATFORM_SUPERADMIN: 'platform.superadmin',
  PLATFORM_ORGS_VERIFY: 'platform.orgs.verify',
  PLATFORM_RISK_VIEW: 'platform.risk.view',
  PLATFORM_DISPUTES_MANAGE: 'platform.disputes.manage',

  // Organization Level
  ORG_VIEW: 'org.view',
  ORG_UPDATE: 'org.update',
  ORG_DELETE: 'org.delete',
  ORG_SETTINGS_MANAGE: 'org.settings.manage',
  ORG_DOMAINS_MANAGE: 'org.domains.manage',
  ORG_BRANCHES_MANAGE: 'org.branches.manage',

  // Members & Roles
  ORG_MEMBERS_VIEW: 'org.members.view',
  ORG_MEMBERS_INVITE: 'org.members.invite',
  ORG_MEMBERS_UPDATE: 'org.members.update',
  ORG_MEMBERS_REMOVE: 'org.members.remove',

  // CRM: Contacts & Leads
  CRM_CONTACTS_READ: 'crm.contacts.read',
  CRM_CONTACTS_WRITE: 'crm.contacts.write',
  CRM_CONTACTS_DELETE: 'crm.contacts.delete',
  CRM_FIELDS_MANAGE: 'crm.fields.manage',

  // CRM: Deals & Pipelines
  CRM_DEALS_READ: 'crm.deals.read',
  CRM_DEALS_WRITE: 'crm.deals.write',
  CRM_DEALS_DELETE: 'crm.deals.delete',
  CRM_STAGES_MANAGE: 'crm.stages.manage',

  // Affiliate & Campaigns
  AFFILIATE_CAMPAIGNS_VIEW: 'affiliate.campaigns.view',
  AFFILIATE_CAMPAIGNS_MANAGE: 'affiliate.campaigns.manage',
  AFFILIATE_PARTNERS_MANAGE: 'affiliate.partners.manage',
  AFFILIATE_LINKS_MANAGE: 'affiliate.links.manage',

  // Financial & Settlement
  FINANCE_COMMISSIONS_VIEW: 'finance.commissions.view',
  FINANCE_COMMISSIONS_APPROVE: 'finance.commissions.approve',
  FINANCE_SETTLEMENTS_VIEW: 'finance.settlements.view',
  FINANCE_SETTLEMENTS_CREATE: 'finance.settlements.create',
  FINANCE_SETTLEMENTS_APPROVE: 'finance.settlements.approve',
  FINANCE_LEDGER_VIEW: 'finance.ledger.view',

  // Audit Logs
  AUDIT_LOGS_VIEW: 'audit.logs.view'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export type StandardRole = 
  | 'owner' 
  | 'admin' 
  | 'branch_manager' 
  | 'sales_rep' 
  | 'accountant' 
  | 'support' 
  | 'member';

/**
 * Standard Role to Permissions Mapping
 */
export const ROLE_PERMISSIONS: Record<StandardRole, Permission[]> = {
  owner: Object.values(PERMISSIONS).filter(p => !p.startsWith('platform.')), // All tenant permissions
  admin: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_SETTINGS_MANAGE,
    PERMISSIONS.ORG_DOMAINS_MANAGE,
    PERMISSIONS.ORG_BRANCHES_MANAGE,
    PERMISSIONS.ORG_MEMBERS_VIEW,
    PERMISSIONS.ORG_MEMBERS_INVITE,
    PERMISSIONS.ORG_MEMBERS_UPDATE,
    PERMISSIONS.CRM_CONTACTS_READ,
    PERMISSIONS.CRM_CONTACTS_WRITE,
    PERMISSIONS.CRM_FIELDS_MANAGE,
    PERMISSIONS.CRM_DEALS_READ,
    PERMISSIONS.CRM_DEALS_WRITE,
    PERMISSIONS.CRM_STAGES_MANAGE,
    PERMISSIONS.AFFILIATE_CAMPAIGNS_VIEW,
    PERMISSIONS.AFFILIATE_CAMPAIGNS_MANAGE,
    PERMISSIONS.AFFILIATE_PARTNERS_MANAGE,
    PERMISSIONS.AFFILIATE_LINKS_MANAGE,
    PERMISSIONS.FINANCE_COMMISSIONS_VIEW,
    PERMISSIONS.FINANCE_COMMISSIONS_APPROVE,
    PERMISSIONS.FINANCE_SETTLEMENTS_VIEW,
    PERMISSIONS.FINANCE_SETTLEMENTS_CREATE,
    PERMISSIONS.FINANCE_LEDGER_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],
  branch_manager: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_MEMBERS_VIEW,
    PERMISSIONS.CRM_CONTACTS_READ,
    PERMISSIONS.CRM_CONTACTS_WRITE,
    PERMISSIONS.CRM_DEALS_READ,
    PERMISSIONS.CRM_DEALS_WRITE,
    PERMISSIONS.AFFILIATE_CAMPAIGNS_VIEW,
    PERMISSIONS.FINANCE_COMMISSIONS_VIEW
  ],
  sales_rep: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.CRM_CONTACTS_READ,
    PERMISSIONS.CRM_CONTACTS_WRITE,
    PERMISSIONS.CRM_DEALS_READ,
    PERMISSIONS.CRM_DEALS_WRITE,
    PERMISSIONS.AFFILIATE_CAMPAIGNS_VIEW
  ],
  accountant: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.CRM_DEALS_READ,
    PERMISSIONS.FINANCE_COMMISSIONS_VIEW,
    PERMISSIONS.FINANCE_COMMISSIONS_APPROVE,
    PERMISSIONS.FINANCE_SETTLEMENTS_VIEW,
    PERMISSIONS.FINANCE_SETTLEMENTS_CREATE,
    PERMISSIONS.FINANCE_LEDGER_VIEW
  ],
  support: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.CRM_CONTACTS_READ,
    PERMISSIONS.CRM_DEALS_READ
  ],
  member: [
    PERMISSIONS.ORG_VIEW
  ]
};

/**
 * Check if a set of granted permissions contains the required permission
 */
export function hasPermission(grantedPermissions: string[], required: string): boolean {
  if (grantedPermissions.includes(PERMISSIONS.PLATFORM_SUPERADMIN)) {
    return true; // Platform superadmin can do everything
  }
  return grantedPermissions.includes(required);
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(grantedPermissions: string[], required: string[]): boolean {
  return required.every(req => hasPermission(grantedPermissions, req));
}

/**
 * Check if user has at least one of the specified permissions
 */
export function hasAnyPermission(grantedPermissions: string[], required: string[]): boolean {
  return required.some(req => hasPermission(grantedPermissions, req));
}

/**
 * Get all permissions for a standard role
 */
export function getRolePermissions(role: StandardRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
