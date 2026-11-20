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
  DollarSign,
  Package,
  Receipt,
  UserPlus,
  PhoneCall,
  Calendar,
  Tag,
  Search,
  Filter,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard, Input } from '@partner-os/ui';
import type { 
  CRMContact, 
  CRMLead, 
  CRMDeal, 
  CRMProduct, 
  CRMTransaction, 
  CRMActivity 
} from '@partner-os/shared-types';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'leads' | 'deals' | 'products' | 'transactions' | 'affiliate' | 'settlement' | 'team'>('dashboard');
  const [activeBranch, setActiveBranch] = useState<string>('all');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Platform Info */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              P
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PartnerOS</h1>
              <span className="text-xs text-indigo-400 font-medium">Business CRM v1.0</span>
            </div>
          </div>

          {/* Tenant & Branch Context */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Nha Khoa SmileCare VN</span>
            </div>
            <div className="mt-2">
              <select 
                value={activeBranch} 
                onChange={(e) => setActiveBranch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Toàn bộ chi nhánh</option>
                <option value="branch-main">Trụ sở Quận 1 (Phòng khám chính)</option>
                <option value="branch-q7">Chi nhánh Quận 7</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <NavItem 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Dashboard Tổng quan" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              icon={<Users className="w-4 h-4" />} 
              label="Khách hàng (Contacts)" 
              active={activeTab === 'contacts'} 
              onClick={() => setActiveTab('contacts')} 
            />
            <NavItem 
              icon={<UserPlus className="w-4 h-4" />} 
              label="Khách tiềm năng (Leads)" 
              active={activeTab === 'leads'} 
              onClick={() => setActiveTab('leads')} 
            />
            <NavItem 
              icon={<Kanban className="w-4 h-4" />} 
              label="Cơ hội bán hàng (Deals)" 
              active={activeTab === 'deals'} 
              onClick={() => setActiveTab('deals')} 
            />
            <NavItem 
              icon={<Package className="w-4 h-4" />} 
              label="Sản phẩm & Dịch vụ" 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')} 
            />
            <NavItem 
              icon={<Receipt className="w-4 h-4" />} 
              label="Đơn hàng & Giao dịch" 
              active={activeTab === 'transactions'} 
              onClick={() => setActiveTab('transactions')} 
            />
            <NavItem 
              icon={<Share2 className="w-4 h-4" />} 
              label="Mạng lưới CTV & Link" 
              active={activeTab === 'affiliate'} 
              onClick={() => setActiveTab('affiliate')} 
            />
            <NavItem 
              icon={<Coins className="w-4 h-4" />} 
              label="Hoa hồng & Đối soát" 
              active={activeTab === 'settlement'} 
              onClick={() => setActiveTab('settlement')} 
            />
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Nhân sự & Chi nhánh" 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
            />
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloudflare Edge + Supabase</span>
          </div>
          <p className="mt-1 font-mono text-[11px]">Tenant RLS: Active</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Doanh nghiệp</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-800 capitalize">
              {activeTab === 'dashboard' && 'Dashboard Tổng quan'}
              {activeTab === 'contacts' && 'Quản lý Khách hàng'}
              {activeTab === 'leads' && 'Quản lý Khách tiềm năng (Leads)'}
              {activeTab === 'deals' && 'Cơ hội Bán hàng (Deals Pipeline)'}
              {activeTab === 'products' && 'Danh mục Sản phẩm & Dịch vụ'}
              {activeTab === 'transactions' && 'Giao dịch & Đơn hàng'}
              {activeTab === 'affiliate' && 'Chiến dịch Affiliate'}
              {activeTab === 'settlement' && 'Kỳ đối soát hoa hồng'}
              {activeTab === 'team' && 'Nhân sự & Chi nhánh'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 text-slate-600">
              <ExternalLink className="w-3.5 h-3.5" />
              Xem trang đích Affiliate
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                BS
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">Bác sĩ An</p>
                <span className="text-[10px] text-indigo-600 font-medium">Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="p-8 space-y-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab as any)} />}
          {activeTab === 'contacts' && <ContactsView />}
          {activeTab === 'leads' && <LeadsView onNavigate={(tab) => setActiveTab(tab as any)} />}
          {activeTab === 'deals' && <DealsKanbanView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'affiliate' && <AffiliateCampaignsView />}
          {activeTab === 'settlement' && <SettlementView />}
          {activeTab === 'team' && <TeamManagementView />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ==========================================
// 1. DASHBOARD VIEW
// ==========================================
function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan Hoạt động Kinh doanh & CRM</h2>
          <p className="text-slate-500 text-sm mt-0.5">Dữ liệu thời gian thực được đồng bộ qua Cloudflare Edge API & PostgreSQL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate('transactions')}>+ Tạo Giao dịch</Button>
          <Button onClick={() => onNavigate('affiliate')}>+ Tạo chiến dịch CTV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Tổng Doanh thu"
          value="485,000,000 ₫"
          change="+18.4% so với tháng trước"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Khách hàng (Contacts)"
          value="142 Khách"
          change="+32 khách tuần này"
          isPositive={true}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Tỷ lệ chuyển đổi Lead"
          value="26.8%"
          change="+3.2% chuyển đổi"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          title="Hoa hồng CTV chờ duyệt"
          value="48,500,000 ₫"
          change="8 giao dịch cần duyệt"
          isPositive={false}
          icon={<Coins className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Sản phẩm & Dịch vụ Doanh thu cao nhất</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>Xem danh mục</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Cấy ghép Implant Straumann Thụy Sĩ', sku: 'IMP-STRAUMANN', category: 'Cấy ghép Implant', sales: 8, revenue: '280,000,000 ₫', comm: '10%' },
                { name: 'Niềng răng máng trong suốt Invisalign', sku: 'NIENG-INVISALIGN', category: 'Chỉnh nha', sales: 2, revenue: '170,000,000 ₫', comm: '8%' },
                { name: 'Răng sứ thẩm mỹ Cercon HT Đức', sku: 'SU-CERCON-HT', category: 'Răng sứ', sales: 14, revenue: '84,000,000 ₫', comm: '10%' },
              ].map((p, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      <span className="text-xs font-mono text-slate-500">SKU: {p.sku} • {p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{p.revenue}</p>
                    <p className="text-xs text-emerald-600 font-medium">{p.sales} ca điều trị • Hoa hồng: {p.comm}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo Chi nhánh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Trụ sở Quận 1 (Phòng khám chính)</span>
                  <span className="font-bold">395,000,000 ₫ (81%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[81%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Chi nhánh Quận 7</span>
                  <span className="font-bold">90,000,000 ₫ (19%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[19%] rounded-full"></div>
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={() => onNavigate('team')}>
              Quản lý mạng lưới chi nhánh
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 2. CONTACTS VIEW (CUSTOMER MANAGEMENT)
// ==========================================
function ContactsView() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<CRMContact[]>([
    {
      id: 'c-01',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Phạm Minh Đức',
      phone: '0912345678',
      email: 'duc.pham@example.com',
      address: '25 Nguyễn Huệ, Quận 1, TP.HCM',
      partnerId: 'partner-001',
      referralCode: 'REF_TUAN_VIP',
      source: 'Affiliate',
      tags: ['Khách VIP', 'Implant'],
      assignedTo: 'user-sales-1',
      customFields: {
        dental_service_type: 'Trồng răng Implant Straumann',
        appointment_date: '2026-11-25 09:30'
      },
      notesCount: 2,
      activitiesCount: 4,
      dealsCount: 1,
      totalSpent: 35000000,
      createdAt: '2026-11-15T08:00:00Z',
      updatedAt: '2026-11-20T14:15:00Z'
    },
    {
      id: 'c-02',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Vũ Lan Anh',
      phone: '0988765432',
      email: 'lananh.vu@example.com',
      address: '15 Thảo Điền, TP. Thủ Đức',
      partnerId: 'partner-002',
      referralCode: 'REF_THAO_BEAUTY',
      source: 'Affiliate',
      tags: ['Răng sứ'],
      assignedTo: 'user-sales-1',
      customFields: {
        dental_service_type: 'Bọc răng sứ Cercon HT'
      },
      notesCount: 1,
      activitiesCount: 2,
      dealsCount: 1,
      totalSpent: 24000000,
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T11:00:00Z'
    },
    {
      id: 'c-03',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-q7',
      name: 'Đỗ Quốc Hùng',
      phone: '0934112233',
      email: 'hung.do@example.com',
      address: '78 Nguyễn Thị Thập, Quận 7',
      partnerId: null,
      referralCode: null,
      source: 'Direct',
      tags: ['Khám tổng quát'],
      assignedTo: 'user-sales-1',
      customFields: {
        dental_service_type: 'Nhổ răng khôn & Cạo vôi răng'
      },
      notesCount: 0,
      activitiesCount: 1,
      dealsCount: 0,
      totalSpent: 3500000,
      createdAt: '2026-11-19T16:40:00Z',
      updatedAt: '2026-11-19T16:40:00Z'
    }
  ]);

  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    serviceType: 'Trồng răng Implant'
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;

    // Check duplicate phone
    if (contacts.some(c => c.phone === newCust.phone)) {
      alert(`Số điện thoại ${newCust.phone} đã tồn tại trong danh bạ khách hàng!`);
      return;
    }

    const created: CRMContact = {
      id: `c-${Date.now()}`,
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: newCust.name,
      phone: newCust.phone,
      email: newCust.email || null,
      address: newCust.address || null,
      source: 'Direct',
      tags: ['Khách mới'],
      customFields: { dental_service_type: newCust.serviceType },
      notesCount: 0,
      activitiesCount: 1,
      dealsCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContacts([created, ...contacts]);
    setShowAddModal(false);
    setNewCust({ name: '', phone: '', email: '', address: '', serviceType: 'Trồng răng Implant' });
  };

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Danh bạ Khách hàng (Customers / Contacts)</h2>
          <p className="text-sm text-slate-500">Lưu trữ hồ sơ, lịch sử giao dịch và trường tùy biến đặc thù (JSONB Custom Fields)</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Thêm khách hàng mới</Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Tìm theo tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Nguồn / CTV Giới thiệu</th>
                <th className="p-4">Dịch vụ quan tâm</th>
                <th className="p-4">Tổng chi tiêu</th>
                <th className="p-4">Tags</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <span className="text-xs text-slate-400">{c.email || 'Chưa có email'}</span>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-800">{c.phone}</td>
                  <td className="p-4">
                    {c.partnerId ? (
                      <div>
                        <span className="font-semibold text-slate-800 text-xs">CTV: {c.referralCode}</span>
                        <span className="block text-[11px] text-emerald-600 font-medium">Bảo lưu 60 ngày</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Khách tự nhiên (Direct)</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {c.customFields?.dental_service_type || 'Chưa xác định'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {(c.totalSpent || 0).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).map((t, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => alert(`Mở Timeline hồ sơ của khách: ${c.name}`)}>
                      Timeline
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Thêm Khách hàng Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Họ và tên *</label>
                <input required value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
                <input required value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="0901234567" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input type="email" value={newCust.email} onChange={e => setNewCust({ ...newCust, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="customer@example.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dịch vụ quan tâm (Trường đặc thù)</label>
                <select value={newCust.serviceType} onChange={e => setNewCust({ ...newCust, serviceType: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="Trồng răng Implant">Trồng răng Implant Straumann</option>
                  <option value="Bọc răng sứ Cercon HT">Bọc răng sứ Cercon HT</option>
                  <option value="Niềng răng Invisalign">Niềng răng Invisalign</option>
                  <option value="Nhổ răng khôn">Nhổ răng khôn tiểu phẫu</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Hủy</Button>
                <Button type="submit">Lưu khách hàng</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. LEADS VIEW (POTENTIAL CUSTOMERS)
// ==========================================
function LeadsView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [leads, setLeads] = useState<CRMLead[]>([
    {
      id: 'lead-01',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Hoàng Khánh Linh',
      phone: '0977112233',
      email: 'linh.hoang@example.com',
      source: 'Affiliate Link',
      status: 'contacted',
      score: 80,
      estimatedValue: 40000000,
      assignedTo: 'user-sales-1',
      partnerId: 'partner-001',
      referralCode: 'REF_TUAN_VIP',
      followUpDate: '2026-11-22T14:00:00Z',
      notes: 'Quan tâm niềng răng Invisalign, đã gửi bảng giá chi tiết',
      customFields: {},
      createdAt: '2026-11-19T09:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z'
    },
    {
      id: 'lead-02',
      tenantId: 'org-smilecare-01',
      branchId: 'branch-main',
      name: 'Trần Văn Bảo',
      phone: '0918223344',
      email: 'bao.tran@example.com',
      source: 'Landing Page Form',
      status: 'new',
      score: 65,
      estimatedValue: 25000000,
      assignedTo: 'user-sales-1',
      partnerId: null,
      referralCode: null,
      notes: 'Đăng ký nhận voucher giảm giá trồng răng Implant',
      customFields: {},
      createdAt: '2026-11-20T16:00:00Z',
      updatedAt: '2026-11-20T16:00:00Z'
    }
  ]);

  const handleConvertLead = (leadId: string) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'converted' } : l));
    alert('Đã chuyển đổi Lead thành công thành Khách hàng & Tạo cơ hội bán hàng (Deal)!');
    onNavigate('deals');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Khách tiềm năng (Leads)</h2>
          <p className="text-sm text-slate-500">Thu thập từ Landing Page, Form đăng ký và Affiliate Link trước khi chuyển đổi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leads.map((l) => (
          <Card key={l.id} className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-slate-900">{l.name}</h3>
                <p className="text-xs font-mono text-slate-500">{l.phone} • {l.email}</p>
              </div>
              <Badge variant={l.status === 'converted' ? 'success' : l.status === 'contacted' ? 'info' : 'warning'}>
                {l.status === 'converted' ? 'Đã chuyển đổi' : l.status === 'contacted' ? 'Đã liên hệ' : 'Lead mới'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {l.notes || 'Chưa có ghi chú'}
            </p>

            <div className="flex justify-between items-center pt-2 text-xs text-slate-500 border-t border-slate-100">
              <span>Giá trị dự kiến: <strong className="text-indigo-600">{(l.estimatedValue || 0).toLocaleString('vi-VN')} ₫</strong></span>
              {l.status !== 'converted' ? (
                <Button size="sm" onClick={() => handleConvertLead(l.id)}>
                  Chuyển đổi thành Deal →
                </Button>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã tạo Hợp đồng
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. DEALS KANBAN VIEW
// ==========================================
function DealsKanbanView() {
  const stages = [
    { id: 'stage-new', title: 'Tư vấn mới', count: 5, color: 'border-blue-500' },
    { id: 'stage-booked', title: 'Đã hẹn lịch khám', count: 3, color: 'border-amber-500' },
    { id: 'stage-in_progress', title: 'Đang điều trị', count: 4, color: 'border-purple-500' },
    { id: 'stage-won', title: 'Chốt thành công (Won)', count: 8, color: 'border-emerald-500' },
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
          <div key={stage.id} className="bg-slate-100 rounded-xl p-3 flex flex-col gap-3 min-h-[420px]">
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

// ==========================================
// 5. PRODUCTS & SERVICES VIEW
// ==========================================
function ProductsView() {
  const [products] = useState<CRMProduct[]>([
    {
      id: 'prod-01',
      tenantId: 'org-smilecare-01',
      sku: 'IMP-STRAUMANN',
      name: 'Cấy ghép Implant Straumann Thụy Sĩ',
      description: 'Trụ Implant cao cấp tích hợp xương nhanh',
      category: 'Cấy ghép Implant',
      type: 'service',
      unitPrice: 35000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 10,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'prod-02',
      tenantId: 'org-smilecare-01',
      sku: 'SU-CERCON-HT',
      name: 'Răng sứ thẩm mỹ Cercon HT Đức',
      description: 'Răng toàn sứ độ bền cao, bảo hành 10 năm',
      category: 'Răng sứ thẩm mỹ',
      type: 'service',
      unitPrice: 6000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 10,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    },
    {
      id: 'prod-03',
      tenantId: 'org-smilecare-01',
      sku: 'NIENG-INVISALIGN',
      name: 'Niềng răng máng trong suốt Invisalign',
      description: 'Chỉnh nha thẩm mỹ công nghệ Mỹ',
      category: 'Chỉnh nha - Niềng răng',
      type: 'service',
      unitPrice: 85000000,
      currency: 'VND',
      isCommissionEligible: true,
      defaultCommissionRate: 8,
      isActive: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z'
    }
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Danh mục Sản phẩm & Dịch vụ</h2>
          <p className="text-sm text-slate-500">Quản lý bảng giá, danh mục kỹ thuật và chính sách tính hoa hồng mặc định</p>
        </div>
        <Button>+ Thêm Dịch vụ / Sản phẩm</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã SKU</th>
                <th className="p-4">Tên Sản phẩm / Dịch vụ</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Đơn giá niêm yết</th>
                <th className="p-4">Chính sách Hoa hồng</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-800">{p.sku}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="p-4 text-xs text-slate-600">{p.category}</td>
                  <td className="p-4 font-mono font-bold text-indigo-600">{p.unitPrice.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-4">
                    <Badge variant="success">Áp dụng hoa hồng {p.defaultCommissionRate}%</Badge>
                  </td>
                  <td className="p-4"><Badge variant="default">Kích hoạt</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 6. TRANSACTIONS VIEW
// ==========================================
function TransactionsView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Đơn hàng & Giao dịch Bán hàng (Transactions)</h2>
          <p className="text-sm text-slate-500">Bảo vệ tính toàn vẹn tài chính bằng Idempotency Key và Lưu trữ bất biến</p>
        </div>
        <Button>+ Tạo Giao dịch mới</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã giao dịch</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Chi nhánh</th>
                <th className="p-4">CTV Ghi nhận</th>
                <th className="p-4">Giá trị thanh toán</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-slate-900">TX-20261120-001</td>
                <td className="p-4">
                  <p className="font-semibold text-slate-900">Phạm Minh Đức</p>
                  <span className="text-xs text-slate-400 font-mono">0912***678</span>
                </td>
                <td className="p-4 text-xs font-medium text-slate-700">Trụ sở Quận 1</td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800 text-xs">Nguyễn Văn Tuấn</span>
                  <span className="block text-[11px] text-emerald-600 font-mono font-bold">+3,500,000 ₫</span>
                </td>
                <td className="p-4 font-mono font-extrabold text-indigo-600">35,000,000 ₫</td>
                <td className="p-4 text-xs">Chuyển khoản (VietQR)</td>
                <td className="p-4"><Badge variant="success">Đã thanh toán</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 7. AFFILIATE & SETTLEMENT VIEWS
// ==========================================
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

// ==========================================
// 8. TEAM & BRANCHES VIEW
// ==========================================
function TeamManagementView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Đội ngũ Nhân sự & Phân quyền RBAC</h2>
          <p className="text-sm text-slate-500">Phân quyền chi tiết theo vai trò và gán phạm vi chi nhánh trực thuộc</p>
        </div>
        <Button>+ Mời nhân viên mới</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nhân sự</th>
                <th className="p-4">Vai trò (RBAC Role)</th>
                <th className="p-4">Chi nhánh trực thuộc</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-semibold text-slate-900">Bác Sĩ Nguyễn Văn An</p>
                  <span className="text-xs text-slate-400">admin@smilecare.vn</span>
                </td>
                <td className="p-4"><Badge variant="default">Chủ doanh nghiệp (Owner)</Badge></td>
                <td className="p-4 text-xs font-medium">Toàn hệ thống</td>
                <td className="p-4"><Badge variant="success">Đang hoạt động</Badge></td>
                <td className="p-4 text-right"><Button variant="outline" size="sm">Sửa quyền</Button></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-semibold text-slate-900">Lê Thu Trang</p>
                  <span className="text-xs text-slate-400">trang.le@smilecare.vn</span>
                </td>
                <td className="p-4"><Badge variant="info">Nhân viên Sales (sales_rep)</Badge></td>
                <td className="p-4 text-xs font-medium">Trụ sở Quận 1</td>
                <td className="p-4"><Badge variant="success">Đang hoạt động</Badge></td>
                <td className="p-4 text-right"><Button variant="outline" size="sm">Sửa quyền</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
