import React, { useState } from 'react';
import { 
  Users, 
  Kanban, 
  Share2, 
  Coins, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building2,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard, Input } from '@partner-os/ui';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'deals' | 'affiliate' | 'settlement'>('dashboard');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              P
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PartnerOS</h1>
              <span className="text-xs text-indigo-400 font-medium">Business Portal</span>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Doanh nghiệp:</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">Nha Khoa SmileCare VN</p>
            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
              Domain: smilecare.partneros.vn
            </span>
          </div>

          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'contacts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Khách hàng (Contacts)
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'deals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Cơ hội bán hàng (Deals)
            </button>
            <button
              onClick={() => setActiveTab('affiliate')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'affiliate' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Mạng lưới CTV & Link
            </button>
            <button
              onClick={() => setActiveTab('settlement')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'settlement' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              Hoa hồng & Đối soát
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloudflare Edge + Supabase</span>
          </div>
          <p className="mt-1">Multi-tenant RLS Enabled</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Doanh nghiệp</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-800 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 text-slate-600">
              <ExternalLink className="w-3.5 h-3.5" />
              Xem trang đích Affiliate
            </Button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="p-8 space-y-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab as any)} />}
          {activeTab === 'contacts' && <ContactsView />}
          {activeTab === 'deals' && <DealsKanbanView />}
          {activeTab === 'affiliate' && <AffiliateCampaignsView />}
          {activeTab === 'settlement' && <SettlementView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan Hoạt động Kinh doanh & Đối tác</h2>
          <p className="text-slate-500 text-sm mt-0.5">Dữ liệu thời gian thực được đồng bộ qua Cloudflare API & Supabase</p>
        </div>
        <Button onClick={() => onNavigate('affiliate')}>+ Tạo chiến dịch CTV mới</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Doanh thu từ CTV"
          value="485,000,000 ₫"
          change="+18.4% so với tháng trước"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Lead CTV giới thiệu"
          value="142 Khách"
          change="+32 lead tuần này"
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Tỷ lệ chốt thành công"
          value="26.8%"
          change="+3.2% chuyển đổi"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Hoa hồng chờ duyệt"
          value="48,500,000 ₫"
          change="8 giao dịch cần duyệt"
          isPositive={false}
          icon={<Coins className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Cộng tác viên xuất sắc nhất tháng</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('affiliate')}>Xem tất cả</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Nguyễn Văn Tuấn', code: 'REF_TUAN_VIP', leads: 48, revenue: '165,000,000 ₫', commission: '16,500,000 ₫', rank: '1' },
                { name: 'Trần Thị Thu Thảo', code: 'REF_THAO_BEAUTY', leads: 34, revenue: '120,000,000 ₫', commission: '12,000,000 ₫', rank: '2' },
                { name: 'Lê Hoàng Nam', code: 'REF_NAM_DENTAL', leads: 22, revenue: '85,000,000 ₫', commission: '8,500,000 ₫', rank: '3' },
              ].map((partner) => (
                <div key={partner.code} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      #{partner.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{partner.name}</p>
                      <span className="text-xs font-mono text-slate-500">{partner.code}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{partner.revenue}</p>
                    <p className="text-xs text-emerald-600 font-medium">Hoa hồng: {partner.commission}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tình trạng Đối soát</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Kỳ đối soát T11/2026</span>
                <Badge variant="warning">Đang chốt số</Badge>
              </div>
              <p className="text-2xl font-bold text-amber-950 mt-2">48,500,000 ₫</p>
              <p className="text-xs text-amber-700 mt-1">Hạn thanh toán: 30/11/2026 (12 CTV)</p>
            </div>

            <Button className="w-full" onClick={() => onNavigate('settlement')}>
              Mở bảng duyệt đối soát
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactsView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Danh bạ Khách hàng (Contacts)</h2>
          <p className="text-sm text-slate-500">Lưu trữ các trường dữ liệu tùy biến theo ngành (JSONB Custom Fields)</p>
        </div>
        <Button>+ Thêm khách hàng thủ công</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">CTV giới thiệu</th>
                <th className="p-4">Trường đặc thù (Nha khoa)</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Phạm Minh Đức', phone: '0912 345 678', partner: 'Nguyễn Văn Tuấn', code: 'REF_TUAN_VIP', service: 'Niềng răng Invisalign', date: '20/11/2026 14:15' },
                { name: 'Vũ Lan Anh', phone: '0988 765 432', partner: 'Trần Thị Thu Thảo', code: 'REF_THAO_BEAUTY', service: 'Bọc răng sứ Cercon HT', date: '20/11/2026 11:00' },
                { name: 'Đỗ Quốc Hùng', phone: '0934 112 233', partner: 'Tự nhiên (Direct)', code: '-', service: 'Cấy ghép Implant Straumann', date: '19/11/2026 16:40' },
              ].map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="p-4 font-mono">{c.phone}</td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{c.partner}</span>
                    <span className="block text-xs text-slate-400 font-mono">{c.code}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {c.service}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{c.date}</td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm">Tạo Deal</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DealsKanbanView() {
  const stages = [
    { title: 'Tư vấn mới', count: 5, color: 'border-blue-500' },
    { title: 'Đã hẹn lịch khám', count: 3, color: 'border-amber-500' },
    { title: 'Đang điều trị', count: 4, color: 'border-purple-500' },
    { title: 'Chốt thành công (Won)', count: 8, color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pipeline Cơ hội Bán hàng (Deals)</h2>
          <p className="text-sm text-slate-500">Chuyển sang "Won" sẽ tự động kích hoạt tính toán hoa hồng cho CTV</p>
        </div>
        <Button>+ Tạo Giao dịch mới</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="bg-slate-100 rounded-xl p-3 flex flex-col gap-3 min-h-[400px]">
            <div className={`flex justify-between items-center pb-2 border-b-2 ${stage.color}`}>
              <h3 className="font-semibold text-slate-800 text-sm">{stage.title}</h3>
              <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold text-slate-600 shadow-sm">
                {stage.count}
              </span>
            </div>

            {idx === 3 && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-slate-900">Trồng Implant - Phạm Minh Đức</span>
                  <Badge variant="success">Won</Badge>
                </div>
                <p className="text-lg font-bold text-indigo-600">35,000,000 ₫</p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                  <span>CTV: Nguyễn Văn Tuấn</span>
                  <span className="text-emerald-600 font-semibold">+3,500,000 ₫</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AffiliateCampaignsView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Chiến dịch Affiliate & Tuyển Cộng tác viên</h2>
          <p className="text-sm text-slate-500">Thiết lập chính sách hoa hồng, cấp Referral link & mã QR</p>
        </div>
        <Button>+ Tạo chiến dịch mới</Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">Chương trình Giới thiệu Khách Niềng Răng & Implant 2026</h3>
                <Badge variant="success">Đang kích hoạt</Badge>
                <Badge variant="default">Công khai trên Marketplace</Badge>
              </div>
              <p className="text-sm text-slate-600">Hoa hồng 10% trên tổng giá trị giao dịch thành công. Cookie tracking: 60 ngày.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Cộng tác viên đang tham gia</p>
              <p className="text-2xl font-bold text-indigo-600">42 CTV</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettlementView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Hoa hồng & Lập kỳ Đối soát</h2>
          <p className="text-sm text-slate-500">Sổ cái kế toán kép (Double-Entry Ledger) - Bất biến & Minh bạch kiểm toán</p>
        </div>
        <Button>+ Tạo kỳ đối soát mới</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã hoa hồng</th>
                <th className="p-4">Cộng tác viên</th>
                <th className="p-4">Giá trị Deal</th>
                <th className="p-4">Tỷ lệ</th>
                <th className="p-4">Tiền hoa hồng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Duyệt & Khóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-mono text-xs">COMM-101</td>
                <td className="p-4 font-semibold text-slate-900">Nguyễn Văn Tuấn</td>
                <td className="p-4 font-mono">35,000,000 ₫</td>
                <td className="p-4">10%</td>
                <td className="p-4 font-bold text-indigo-600 font-mono">3,500,000 ₫</td>
                <td className="p-4"><Badge variant="warning">Chờ duyệt</Badge></td>
                <td className="p-4 text-right">
                  <Button size="sm">Phê duyệt hoa hồng</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
