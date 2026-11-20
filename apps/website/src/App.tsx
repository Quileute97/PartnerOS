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
  Users
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@partner-os/ui';

export function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'business_user' | 'partner'>('business_user');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
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
            <a href="#marketplace" className="hover:text-white transition-colors">Marketplace</a>
            <a href="#ledger" className="hover:text-white transition-colors">Sổ cái Kế toán</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
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
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
            >
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hệ điều hành Doanh nghiệp & Mạng lưới Đối tác Toàn cầu</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Universal Business CRM & <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Centralized Affiliate Marketplace
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Kết nối Doanh nghiệp với Mạng lưới Đối tác & Cộng tác viên (CTV) thông qua CRM cá nhân hóa đa ngành, cơ chế Tracking lưu cookie 60 ngày và Sổ cái kế toán kép bất biến.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25"
            onClick={() => { setAuthMode('register'); setRole('business_user'); setShowAuthModal(true); }}
          >
            Dành cho Doanh nghiệp (CRM) <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto px-8 gap-2 border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold"
            onClick={() => { setAuthMode('register'); setRole('partner'); setShowAuthModal(true); }}
          >
            Dành cho Cộng tác viên (CTV)
          </Button>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="solutions" className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">Nền tảng Công nghệ Doanh nghiệp Hoàn chỉnh</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">Kiến trúc API-first trên Cloudflare Edge và Supabase Multi-tenant RLS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Universal CRM Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hỗ trợ trường dữ liệu động (JSONB Custom Fields) phù hợp mọi ngành nghề: Nha khoa, BĐS, Spa, Giáo dục, B2B. Quản lý đa chi nhánh và phân quyền RBAC hạt mịn.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Affiliate Marketplace</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Một danh tính CTV toàn cầu có thể khám phá và tham gia chiến dịch hoa hồng của nhiều doanh nghiệp cùng lúc. Tự động cấp link referral và mã QR cá nhân.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Double-Entry Financial Ledger</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sổ cái kế toán kép bất biến (Immutable Ledger). Chặn tuyệt đối hành vi sửa/xóa bút toán, tự động đối soát và giải ngân minh bạch định kỳ ngày 15 & 30 hàng tháng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal Mockup */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {authMode === 'register' ? 'Đăng ký tài khoản PartnerOS' : 'Đăng nhập vào hệ sinh thái'}
                </h3>
                <p className="text-xs text-slate-400">Một danh tính sử dụng cho toàn bộ các cổng</p>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {authMode === 'register' && (
              <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRole('business_user')}
                  className={`flex-1 py-2 rounded-md transition-colors ${role === 'business_user' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Doanh nghiệp (CRM)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  className={`flex-1 py-2 rounded-md transition-colors ${role === 'partner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Cộng tác viên (CTV)
                </button>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); alert('Xác thực thành công! Đang chuyển hướng vào Portal...'); setShowAuthModal(false); }} className="space-y-4 text-left">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Họ và tên</label>
                  <input required placeholder="Nguyễn Văn A" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                <input required type="email" placeholder="name@domain.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mật khẩu</label>
                <input required type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5">
                {authMode === 'register' ? 'Tạo tài khoản ngay' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              {authMode === 'register' ? (
                <span>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-indigo-400 hover:underline">Đăng nhập</button></span>
              ) : (
                <span>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-indigo-400 hover:underline">Đăng ký ngay</button></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 PartnerOS Platform. All rights reserved. Architected for Multi-tenant SaaS & Financial Integrity.</p>
      </footer>
    </div>
  );
}
