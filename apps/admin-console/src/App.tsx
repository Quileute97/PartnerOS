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
  Lock,
  ExternalLink,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, StatCard } from '@partner-os/ui';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orgs' | 'settlements' | 'risk' | 'audit'>('overview');

  // Interactive Verification State
  const [orgs, setOrgs] = useState([
    { id: 'org-1', name: 'Nha Khoa SmileCare VN', taxId: '0314892831', industry: 'Y tế / Nha khoa', rep: 'Nguyễn Văn An', status: 'verified' },
    { id: 'org-2', name: 'BĐS SkyLand Group', taxId: '0108928172', industry: 'Bất động sản', rep: 'Trần Minh Quân', status: 'verified' },
    { id: 'org-3', name: 'Thẩm Mỹ Viện BeautyStar', taxId: '0317829104', industry: 'Thẩm mỹ', rep: 'Phạm Thu Hằng', status: 'pending' },
    { id: 'org-4', name: 'Học Viện Anh Ngữ Global', taxId: '0319201923', industry: 'Giáo dục', rep: 'Lê Hoàng Long', status: 'pending' },
  ]);

  // Interactive Fraud Cases State
  const [fraudCases, setFraudCases] = useState([
    {
      id: 'case-01',
      partner: 'Trần Đình Nam (partner-suspicious-01)',
      tenant: 'Nha Khoa SmileCare',
      riskScore: 85,
      status: 'investigating',
      reasons: 'Tự giới thiệu chính mình (Self-referral: Trùng SĐT 0912345678)',
      amount: '3,500,000 ₫'
    },
    {
      id: 'case-02',
      partner: 'Võ Minh Trí (partner-spam-02)',
      tenant: 'BĐS SkyLand',
      riskScore: 78,
      status: 'investigating',
      reasons: 'IP Collision: Click và đặt cọc cùng IP trong vòng 4 giây',
      amount: '50,000,000 ₫'
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const approveOrg = (id: string) => {
    setOrgs(orgs.map(o => o.id === id ? { ...o, status: 'verified' } : o));
    setNotification('Đã phê duyệt hồ sơ pháp nhân doanh nghiệp thành công!');
    setTimeout(() => setNotification(null), 4000);
  };

  const resolveFraudCase = (id: string, decision: 'confirmed_fraud' | 'cleared') => {
    setFraudCases(fraudCases.map(c => c.id === id ? { ...c, status: decision } : c));
    setNotification(
      decision === 'confirmed_fraud'
        ? `Đã xác nhận gian lận cho vụ việc ${id}: Hoa hồng đã bị thu hồi vĩnh viễn.`
        : `Đã gỡ bỏ nghi vấn cho vụ việc ${id}: Hoa hồng đã được mở khóa.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

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
              <span className="text-[11px] text-red-400 font-medium">Platform Operator v1.0</span>
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
              {orgs.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-auto text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {orgs.filter(o => o.status === 'pending').length}
                </span>
              )}
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
              {fraudCases.filter(c => c.status === 'investigating').length > 0 && (
                <span className="ml-auto text-[10px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">
                  {fraudCases.filter(c => c.status === 'investigating').length}
                </span>
              )}
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
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between shrink-0 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
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

        {/* Global Notification Banner */}
        {notification && (
          <div className="bg-emerald-950 border-b border-emerald-800 px-8 py-3 text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <div className="p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                  title="Tổng Doanh nghiệp (Orgs)"
                  value={`${orgs.length} DN`}
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
                  value={`${fraudCases.filter(c => c.status === 'investigating').length} Vụ việc`}
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
                    {orgs.map((org) => (
                      <div key={org.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                        <div>
                          <p className="font-semibold text-white">{org.name}</p>
                          <p className="text-xs text-slate-400">MST: {org.taxId} • Ngành: {org.industry} • Đại diện: {org.rep}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={org.status === 'verified' ? 'success' : 'warning'}>
                            {org.status === 'verified' ? 'Đã xác thực' : 'Chờ thẩm định'}
                          </Badge>
                          {org.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => approveOrg(org.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                            >
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
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800 text-sm">
                  {orgs.map((org) => (
                    <div key={org.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{org.name}</p>
                        <p className="text-xs text-slate-400">ID: {org.id} • MST: {org.taxId} • Ngành: {org.industry}</p>
                      </div>
                      <Badge variant={org.status === 'verified' ? 'success' : 'warning'}>
                        {org.status === 'verified' ? 'Đã kích hoạt' : 'Chờ duyệt'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settlements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white">Sổ cái Kế toán Kép: Hoàn toàn Cân bằng (BALANCED)</h3>
                    <p className="text-xs text-slate-400">Tổng Nợ (Debit) = Tổng Có (Credit). Sai lệch kế toán: 0.00 VNĐ</p>
                  </div>
                </div>
                <Badge variant="success">Kiểm toán Bất biến</Badge>
              </div>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Các đợt đối soát tập trung toàn sàn</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm text-slate-400 space-y-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-white">SETTLE_2026_MID_NOV</p>
                      <p className="text-xs text-slate-500">Kỳ: 01/11/2026 - 15/11/2026 • 14 đối tác</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400 block">52,400,000 ₫</span>
                      <Badge variant="success">Đã tất toán</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">Trust & Risk Engine — Phát hiện Gian lận</h2>
                  <p className="text-xs text-slate-400">Tự động phát hiện Self-referral, IP collision, Device fingerprinting</p>
                </div>
                <Badge variant="warning">{fraudCases.filter(c => c.status === 'investigating').length} vụ đang điều tra</Badge>
              </div>

              <div className="space-y-3">
                {fraudCases.map((fCase) => (
                  <Card key={fCase.id} className="bg-slate-900 border-slate-800">
                    <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{fCase.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                            Risk Score: {fCase.riskScore}/100
                          </span>
                          <Badge variant={fCase.status === 'confirmed_fraud' ? 'danger' : fCase.status === 'cleared' ? 'success' : 'warning'}>
                            {fCase.status === 'investigating' ? 'Đang điều tra' : fCase.status === 'confirmed_fraud' ? 'Đã khoá vi phạm' : 'Đã giải phóng'}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-white">{fCase.partner}</p>
                        <p className="text-xs text-slate-400">{fCase.tenant} • Giá trị giữ: <strong className="text-amber-400">{fCase.amount}</strong></p>
                        <p className="text-xs text-red-400/90 font-medium pt-1">{fCase.reasons}</p>
                      </div>

                      {fCase.status === 'investigating' && (
                        <div className="flex gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            onClick={() => resolveFraudCase(fCase.id, 'cleared')}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
                          >
                            Bỏ qua / Giải phóng
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => resolveFraudCase(fCase.id, 'confirmed_fraud')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            Xác nhận Gian lận
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Nhật ký Kiểm toán Hệ thống (Immutable Audit Trail)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800 text-xs">
                  {[
                    { action: 'APPROVE_COMMISSION', user: 'admin-01', target: 'comm-101', ip: '113.161.45.89', time: '2026-11-20 23:40:15' },
                    { action: 'GENERATE_SETTLEMENT', user: 'system_cron', target: 'SETTLE_2026_5RGT2', ip: '127.0.0.1', time: '2026-11-20 23:45:00' },
                    { action: 'RESOLVE_FRAUD_CASE', user: 'operator-compliance', target: 'case-01', ip: '118.69.12.5', time: '2026-11-20 23:50:22' }
                  ].map((log, i) => (
                    <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-800/40 font-mono">
                      <div>
                        <span className="text-indigo-400 font-bold">{log.action}</span>
                        <span className="text-slate-400 ml-2">by {log.user} on {log.target}</span>
                      </div>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
