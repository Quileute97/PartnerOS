/**
 * PartnerOS Lightweight Client-side Tracking SDK (~4KB)
 * Embeddable on any landing page (Ladipage, Webflow, WordPress, Custom Site)
 */

export interface PartnerOSConfig {
  tenantId?: string;
  tenantSlug?: string;
  apiEndpoint?: string;
  cookieDays?: number;
  cookieName?: string;
  storageKey?: string;
  paramNames?: string[];
  autoBindForms?: boolean;
}

export interface ConversionPayload {
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  dealValue?: number;
  dealTitle?: string;
  customFields?: Record<string, any>;
}

class PartnerOSTracking {
  private config: Required<PartnerOSConfig>;
  private referralCode: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.config = {
      tenantId: '',
      tenantSlug: '',
      apiEndpoint: 'https://api.partneros.vn/api/v1/track',
      cookieDays: 60,
      cookieName: '_pos_ref',
      storageKey: '_partneros_attribution',
      paramNames: ['ref', 'ref_code', 'partner', 'aff'],
      autoBindForms: true
    };
  }

  /**
   * Initialize SDK with tenant configuration
   */
  public init(customConfig: PartnerOSConfig = {}): void {
    if (typeof window === 'undefined') return;

    this.config = { ...this.config, ...customConfig };
    this.sessionId = this.getOrCreateSessionId();

    // 1. Detect Referral Code from URL parameters
    const codeFromUrl = this.detectReferralCodeFromUrl();

    if (codeFromUrl) {
      this.referralCode = codeFromUrl;
      this.saveReferralCode(codeFromUrl);
      this.sendClickEvent(codeFromUrl);
    } else {
      // 2. Read from persistent Cookie / LocalStorage
      this.referralCode = this.getSavedReferralCode();
    }

    // 3. Auto-bind to DOM forms if enabled
    if (this.config.autoBindForms) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.bindAllForms());
      } else {
        this.bindAllForms();
      }
    }
  }

  /**
   * Get currently active referral code
   */
  public getReferralCode(): string | null {
    return this.referralCode || this.getSavedReferralCode();
  }

  /**
   * Get current tracking session ID
   */
  public getSessionId(): string {
    return this.sessionId || this.getOrCreateSessionId();
  }

  /**
   * Track a lead submission or purchase event
   */
  public async trackConversion(data: ConversionPayload): Promise<boolean> {
    const code = this.getReferralCode();
    const payload = {
      ...data,
      referralCode: code,
      sessionId: this.getSessionId(),
      tenantId: this.config.tenantId,
      tenantSlug: this.config.tenantSlug,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${this.config.apiEndpoint}/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (err) {
      console.warn('[PartnerOS] Failed to record conversion:', err);
      return false;
    }
  }

  /**
   * Auto-inject hidden input fields into all existing forms on the page
   */
  public bindAllForms(): void {
    const code = this.getReferralCode();
    if (!code) return;

    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      // Check if hidden input already exists
      let hiddenInput = form.querySelector('input[name="referral_code"]') as HTMLInputElement;
      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'referral_code';
        form.appendChild(hiddenInput);
      }
      hiddenInput.value = code;

      // Listen for form submission to track conversion
      form.addEventListener('submit', () => {
        const formData = new FormData(form);
        const name = (formData.get('name') || formData.get('full_name') || formData.get('customer_name') || '') as string;
        const phone = (formData.get('phone') || formData.get('tel') || formData.get('so_dien_thoai') || '') as string;
        const email = (formData.get('email') || '') as string;

        if (phone || email) {
          this.trackConversion({
            contactName: name,
            contactPhone: phone,
            contactEmail: email
          });
        }
      });
    });
  }

  // --- Private Helpers ---

  private detectReferralCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    for (const param of this.config.paramNames) {
      const val = urlParams.get(param);
      if (val && val.trim().length > 0) {
        return val.trim();
      }
    }
    return null;
  }

  private saveReferralCode(code: string): void {
    try {
      // Set First-party Cookie
      const expires = new Date();
      expires.setTime(expires.getTime() + this.config.cookieDays * 24 * 60 * 60 * 1000);
      document.cookie = `${this.config.cookieName}=${encodeURIComponent(code)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;

      // Set LocalStorage as backup
      localStorage.setItem(this.config.storageKey, JSON.stringify({
        code,
        expiresAt: expires.getTime(),
        setAt: Date.now()
      }));
    } catch (e) {
      // Ignore in private browsing mode if blocked
    }
  }

  private getSavedReferralCode(): string | null {
    try {
      // 1. Try Cookie
      const match = document.cookie.match(new RegExp(`(^|; )${this.config.cookieName}=([^;]*)`));
      if (match && match[2]) {
        return decodeURIComponent(match[2]);
      }

      // 2. Fallback to LocalStorage
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed.code;
        }
      }
    } catch (e) {}

    return null;
  }

  private getOrCreateSessionId(): string {
    const key = '_pos_session_id';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem(key, sid);
    }
    return sid;
  }

  private sendClickEvent(code: string): void {
    const payload = JSON.stringify({
      referralCode: code,
      tenantId: this.config.tenantId,
      tenantSlug: this.config.tenantSlug,
      landingPageUrl: window.location.href,
      referrerUrl: document.referrer || null,
      sessionId: this.getSessionId()
    });

    const endpoint = `${this.config.apiEndpoint}/click`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }
}

// Global Singleton Instance
export const PartnerOS = new PartnerOSTracking();

// Auto-bind to window if in browser environment
if (typeof window !== 'undefined') {
  (window as any).PartnerOS = PartnerOS;
}
