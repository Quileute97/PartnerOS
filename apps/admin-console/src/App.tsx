import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Building2, 
  Coins, 
  Users, 
  BarChart3, 
  FileCheck2, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  History,
  Lock
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, StatCard } from '@partner-os/ui';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orgs' | 'settlements' | 'risk' | 'audit'>('overview');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/30">
              OP
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white leading-none">PartnerOS</h1>
              <span className="text-[11px] text-red-400 font-medium">Platform Operator</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Tổng quan Hệ sinh thái
            </button>
            <button
              onClick={() => setActiveTab('orgs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'orgs' ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Kiểm duyệt Doanh nghiệp
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settlements' ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              Đối soát & Sổ cái Sàn
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'risk' ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Trust & Risk (Phòng gian lận)
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'audit' ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              System Audit Logs
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Operator Clearance: Root</span>
          </div>
          <p className="mt-1">Dual-approval Enabled</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between shrink-0 bg-slate-900/60 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Operator Console</span>
            <span>/</span>
            <span className="text-white font-semibold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-mono">
              SECURITY_LEVEL_HIGH
            </span>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                  title="Tổng Doanh nghiệp (Orgs)"
                  value="128 DN"
                  change="+12 DN mới tuần này"
                  isPositive={true}
                  icon={<Building2 className="w-5 h-5 text-indigo-400" />}
                />
                <StatCard 
                  title="Cộng tác viên toàn sàn"
                  value="3,420 CTV"
                  change="+240 đối tác mới"
                  isPositive={true}
                  icon={<Users className="w-5 h-5 text-emerald-400" />}
                />
                <StatCard 
                  title="Tổng GMV Giao dịch"
                  value="14.2 Tỷ ₫"
                  change="+22.5% tăng trưởng tháng"
                  isPositive={true}
                  icon={<Coins className="w-5 h-5 text-sky-400" />}
                />
                <StatCard 
                  title="Cảnh báo Rủi ro (Risk Flags)"
                  value="3 Vụ việc"
                  change="Cần điều tra xác minh"
                  isPositive={false}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
                />
              </div>

              {/* Moderation queue preview */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Doanh nghiệp chờ thẩm định & Kích hoạt Marketplace</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800 text-sm">
                    {[
                      { name: 'Nha Khoa SmileCare VN', taxId: '0314892831', industry: 'Y tế / Nha khoa', rep: 'Nguyễn Văn An', status: 'verified' },
                      { name: 'BĐS SkyLand Group', taxId: '0108928172', industry: 'Bất động sản', rep: 'Trần Minh Quân', status: 'verified' },
                      { name: 'Thẩm Mỹ Viện BeautyStar', taxId: '0317829104', industry: 'Thẩm mỹ', rep: 'Phạm Thu Hằng', status: 'pending' },
                    ].map((org, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                        <div>
                          <p className="font-semibold text-white">{org.name}</p>
                          <p className="text-xs text-slate-400">MST: {org.taxId} • Ngành: {org.industry} • Đại diện: {org.rep}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={org.status === 'verified' ? 'success' : 'warning'}>
                            {org.status === 'verified' ? 'Đã xác thực' : 'Chờ thẩm định'}
                          </Badge>
                          {org.status === 'pending' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                              Phê duyệt
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orgs' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Danh mục Tổ chức Doanh nghiệp toàn hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-slate-400">
                Hiển thị toàn bộ các Tenant đã đăng ký kèm mã định danh UUID, thông tin pháp nhân, trạng thái tên miền riêng và hạn ngạch gói dịch vụ.
              </CardContent>
            </Card>
          )}

          {activeTab === 'settlements' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Sổ cái Tài chính & Đợt đối soát tập trung</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-slate-400">
                Tổng hợp bút toán kép giữa Nợ phải trả của Doanh nghiệp (Debit: tenant_payable) và Phải thu của CTV (Credit: partner_receivable). Cơ chế kiểm toán bất biến.
              </CardContent>
            </Card>
          )}

          {activeTab === 'risk' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Trust & Risk Engine — Phát hiện Gian lận</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-slate-400">
                Theo dõi các tín hiệu bất thường: Tự giới thiệu chính mình (Self-referral), trùng IP/Device Fingerprint, tỷ lệ hoàn tiền/hủy đơn cao bất thường. Hỗ trợ tạo case điều tra và giữ hoa hồng (Hold).
              </CardContent>
            </Card>
          )}

          {activeTab === 'audit' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Nhật ký Kiểm toán Hệ thống (Immutable Audit Trail)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-slate-400">
                Toàn bộ thao tác can thiệp của Quản trị viên sàn, thay đổi chính sách, đảo bút toán kế toán đều được ký số và lưu trữ bất biến.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
