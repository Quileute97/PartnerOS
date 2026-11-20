import type { 
  RegisterInput, 
  LoginInput, 
  CreateOrganizationInput, 
  UpdateOrganizationInput, 
  CreateBranchInput, 
  InviteMemberInput,
  CreateContactInput,
  CreateDealInput
} from '@partner-os/validation';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
  getOrgId?: () => string | null | Promise<string | null>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class PartnerOSClient {
  private baseUrl: string;
  private getToken?: () => string | null | Promise<string | null>;
  private getOrgId?: () => string | null | Promise<string | null>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getToken = config.getToken;
    this.getOrgId = config.getOrgId;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});
    
    headers.set('Content-Type', 'application/json');

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (this.getOrgId) {
      const orgId = await this.getOrgId();
      if (orgId) {
        headers.set('x-tenant-id', orgId);
        headers.set('x-organization-id', orgId);
      }
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Không thể kết nối đến máy chủ API'
        }
      };
    }
  }

  // Auth endpoints
  public auth = {
    register: (input: RegisterInput) => 
      this.fetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    login: (input: LoginInput) => 
      this.fetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    me: () => 
      this.fetch('/api/v1/auth/me', { method: 'GET' }),
    logout: () => 
      this.fetch('/api/v1/auth/logout', { method: 'POST' })
  };

  // Organization endpoints
  public organizations = {
    list: () => 
      this.fetch('/api/v1/organizations', { method: 'GET' }),
    get: (orgId: string) => 
      this.fetch(`/api/v1/organizations/${orgId}`, { method: 'GET' }),
    create: (input: CreateOrganizationInput) => 
      this.fetch('/api/v1/organizations', { method: 'POST', body: JSON.stringify(input) }),
    update: (orgId: string, input: UpdateOrganizationInput) => 
      this.fetch(`/api/v1/organizations/${orgId}`, { method: 'PATCH', body: JSON.stringify(input) }),
    listBranches: (orgId: string) => 
      this.fetch(`/api/v1/organizations/${orgId}/branches`, { method: 'GET' }),
    createBranch: (orgId: string, input: CreateBranchInput) => 
      this.fetch(`/api/v1/organizations/${orgId}/branches`, { method: 'POST', body: JSON.stringify(input) }),
    listMembers: (orgId: string) => 
      this.fetch(`/api/v1/organizations/${orgId}/members`, { method: 'GET' }),
    inviteMember: (orgId: string, input: InviteMemberInput) => 
      this.fetch(`/api/v1/organizations/${orgId}/members`, { method: 'POST', body: JSON.stringify(input) })
  };

  // CRM endpoints
  public crm = {
    listContacts: () => 
      this.fetch('/api/v1/crm/contacts', { method: 'GET' }),
    createContact: (input: CreateContactInput) => 
      this.fetch('/api/v1/crm/contacts', { method: 'POST', body: JSON.stringify(input) }),
    updateDealStage: (dealId: string, stageId: string, isWon?: boolean) => 
      this.fetch(`/api/v1/crm/deals/${dealId}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId, isWon }) })
  };

  // Affiliate & Marketplace endpoints
  public affiliate = {
    listMarketplaceCampaigns: () => 
      this.fetch('/api/v1/affiliate/campaigns/marketplace', { method: 'GET' }),
    joinCampaign: (campaignId: string) => 
      this.fetch(`/api/v1/affiliate/campaigns/${campaignId}/join`, { method: 'POST' })
  };

  // Financial & Settlement endpoints
  public finance = {
    listCommissions: () => 
      this.fetch('/api/v1/finance/commissions', { method: 'GET' }),
    approveCommission: (commissionId: string) => 
      this.fetch(`/api/v1/finance/commissions/${commissionId}/approve`, { method: 'POST' })
  };
}
