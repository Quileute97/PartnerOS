import React, { useState } from 'react';
import { 
  Building2, 
  Share2, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Coins, 
  Layers, 
  CheckCircle2, 
  Lock, 
  Globe2,
  Users,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@partner-os/ui';
import { App as BusinessCRM, BusinessTenantProfile } from '../../app-business/src/App';
import { App as PartnerPortal } from '../../app-partner/src/App';
import { App as AdminConsole } from '../../admin-console/src/App';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'business_crm' | 'partner_portal' | 'admin_console'>('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'business_user' | 'partner'>('business_user');

  // Business Onboarding State
  const [businessForm, setBusinessForm] = useState<BusinessTenantProfile & { email: string; password: string }>({
    name: 'Nha Khoa Quốc Tế HH Dental',
    industry: 'Nha khoa & Y tế',
    branchName: 'Trụ sở Quận 1 (Phòng khám chính)',
    doctorName: 'Bs. Nguyễn Văn An',
    role: 'Chủ doanh nghiệp (Owner)',
    email: 'an.nguyen@hhdental.vn',
    password: ''
  });

  const [activeTenant, setActiveTenant] = useState<BusinessTenantProfile>({
    name: 'Nha Khoa Quốc Tế HH Dental',
    industry: 'Nha khoa & Y tế',
    branchName: 'Trụ sở Quận 1 (Phòng khám chính)',
    doctorName: 'Bs. Nguyễn Văn An',
    role: 'Chủ doanh nghiệp (Owner)'
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenant: BusinessTenantProfile = {
      name: businessForm.name.trim() || 'Nha Khoa HH Dental Clinic',
      industry: businessForm.industry,
      branchName: businessForm.branchName.trim() || 'Trụ sở chính',
      doctorName: businessForm.doctorName.trim() || 'Bs. Quản lý',
      role: 'Chủ doanh nghiệp (Owner)'
    };

    setActiveTenant(newTenant);
    setShowAuthModal(false);
    setCurrentView('business_crm');
    setNotification(`Khởi tạo thành công CRM cho "${newTenant.name}" theo chuẩn HH Dental CRM!`);
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Universal Ecosystem Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">PartnerOS Universal Workspace:</span>
          <span className="text-slate-400 hidden sm:inline">Hệ thống chuyển đổi cổng trải nghiệm trực tiếp</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              currentView === 'landing' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌐 Trang chủ
          </button>
          <button
            onClick={() => setCurrentView('business_crm')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              currentView === 'business_crm' ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3 h-3 text-indigo-400" />
            <span>🏢 CRM Doanh nghiệp (HH Dental)</span>
          </button>
          <button
            onClick={() => setCurrentView('partner_portal')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              currentView === 'partner_portal' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🤝 Cổng Đối tác (CTV)
          </button>
          <button
            onClick={() => setCurrentView('admin_console')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              currentView === 'admin_console' ? 'bg-red-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🛡️ Quản trị Toàn sàn
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-950 border-b border-emerald-800 px-6 py-2.5 text-xs text-emerald-200 flex items-center justify-between sticky top-9 z-40 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* RENDER VIEW: 1. BUSINESS CRM (HH DENTAL STYLE) */}
      {currentView === 'business_crm' && (
        <div className="flex-1 flex flex-col">
          <BusinessCRM 
            tenantProfile={activeTenant} 
            onSwitchPortal={(p) => setCurrentView(p as any)} 
          />
        </div>
      )}

      {/* RENDER VIEW: 2. PARTNER PORTAL */}
      {currentView === 'partner_portal' && (
        <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
          <PartnerPortal />
        </div>
      )}

      {/* RENDER VIEW: 3. ADMIN CONSOLE */}
      {currentView === 'admin_console' && (
        <div className="flex-1 flex flex-col">
          <AdminConsole />
        </div>
      )}

      {/* RENDER VIEW: 4. WEBSITE LANDING PAGE */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col selection:bg-indigo-500 selection:text-white">
          {/* Navigation */}
          <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-9 z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
                  P
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-white">PartnerOS</span>
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">v1.0</span>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                <a href="#solutions" className="hover:text-white transition-colors">Giải pháp</a>
                <a href="#hh-dental" className="hover:text-white transition-colors">Mô hình Nha khoa (HH Dental)</a>
                <a href="#ledger" className="hover:text-white transition-colors">Sổ cái Kế toán</a>
              </nav>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-slate-200 border-slate-700 hover:bg-slate-800"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  onClick={() => { setAuthMode('register'); setRole('business_user'); setShowAuthModal(true); }}
                >
                  Tạo tài khoản Doanh nghiệp
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="py-20 px-6 text-center max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hệ điều hành Doanh nghiệp & Mạng lưới Đối tác Toàn cầu</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Universal Business CRM & <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Affiliate Referral Network
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Mỗi doanh nghiệp sau khi tạo tài khoản sẽ được cấp ngay <strong>1 hệ thống CRM chuyên sâu</strong> (theo chuẩn mô hình HH Dental CRM) quản lý hồ sơ khám lâm sàng theo bước, chuỗi khách hàng 20% - 2% (Sàn 0%) và cây đối tác đa tầng 1% nhánh.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25"
                onClick={() => { setAuthMode('register'); setRole('business_user'); setShowAuthModal(true); }}
              >
                Đăng ký Doanh nghiệp & Nhận CRM <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto px-8 gap-2 border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold"
                onClick={() => setCurrentView('business_crm')}
              >
                Trải nghiệm Demo CRM (HH Dental)
              </Button>
            </div>
          </section>

          {/* Core Capabilities */}
          <section id="solutions" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
            <div className="max-w-7xl mx-auto px-6 space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">Cung Cấp CRM Chuyên Biệt Sau Khi Doanh Nghiệp Tạo Tài Khoản</h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Khởi tạo tự động (Multi-tenant Provisioning) chuẩn hóa theo mô hình hai hệ thống độc lập của HH Dental CRM
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Hồ sơ Lâm sàng & Lộ trình theo Bước</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Theo dõi từng lần khám (Visits), phác đồ điều trị phân bước (Khám, CT ConeBeam, Cấy trụ, Gắn mão...), ghi nợ và thanh toán theo tiến độ lâm sàng.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Chuỗi Khách Hàng (Plan V5: 20% - 2%)</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Cây phả hệ khách giới thiệu khách: Tầng 1 (CTV hưởng 20%), Tầng 2+ (CTV ban đầu hưởng 2%), Sàn không thu (0%). Tích lũy Credit dịch vụ cho khách.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cây Đối Tác & Đối Soát Bảng Lương</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Cây đối tác đa tầng không giới hạn số tầng. Quản lý hưởng 1% phí nhánh trên toàn bộ cây con trực tiếp. Đối soát minh bạch chuẩn 172.000.000 ₫.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Business Onboarding Modal */}
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {authMode === 'register' ? 'Đăng ký Doanh nghiệp & Khởi tạo CRM' : 'Đăng nhập vào Hệ sinh thái'}
                    </h3>
                    <p className="text-xs text-slate-400">Được cấp ngay CRM chuẩn theo mô hình HH Dental</p>
                  </div>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                {authMode === 'register' ? (
                  <form onSubmit={handleRegisterBusiness} className="space-y-3.5 text-left text-xs">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Tên Doanh nghiệp / Phòng khám *</label>
                      <input 
                        required 
                        value={businessForm.name} 
                        onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })} 
                        placeholder="VD: Nha Khoa Quốc Tế HH Dental Clinic" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Ngành nghề hoạt động *</label>
                        <select 
                          value={businessForm.industry} 
                          onChange={e => setBusinessForm({ ...businessForm, industry: e.target.value })} 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Nha khoa & Y tế">Nha khoa & Y tế</option>
                          <option value="Bất động sản">Bất động sản</option>
                          <option value="Thẩm mỹ & Spa">Thẩm mỹ & Spa</option>
                          <option value="Giáo dục & Đào tạo">Giáo dục & Đào tạo</option>
                          <option value="Dịch vụ B2B">Dịch vụ B2B</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Chi nhánh đầu tiên *</label>
                        <input 
                          required 
                          value={businessForm.branchName} 
                          onChange={e => setBusinessForm({ ...businessForm, branchName: e.target.value })} 
                          placeholder="Trụ sở Quận 1" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Họ tên Bác sĩ / Đại diện *</label>
                        <input 
                          required 
                          value={businessForm.doctorName} 
                          onChange={e => setBusinessForm({ ...businessForm, doctorName: e.target.value })} 
                          placeholder="Bs. Nguyễn Văn An" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Email quản trị *</label>
                        <input 
                          required 
                          type="email" 
                          value={businessForm.email} 
                          onChange={e => setBusinessForm({ ...businessForm, email: e.target.value })} 
                          placeholder="an.nguyen@hhdental.vn" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Mật khẩu khởi tạo *</label>
                      <input 
                        required 
                        type="password" 
                        defaultValue="Admin@2026" 
                        placeholder="••••••••" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-800 text-[11px] text-indigo-300 space-y-1">
                      <span className="font-bold text-white block">✨ Tự động kích hoạt:</span>
                      <p>✓ Cấp ngay CRM chuẩn HH Dental với đầy đủ module Lâm sàng, Visits, Khách hàng</p>
                      <p>✓ Sẵn sàng chính sách Chuỗi Khách (20% - 2%) và Cây Đối Tác (1% nhánh)</p>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-sm font-semibold">
                      Khởi tạo CRM & Vào Giao diện Ngay →
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setCurrentView('business_crm'); setShowAuthModal(false); }} className="space-y-4 text-left text-xs">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Email</label>
                      <input required type="email" defaultValue="admin@smilecare.vn" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Mật khẩu</label>
                      <input required type="password" defaultValue="password123" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-sm font-semibold">
                      Đăng nhập & Vào CRM
                    </Button>
                  </form>
                )}

                <div className="text-center pt-2 text-xs text-slate-400">
                  {authMode === 'register' ? (
                    <span>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-indigo-400 hover:underline">Đăng nhập</button></span>
                  ) : (
                    <span>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-indigo-400 hover:underline">Tạo tài khoản mới</button></span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
            <p>© 2026 PartnerOS Platform. Sẵn sàng mô hình HH Dental CRM (https://github.com/Quileute97/hh-dental-crm) cho toàn bộ Doanh nghiệp.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
