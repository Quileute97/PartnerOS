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
  Plus,
  Stethoscope,
  Network,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  Activity,
  Award,
  ChevronDown,
  Gift,
  ArrowRight,
  X,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard, Input } from '@partner-os/ui';

// ==========================================
// CLINICAL STEPS PRESETS (Plan V5 - HH Dental)
// ==========================================
export const CLINICAL_PRESETS = {
  implant: {
    name: 'Cấy ghép Implant Straumann Thụy Sĩ',
    category: 'Cấy ghép Implant',
    price: 35000000,
    steps: [
      { step: 1, name: 'Khám, chụp CT ConeBeam & Lên phác đồ 3D', share: 0.10, price: 3500000 },
      { step: 2, name: 'Phẫu thuật cấy ghép trụ Implant & Ghép xương', share: 0.50, price: 17500000 },
      { step: 3, name: 'Tái khám, cắt chỉ & Kiểm tra tích hợp xương', share: 0.10, price: 3500000 },
      { step: 4, name: 'Lấy dấu phục hình & Lắp Abutment', share: 0.10, price: 3500000 },
      { step: 5, name: 'Gắn mão răng toàn sứ hoàn thiện & Bàn giao bảo hành', share: 0.20, price: 7000000 },
    ]
  },
  orthodontics: {
    name: 'Niềng răng máng trong suốt Invisalign',
    category: 'Chỉnh nha - Niềng răng',
    price: 85000000,
    steps: [
      { step: 1, name: 'Khám tổng quát, Scan iTero 5D & Lập phác đồ ClinCheck', share: 0.15, price: 12750000 },
      { step: 2, name: 'Gắn Attachment & Giao đợt khay niềng số 1-10', share: 0.35, price: 29750000 },
      { step: 3, name: 'Tái khám siết răng định kỳ & Theo dõi di chuyển', share: 0.15, price: 12750000 },
      { step: 4, name: 'Tinh chỉnh khớp cắn & Giao khay tinh chỉnh', share: 0.15, price: 12750000 },
      { step: 5, name: 'Tháo Attachment, đánh bóng & Bàn giao hàm duy trì Vivera', share: 0.20, price: 17000000 },
    ]
  },
  veneers: {
    name: 'Răng toàn sứ thẩm mỹ Cercon HT Đức',
    category: 'Răng sứ thẩm mỹ',
    price: 6000000,
    steps: [
      { step: 1, name: 'Khám, Smile Design DSD & Mài cùi răng bảo tồn', share: 0.30, price: 1800000 },
      { step: 2, name: 'Lấy dấu răng kỹ thuật số & Gắn răng tạm thẩm mỹ', share: 0.20, price: 1200000 },
      { step: 3, name: 'Thử sườn sứ, tinh chỉnh đường cười & Gắn mão sứ vĩnh viễn', share: 0.40, price: 2400000 },
      { step: 4, name: 'Tái khám kiểm tra khớp cắn sau 1 tuần', share: 0.10, price: 600000 },
    ]
  },
  surgery: {
    name: 'Nhổ răng khôn sóng siêu âm Piezotome',
    category: 'Tiểu phẫu - Nhổ răng',
    price: 3500000,
    steps: [
      { step: 1, name: 'Chụp X-quang Panorama & Phẫu thuật nhổ răng Piezotome không đau', share: 0.80, price: 2800000 },
      { step: 2, name: 'Tái khám, cắt chỉ & Kiểm tra liền thương ổ răng', share: 0.20, price: 700000 },
    ]
  }
};

export interface ClinicalVisit {
  id: string;
  customerId: string;
  treatmentPackage: string;
  treatmentStep: string;
  doctorName: string;
  date: string;
  cost: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  clinicalNotes: string;
}

export interface DentalCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  treatmentPackage: string;
  currentStep: string;
  referredByCustomerId: string | null;
  referredByCustomerName: string | null;
  ownerPartnerId: string;
  ownerPartnerName: string;
  referralCode: string;
  chainDepth: number; // 1 = F1 (CTV hưởng 20%), 2 = F2 (CTV hưởng 2%)
  serviceCredit: number; // Credit tích lũy (200k khám, 500k hoàn tất)
  totalSpent: number;
  status: 'active' | 'completed' | 'consulting';
  createdAt: string;
}

export interface BusinessTenantProfile {
  name: string;
  industry: string;
  branchName: string;
  doctorName: string;
  role: string;
}

export function App({ 
  tenantProfile = {
    name: 'Nha Khoa HH Dental Clinic',
    industry: 'Nha khoa & Y tế',
    branchName: 'Trụ sở Quận 1 (Phòng khám chính)',
    doctorName: 'Bs. Nguyễn Văn An',
    role: 'Chủ doanh nghiệp (Owner)'
  },
  onSwitchPortal
}: { 
  tenantProfile?: BusinessTenantProfile;
  onSwitchPortal?: (portal: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'clinical-visits' | 'customer-tree' | 'partner-tree' | 'settlement' | 'deals' | 'services' | 'team'>('dashboard');
  const [activeBranch, setActiveBranch] = useState<string>('branch-main');

  // Selected patient for modal profile
  const [selectedPatient, setSelectedPatient] = useState<DentalCustomer | null>(null);
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);

  // Initial Patients Data (Chain of Customers - Chuỗi khách hàng)
  const [patients, setPatients] = useState<DentalCustomer[]>([
    {
      id: 'cust-01',
      name: 'Phạm Minh Đức',
      phone: '0912345678',
      email: 'duc.pham@example.com',
      address: '25 Nguyễn Huệ, Quận 1, TP.HCM',
      treatmentPackage: 'Cấy ghép Implant Straumann Thụy Sĩ',
      currentStep: 'Bước 2: Phẫu thuật cấy ghép trụ Implant',
      referredByCustomerId: null,
      referredByCustomerName: null,
      ownerPartnerId: 'p-01',
      ownerPartnerName: 'Bs. Nguyễn Văn A (P1 - Founder)',
      referralCode: 'REF-A-FOUNDER',
      chainDepth: 1, // Tầng 1: CTV hưởng 20%
      serviceCredit: 700000,
      totalSpent: 35000000,
      status: 'active',
      createdAt: '2026-11-05'
    },
    {
      id: 'cust-02',
      name: 'Hoàng Khánh Linh',
      phone: '0977112233',
      email: 'linh.hoang@example.com',
      address: '12 Đặng Dung, Quận 1',
      treatmentPackage: 'Niềng răng máng trong suốt Invisalign',
      currentStep: 'Bước 2: Gắn Attachment & Giao khay đợt 1',
      referredByCustomerId: 'cust-01', // Do Phạm Minh Đức giới thiệu!
      referredByCustomerName: 'Phạm Minh Đức (Khách F1)',
      ownerPartnerId: 'p-01', // Kế thừa tự động CTV ban đầu
      ownerPartnerName: 'Bs. Nguyễn Văn A (P1 - Founder)',
      referralCode: 'REF-A-FOUNDER',
      chainDepth: 2, // Tầng 2: CTV hưởng 2%
      serviceCredit: 200000,
      totalSpent: 42500000,
      status: 'active',
      createdAt: '2026-11-12'
    },
    {
      id: 'cust-03',
      name: 'Vũ Lan Anh',
      phone: '0988765432',
      email: 'lananh.vu@example.com',
      address: '15 Thảo Điền, TP. Thủ Đức',
      treatmentPackage: 'Răng toàn sứ thẩm mỹ Cercon HT Đức',
      currentStep: 'Bước 3: Thử sườn sứ & Gắn mão hoàn thiện',
      referredByCustomerId: null,
      referredByCustomerName: null,
      ownerPartnerId: 'p-02',
      ownerPartnerName: 'Trần Thị B (P2 - Level 4)',
      referralCode: 'REF-B-LEVEL4',
      chainDepth: 1, // Tầng 1: 20%
      serviceCredit: 500000,
      totalSpent: 24000000,
      status: 'active',
      createdAt: '2026-11-10'
    },
    {
      id: 'cust-04',
      name: 'Lê Minh Tuấn',
      phone: '0903889900',
      email: 'tuan.le@example.com',
      address: '88 Nam Kỳ Khởi Nghĩa, Quận 3',
      treatmentPackage: 'Cấy ghép Implant Straumann Thụy Sĩ',
      currentStep: 'Bước 5: Gắn mão sứ & Bàn giao bảo hành',
      referredByCustomerId: 'cust-03', // Do Vũ Lan Anh giới thiệu
      referredByCustomerName: 'Vũ Lan Anh (Khách F1)',
      ownerPartnerId: 'p-02',
      ownerPartnerName: 'Trần Thị B (P2 - Level 4)',
      referralCode: 'REF-B-LEVEL4',
      chainDepth: 2, // Tầng 2: 2%
      serviceCredit: 700000,
      totalSpent: 35000000,
      status: 'completed',
      createdAt: '2026-11-02'
    },
    {
      id: 'cust-05',
      name: 'Đặng Ngọc Mai',
      phone: '0938112244',
      email: 'mai.dang@example.com',
      address: '42 Nguyễn Thị Minh Khai, Quận 1',
      treatmentPackage: 'Nhổ răng khôn sóng siêu âm Piezotome',
      currentStep: 'Bước 1: Chụp X-quang & Phẫu thuật Piezotome',
      referredByCustomerId: null,
      referredByCustomerName: null,
      ownerPartnerId: 'p-03',
      ownerPartnerName: 'Lê Hoàng C (P3 - Level 3)',
      referralCode: 'REF-C-LEVEL3',
      chainDepth: 1, // Tầng 1: 20%
      serviceCredit: 200000,
      totalSpent: 3500000,
      status: 'active',
      createdAt: '2026-11-18'
    }
  ]);

  // Initial Clinical Visits Data
  const [visits, setVisits] = useState<ClinicalVisit[]>([
    {
      id: 'vis-101',
      customerId: 'cust-01',
      treatmentPackage: 'Cấy ghép Implant Straumann Thụy Sĩ',
      treatmentStep: 'Bước 1: Khám, chụp CT ConeBeam & Lên phác đồ 3D',
      doctorName: 'Bs. Nguyễn Văn An',
      date: '2026-11-05',
      cost: 3500000,
      paymentStatus: 'paid',
      clinicalNotes: 'Mật độ xương hàm tốt, chỉ định trụ Straumann SLA 4.1mm.'
    },
    {
      id: 'vis-102',
      customerId: 'cust-01',
      treatmentPackage: 'Cấy ghép Implant Straumann Thụy Sĩ',
      treatmentStep: 'Bước 2: Phẫu thuật cấy ghép trụ Implant & Ghép xương',
      doctorName: 'Bs. Nguyễn Văn An',
      date: '2026-11-15',
      cost: 17500000,
      paymentStatus: 'paid',
      clinicalNotes: 'Cấy ghép thành công không sưng đau, kê đơn kháng sinh 5 ngày.'
    },
    {
      id: 'vis-103',
      customerId: 'cust-02',
      treatmentPackage: 'Niềng răng máng trong suốt Invisalign',
      treatmentStep: 'Bước 1: Khám tổng quát & Scan iTero 5D',
      doctorName: 'Bs. Hoàng Lan',
      date: '2026-11-12',
      cost: 12750000,
      paymentStatus: 'paid',
      clinicalNotes: 'Khớp cắn sâu độ 2, thời gian dự kiến 18 tháng (36 khay).'
    },
    {
      id: 'vis-104',
      customerId: 'cust-03',
      treatmentPackage: 'Răng toàn sứ thẩm mỹ Cercon HT Đức',
      treatmentStep: 'Bước 1: Khám, Smile Design DSD & Mài cùi răng',
      doctorName: 'Bs. Nguyễn Văn An',
      date: '2026-11-10',
      cost: 10000000,
      paymentStatus: 'paid',
      clinicalNotes: 'Mài cùi răng bảo tồn 6 răng cửa hàm trên, gắn răng tạm thẩm mỹ.'
    },
    {
      id: 'vis-105',
      customerId: 'cust-04',
      treatmentPackage: 'Cấy ghép Implant Straumann Thụy Sĩ',
      treatmentStep: 'Bước 5: Gắn mão răng toàn sứ hoàn thiện',
      doctorName: 'Bs. Nguyễn Văn An',
      date: '2026-11-16',
      cost: 7000000,
      paymentStatus: 'paid',
      clinicalNotes: 'Tích hợp xương hoàn hảo ISQ 82, khớp cắn chuẩn, bàn giao thẻ bảo hành chính hãng 15 năm.'
    }
  ]);

  // Monthly Settlement Rows (Matching Table in HH Dental CRM README)
  const settlementRows = [
    { partner: 'Bs. Nguyễn Văn A (P1)', code: 'REF-A-FOUNDER', ownRev: '86.000.000 ₫', branchRev: '172.000.000 ₫', ctvComm: '8.380.000 ₫', branchFee: '860.000 ₫', total: '9.240.000 ₫', status: 'Đã chi trả' },
    { partner: 'Trần Thị B (P2)', code: 'REF-B-LEVEL4', ownRev: '66.000.000 ₫', branchRev: '86.000.000 ₫', ctvComm: '8.160.000 ₫', branchFee: '200.000 ₫', total: '8.360.000 ₫', status: 'Đã chi trả' },
    { partner: 'Lê Hoàng C (P3)', code: 'REF-C-LEVEL3', ownRev: '20.000.000 ₫', branchRev: '20.000.000 ₫', ctvComm: '4.000.000 ₫', branchFee: '0 ₫', total: '4.000.000 ₫', status: 'Đã chi trả' },
  ];

  const handleAddVisit = (newVisit: Omit<ClinicalVisit, 'id'>) => {
    const id = `vis-${Date.now()}`;
    const created: ClinicalVisit = { id, ...newVisit };
    setVisits([created, ...visits]);

    // Update patient total spent & step
    setPatients(patients.map(p => {
      if (p.id === newVisit.customerId) {
        return {
          ...p,
          currentStep: newVisit.treatmentStep,
          totalSpent: p.totalSpent + newVisit.cost
        };
      }
      return p;
    }));

    setShowAddVisitModal(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Logo & Platform Info */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                P
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight text-white">{tenantProfile.name}</h1>
                <span className="text-[11px] text-indigo-400 font-medium">Dental & Business CRM</span>
              </div>
            </div>
          </div>

          {/* Tenant & Branch Context */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {tenantProfile.industry}
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                Plan V5
              </span>
            </div>
            <div className="mt-2">
              <select 
                value={activeBranch} 
                onChange={(e) => setActiveBranch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="branch-main">{tenantProfile.branchName}</option>
                <option value="branch-q7">Chi nhánh Quận 7 (Phòng khám kỹ thuật cao)</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] text-sm">
            <NavItem 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Dashboard Tổng quan" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              icon={<Users className="w-4 h-4" />} 
              label="Hồ sơ Bệnh nhân (Visits)" 
              badge={`${patients.length}`}
              active={activeTab === 'patients'} 
              onClick={() => setActiveTab('patients')} 
            />
            <NavItem 
              icon={<Stethoscope className="w-4 h-4" />} 
              label="Khám Lâm sàng theo Bước" 
              badge={`${visits.length}`}
              active={activeTab === 'clinical-visits'} 
              onClick={() => setActiveTab('clinical-visits')} 
            />
            <NavItem 
              icon={<Network className="w-4 h-4" />} 
              label="Cây Chuỗi Khách (20% - 2%)" 
              active={activeTab === 'customer-tree'} 
              onClick={() => setActiveTab('customer-tree')} 
            />
            <NavItem 
              icon={<Share2 className="w-4 h-4" />} 
              label="Cây Đối Tác (Phí nhánh 1%)" 
              active={activeTab === 'partner-tree'} 
              onClick={() => setActiveTab('partner-tree')} 
            />
            <NavItem 
              icon={<Coins className="w-4 h-4" />} 
              label="Đối soát & Bảng lương CTV" 
              active={activeTab === 'settlement'} 
              onClick={() => setActiveTab('settlement')} 
            />
            <NavItem 
              icon={<Kanban className="w-4 h-4" />} 
              label="Pipeline Điều trị (Deals)" 
              active={activeTab === 'deals'} 
              onClick={() => setActiveTab('deals')} 
            />
            <NavItem 
              icon={<Package className="w-4 h-4" />} 
              label="Gói Dịch vụ & Lâm sàng" 
              active={activeTab === 'services'} 
              onClick={() => setActiveTab('services')} 
            />
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Đội ngũ & Bác sĩ" 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
            />
          </nav>
        </div>

        {/* Footer info & Portal Switcher */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              HH Dental Engine
            </span>
            <span className="font-mono text-[10px] text-slate-500">v5.0-ready</span>
          </div>
          {onSwitchPortal && (
            <button
              onClick={() => onSwitchPortal('landing')}
              className="w-full py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center font-medium transition-colors"
            >
              ← Quay lại Trang chủ
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{tenantProfile.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-800 capitalize">
              {activeTab === 'dashboard' && 'Dashboard Quản trị'}
              {activeTab === 'patients' && 'Danh bạ Bệnh nhân & Chuỗi Khách hàng'}
              {activeTab === 'clinical-visits' && 'Nhật ký Khám Lâm sàng theo Bước'}
              {activeTab === 'customer-tree' && 'Cây Phả hệ Chuỗi Khách hàng (Plan V5: 20% - 2%)'}
              {activeTab === 'partner-tree' && 'Cây Đối tác Đa tầng & Phí Quản lý Nhánh 1%'}
              {activeTab === 'settlement' && 'Kỳ Đối soát & Bảng lương Hoa hồng Hàng tháng'}
              {activeTab === 'deals' && 'Pipeline Tiến trình Điều trị Khách hàng'}
              {activeTab === 'services' && 'Danh mục Gói Dịch vụ & Phác đồ Bước Lâm sàng'}
              {activeTab === 'team' && 'Đội ngũ Y Bác sĩ & Phân quyền Chi nhánh'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                BS
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">{tenantProfile.doctorName}</p>
                <span className="text-[10px] text-indigo-600 font-medium">{tenantProfile.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body Views */}
        <div className="p-6 md:p-8 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tổng quan Doanh số Lâm sàng & Mạng lưới Đối tác</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Phản ánh trung thực hai hệ thống: Chuỗi khách hàng (20% - 2%) và Cây đối tác (1% nhánh)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddVisitModal(true)}>+ Thêm lượt khám</Button>
                  <Button onClick={() => setActiveTab('patients')}>+ Tiếp nhận bệnh nhân</Button>
                </div>
              </div>

              {/* Metric Cards matching HH Dental Golden Benchmark */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Tổng Doanh thu Hệ thống"
                  value="172.000.000 ₫"
                  change="Kỳ đối soát tháng 11/2026"
                  isPositive={true}
                  icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
                />
                <StatCard
                  title="Tổng Hoa hồng CTV (20% - 2%)"
                  value="20.540.000 ₫"
                  change="Hoàn 100% về CTV ban đầu"
                  isPositive={true}
                  icon={<Coins className="w-5 h-5 text-emerald-600" />}
                />
                <StatCard
                  title="Tổng Phí Nhánh 1%"
                  value="1.060.000 ₫"
                  change="Cấp quản lý nhánh đối tác"
                  isPositive={true}
                  icon={<Network className="w-5 h-5 text-sky-600" />}
                />
                <StatCard
                  title="Lợi nhuận Giữ lại Phòng khám"
                  value="150.400.000 ₫"
                  change="87,4% tổng doanh thu"
                  isPositive={true}
                  icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
                />
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex justify-between items-center pb-2">
                    <CardTitle>Top Dịch vụ Lâm sàng Doanh thu cao nhất</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('services')}>Xem chi tiết</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 text-sm">
                      {[
                        { name: 'Cấy ghép Implant Straumann Thụy Sĩ', count: '4 ca lâm sàng', revenue: '140.000.000 ₫', comm: '20% F1, 2% F2' },
                        { name: 'Niềng răng máng trong suốt Invisalign', count: '1 ca hoàn tất', revenue: '85.000.000 ₫', comm: '20% F1, 2% F2' },
                        { name: 'Răng toàn sứ thẩm mỹ Cercon HT Đức', count: '4 răng sứ', revenue: '24.000.000 ₫', comm: '20% F1, 2% F2' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <span className="text-xs text-slate-500">{item.count} • Chính sách: {item.comm}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{item.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chính sách Hai Hệ thống Độc lập</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-slate-600">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <p className="font-bold text-emerald-900">1. Chuỗi Khách Hàng (Sàn 0%)</p>
                      <p>• Tầng 1: CTV hưởng 20%</p>
                      <p>• Tầng 2+: CTV hưởng 2%</p>
                      <p>• Toàn bộ hoa hồng hoàn về CTV ban đầu</p>
                    </div>
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 space-y-1">
                      <p className="font-bold text-sky-900">2. Cây Đối Tác (1% Nhánh)</p>
                      <p>• Phí nhánh 1% trên toàn bộ cây con trực tiếp</p>
                      <p>• Không giới hạn số tầng phả hệ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENTS LIST (DANH BẠ BỆNH NHÂN) */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Danh bạ Bệnh nhân & Chuỗi Khách hàng</h2>
                  <p className="text-sm text-slate-500">Mỗi bệnh nhân gắn với người giới thiệu, CTV sở hữu nguồn và số dư Credit dịch vụ</p>
                </div>
                <Button onClick={() => setShowAddVisitModal(true)}>+ Ghi nhận Lượt khám mới</Button>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Bệnh nhân</th>
                        <th className="p-4">Gói & Bước điều trị hiện tại</th>
                        <th className="p-4">Nguồn Giới thiệu</th>
                        <th className="p-4">CTV Sở hữu</th>
                        <th className="p-4">Credit Khách</th>
                        <th className="p-4">Tổng thanh toán</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patients.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <span className="text-xs font-mono text-slate-400">{p.phone}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-900 block text-xs">{p.treatmentPackage}</span>
                            <span className="text-[11px] text-indigo-600 font-medium">{p.currentStep}</span>
                          </td>
                          <td className="p-4">
                            {p.referredByCustomerName ? (
                              <div>
                                <span className="text-xs font-medium text-slate-800">Từ: {p.referredByCustomerName}</span>
                                <span className="block text-[11px] text-emerald-600 font-bold">Tầng 2 (CTV hưởng 2%)</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs text-slate-500">Khách trực tiếp F1</span>
                                <span className="block text-[11px] text-indigo-600 font-bold">Tầng 1 (CTV hưởng 20%)</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-semibold text-slate-900">{p.ownerPartnerName}</p>
                            <span className="text-[11px] font-mono text-slate-500">{p.referralCode}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              +{p.serviceCredit.toLocaleString('vi-VN')} ₫
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900">
                            {p.totalSpent.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedPatient(p)}
                              className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            >
                              Hồ sơ Lâm sàng
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: CLINICAL VISITS (KHÁM LÂM SÀNG THEO BƯỚC) */}
          {activeTab === 'clinical-visits' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Nhật ký Thăm khám & Thực hiện Thủ thuật Lâm sàng</h2>
                  <p className="text-sm text-slate-500">Theo dõi chi tiết từng bước điều trị, bác sĩ phụ trách và tình trạng thanh toán</p>
                </div>
                <Button onClick={() => setShowAddVisitModal(true)}>+ Thêm Lượt khám mới</Button>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Mã Visit</th>
                        <th className="p-4">Bệnh nhân</th>
                        <th className="p-4">Gói Dịch vụ & Bước Lâm sàng</th>
                        <th className="p-4">Bác sĩ phụ trách</th>
                        <th className="p-4">Ngày khám</th>
                        <th className="p-4">Chi phí</th>
                        <th className="p-4">Thanh toán</th>
                        <th className="p-4">Ghi chú lâm sàng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visits.map((v) => {
                        const pat = patients.find(p => p.id === v.customerId);
                        return (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="p-4 font-mono text-xs text-slate-500">{v.id}</td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-900">{pat?.name || 'Khách vãng lai'}</p>
                              <span className="text-xs font-mono text-slate-400">{pat?.phone}</span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-medium text-slate-900">{v.treatmentPackage}</p>
                              <span className="text-[11px] text-indigo-600 font-semibold">{v.treatmentStep}</span>
                            </td>
                            <td className="p-4 text-xs font-medium text-slate-800">{v.doctorName}</td>
                            <td className="p-4 text-xs text-slate-500">{v.date}</td>
                            <td className="p-4 font-mono font-bold text-slate-900">{v.cost.toLocaleString('vi-VN')} ₫</td>
                            <td className="p-4">
                              <Badge variant={v.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                {v.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Một phần'}
                              </Badge>
                            </td>
                            <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{v.clinicalNotes}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: CUSTOMER TREE (CÂY CHUỖI KHÁCH HÀNG 20% - 2%) */}
          {activeTab === 'customer-tree' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <h3 className="font-bold text-emerald-950 text-sm">Hệ Thống 1 — Chuỗi Khách Hàng (Sàn không thu 0% — Hoàn toàn bộ về CTV Ban Đầu)</h3>
                <p className="text-xs text-emerald-800">
                  • <strong>Tầng 1 (Khách trực tiếp):</strong> CTV ban đầu hưởng <strong>20%</strong>.<br />
                  • <strong>Tầng 2+ (Khách từ F1 giới thiệu):</strong> CTV ban đầu hưởng <strong>2%</strong> trọn đời. Khách hàng nhận thưởng credit dịch vụ (+200.000 ₫ khi đến khám, +500.000 ₫ khi hoàn tất).
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cây Phả Hệ Khách Hàng Giới Thiệu (Customer Chain Visualizer)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Root Customer 1 */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          F1
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Phạm Minh Đức (Tầng 1)</p>
                          <p className="text-xs text-slate-500">CTV Ban đầu: Bs. Nguyễn Văn A (P1) • Doanh thu: 35.000.000 ₫</p>
                        </div>
                      </div>
                      <Badge variant="success">CTV hưởng 20% = 7.000.000 ₫</Badge>
                    </div>

                    {/* Sub customer F2 */}
                    <div className="ml-8 pl-4 border-l-2 border-indigo-300 space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                            F2
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">Hoàng Khánh Linh (Được Đức giới thiệu)</p>
                            <p className="text-[11px] text-slate-500">Gói: Niềng răng Invisalign • Doanh thu: 42.500.000 ₫</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 block">CTV hưởng 2% = 850.000 ₫</span>
                          <span className="text-[10px] text-slate-400">Đức nhận +500.000 ₫ Credit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Root Customer 2 */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          F1
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Vũ Lan Anh (Tầng 1)</p>
                          <p className="text-xs text-slate-500">CTV Ban đầu: Trần Thị B (P2) • Doanh thu: 24.000.000 ₫</p>
                        </div>
                      </div>
                      <Badge variant="success">CTV hưởng 20% = 4.800.000 ₫</Badge>
                    </div>

                    {/* Sub customer F2 */}
                    <div className="ml-8 pl-4 border-l-2 border-indigo-300 space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                            F2
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">Lê Minh Tuấn (Được Lan Anh giới thiệu)</p>
                            <p className="text-[11px] text-slate-500">Gói: Implant Straumann • Doanh thu: 35.000.000 ₫</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 block">CTV hưởng 2% = 700.000 ₫</span>
                          <span className="text-[10px] text-slate-400">Lan Anh nhận +700.000 ₫ Credit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: PARTNER TREE (CÂY ĐỐI TÁC ĐA TẦNG - PHÍ NHÁNH 1%) */}
          {activeTab === 'partner-tree' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                <h3 className="font-bold text-sky-950 text-sm">Hệ Thống 2 — Cây Đối Tác (Phí Nhánh 1% Cây Con Trực Tiếp - Plan V5)</h3>
                <p className="text-xs text-sky-800">
                  • Cây phả hệ CTV không giới hạn số tầng. Quản lý cấp trên hưởng <strong>1% phí nhánh</strong> tính trên toàn bộ doanh thu cây con trực tiếp.<br />
                  • <strong>Tổng thực nhận</strong> = Hoa hồng CTV trực tiếp (từ chuỗi khách) + Phí quản lý nhánh 1%.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cây Phả Hệ Đối Tác & Doanh Thu Nhánh (172.000.000 ₫ Toàn Sàn)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Partner Node 1: Founder */}
                  <div className="border-2 border-indigo-500 bg-indigo-50/20 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">Bs. Nguyễn Văn A (P1)</span>
                          <Badge variant="default">Founder (Gốc - Depth 0)</Badge>
                          <span className="font-mono text-xs text-indigo-600 font-bold">REF-A-FOUNDER</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sổ khách: <strong>86.000.000 ₫</strong> • Doanh thu toàn nhánh: <strong>172.000.000 ₫</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-indigo-700 block">9.240.000 ₫</span>
                        <span className="text-[11px] text-slate-500">Hoa hồng: 8.380k + Phí nhánh: 860k (1%)</span>
                      </div>
                    </div>

                    {/* Level 2 Sub-Partner */}
                    <div className="ml-6 pl-4 border-l-2 border-slate-300 space-y-3">
                      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Trần Thị B (P2)</span>
                            <Badge variant="info">Level 4 (Depth 1)</Badge>
                            <span className="font-mono text-xs text-sky-600 font-bold">REF-B-LEVEL4</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Sổ khách: <strong>66.000.000 ₫</strong> • Doanh thu nhánh: <strong>86.000.000 ₫</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-indigo-600 block">8.360.000 ₫</span>
                          <span className="text-[11px] text-slate-500">Hoa hồng: 8.160k + Phí nhánh: 200k (1%)</span>
                        </div>
                      </div>

                      {/* Level 3 Sub-Partner */}
                      <div className="ml-6 pl-4 border-l-2 border-slate-300">
                        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">Lê Hoàng C (P3)</span>
                              <Badge variant="neutral">Level 3 (Depth 2)</Badge>
                              <span className="font-mono text-xs text-slate-600 font-bold">REF-C-LEVEL3</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Sổ khách: <strong>20.000.000 ₫</strong> • Doanh thu nhánh: <strong>20.000.000 ₫</strong>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-indigo-600 block">4.000.000 ₫</span>
                            <span className="text-[11px] text-slate-500">Hoa hồng: 4.000k + Phí nhánh: 0 ₫</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: SETTLEMENT SHEET (BẢNG LƯƠNG ĐỐI SOÁT KỲ THÁNG) */}
          {activeTab === 'settlement' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kỳ Đối Soát Hoa Hồng Tháng 11/2026 (Plan V5 Benchmark)</h2>
                  <p className="text-sm text-slate-500">Đối chiếu 3 nguồn độc lập: Client Engine, Postgres RPC compute_month, và Golden Benchmark</p>
                </div>
                <Button>Xuất Báo Cáo Kế Toán</Button>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Đối tác CTV</th>
                        <th className="p-4">Mã REF</th>
                        <th className="p-4 text-right">Sổ khách cá nhân</th>
                        <th className="p-4 text-right">Doanh thu nhánh</th>
                        <th className="p-4 text-right">Hoa hồng CTV</th>
                        <th className="p-4 text-right">Phí nhánh 1%</th>
                        <th className="p-4 text-right">Tổng thực nhận</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {settlementRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-4 font-sans font-bold text-slate-900 text-sm">{r.partner}</td>
                          <td className="p-4 font-bold text-indigo-600">{r.code}</td>
                          <td className="p-4 text-right">{r.ownRev}</td>
                          <td className="p-4 text-right text-slate-800 font-semibold">{r.branchRev}</td>
                          <td className="p-4 text-right text-emerald-600 font-bold">{r.ctvComm}</td>
                          <td className="p-4 text-right text-sky-600 font-bold">{r.branchFee}</td>
                          <td className="p-4 text-right text-indigo-700 font-extrabold text-sm">{r.total}</td>
                          <td className="p-4 text-center">
                            <Badge variant="success">{r.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-mono font-bold text-xs border-t-2 border-slate-300">
                      <tr>
                        <td className="p-4 font-sans text-slate-900" colSpan={2}>TỔNG CỘNG HỆ THỐNG:</td>
                        <td className="p-4 text-right">172.000.000 ₫</td>
                        <td className="p-4 text-right">172.000.000 ₫</td>
                        <td className="p-4 text-right text-emerald-700">20.540.000 ₫</td>
                        <td className="p-4 text-right text-sky-700">1.060.000 ₫</td>
                        <td className="p-4 text-right text-indigo-800 text-sm">21.600.000 ₫</td>
                        <td className="p-4 text-center font-sans text-[11px] text-emerald-700">Chi phí: 12,6%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: SERVICES & CLINICAL PRESETS */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Danh mục Gói Dịch vụ & Phác đồ Bước Lâm sàng</h2>
                  <p className="text-sm text-slate-500">Quy chuẩn phác đồ điều trị, tỷ trọng giá trị theo bước và cơ chế thanh toán</p>
                </div>
                <Button>+ Thêm Gói dịch vụ mới</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CLINICAL_PRESETS).map(([key, item]) => (
                  <Card key={key} className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="info">{item.category}</Badge>
                        <h3 className="font-bold text-base text-slate-900 mt-1">{item.name}</h3>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 text-base">
                        {item.price.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block">Lộ trình các bước lâm sàng:</span>
                      {item.steps.map(s => (
                        <div key={s.step} className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-100">
                          <span className="text-slate-800 font-medium">
                            Bước {s.step}: {s.name}
                          </span>
                          <span className="font-mono font-semibold text-slate-600">
                            {(s.share * 100)}% ({s.price.toLocaleString('vi-VN')} ₫)
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: DEALS KANBAN */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pipeline Tiến trình Điều trị Khách hàng</h2>
                  <p className="text-sm text-slate-500">Chuyển sang "Hoàn tất điều trị (Won)" kích hoạt tự động tính hoa hồng CTV</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: 'Tư vấn & Chụp CT', count: 4, items: ['Nguyễn Văn Huy (Implant)'] },
                  { title: 'Lên phác đồ & Đặt cọc', count: 3, items: ['Lê Thị Mai (Invisalign)'] },
                  { title: 'Đang điều trị thủ thuật', count: 5, items: ['Phạm Minh Đức (Implant - Bước 2)', 'Vũ Lan Anh (Sứ Cercon - Bước 3)'] },
                  { title: 'Hoàn tất & Bàn giao (Won)', count: 8, items: ['Lê Minh Tuấn (Implant - 35Tr)', 'Đỗ Quốc Hùng (Khám tổng quát)'] },
                ].map((col, idx) => (
                  <div key={idx} className="bg-slate-100 rounded-xl p-3 flex flex-col gap-3 min-h-[400px]">
                    <div className="flex justify-between items-center pb-2 border-b-2 border-indigo-400">
                      <h4 className="font-bold text-xs text-slate-800">{col.title}</h4>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold text-slate-600">{col.count}</span>
                    </div>
                    {col.items.map((it, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xs space-y-1">
                        <p className="font-semibold text-slate-900">{it}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">Bác sĩ: Bs. An</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: TEAM & DOCTORS */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Đội ngũ Y Bác sĩ & Nhân sự Chi nhánh</h2>
                  <p className="text-sm text-slate-500">Phân quyền theo chuẩn RBAC: Bác sĩ trưởng, Bác sĩ điều trị, Lễ tân, Tư vấn</p>
                </div>
                <Button>+ Thêm Bác sĩ / Nhân sự</Button>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Họ và tên</th>
                        <th className="p-4">Chuyên môn / Vai trò</th>
                        <th className="p-4">Chi nhánh</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{tenantProfile.doctorName}</td>
                        <td className="p-4"><Badge variant="default">Chủ phòng khám (Owner) - Bác sĩ Implant</Badge></td>
                        <td className="p-4 text-xs">Toàn bộ chi nhánh</td>
                        <td className="p-4 text-xs font-mono">admin@smilecare.vn</td>
                        <td className="p-4"><Badge variant="success">Hoạt động</Badge></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">Bs. Hoàng Lan</td>
                        <td className="p-4"><Badge variant="info">Bác sĩ Chuyên khoa Chỉnh nha Invisalign</Badge></td>
                        <td className="p-4 text-xs">Trụ sở Quận 1</td>
                        <td className="p-4 text-xs font-mono">lan.hoang@smilecare.vn</td>
                        <td className="p-4"><Badge variant="success">Hoạt động</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: CLINICAL PATIENT PROFILE */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-slate-900">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedPatient.phone} • {selectedPatient.address}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Treatment info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Gói dịch vụ điều trị:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.treatmentPackage}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Giai đoạn hiện tại:</span>
                <span className="font-bold text-indigo-600 text-sm">{selectedPatient.currentStep}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CTV Sở hữu nguồn:</span>
                <span className="font-semibold text-slate-800">{selectedPatient.ownerPartnerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Credit Dịch vụ tích lũy:</span>
                <span className="font-bold text-emerald-600 font-mono">+{selectedPatient.serviceCredit.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* History of Visits */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-900">Lịch sử Các lần khám lâm sàng (Visits)</h4>
                <Button size="sm" onClick={() => { setShowAddVisitModal(true); }}>+ Thêm lần khám</Button>
              </div>

              <div className="space-y-2">
                {visits.filter(v => v.customerId === selectedPatient.id).map(v => (
                  <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{v.treatmentStep}</span>
                      <span className="font-mono font-bold text-indigo-600">{v.cost.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <p className="text-slate-500">Bác sĩ: {v.doctorName} • Ngày: {v.date}</p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded">{v.clinicalNotes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setSelectedPatient(null)}>Đóng hồ sơ</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CLINICAL VISIT */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Ghi nhận Lượt khám Lâm sàng mới</h3>
              <button onClick={() => setShowAddVisitModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const customerId = (form.elements.namedItem('patientId') as HTMLSelectElement).value;
              const treatmentPackage = (form.elements.namedItem('pkg') as HTMLSelectElement).value;
              const treatmentStep = (form.elements.namedItem('step') as HTMLInputElement).value;
              const cost = Number((form.elements.namedItem('cost') as HTMLInputElement).value);
              const doctorName = (form.elements.namedItem('doc') as HTMLInputElement).value;
              const clinicalNotes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;

              handleAddVisit({
                customerId,
                treatmentPackage,
                treatmentStep,
                doctorName,
                cost,
                paymentStatus: 'paid',
                date: new Date().toISOString().substring(0, 10),
                clinicalNotes
              });
            }} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn Bệnh nhân *</label>
                <select name="patientId" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gói dịch vụ điều trị *</label>
                <select name="pkg" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="Cấy ghép Implant Straumann Thụy Sĩ">Cấy ghép Implant Straumann Thụy Sĩ</option>
                  <option value="Niềng răng máng trong suốt Invisalign">Niềng răng máng trong suốt Invisalign</option>
                  <option value="Răng toàn sứ thẩm mỹ Cercon HT Đức">Răng toàn sứ thẩm mỹ Cercon HT Đức</option>
                  <option value="Nhổ răng khôn sóng siêu âm Piezotome">Nhổ răng khôn sóng siêu âm Piezotome</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung / Bước thực hiện lâm sàng *</label>
                <input name="step" defaultValue="Khám lâm sàng & Điều trị chuyên sâu" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chi phí lượt khám (₫) *</label>
                  <input name="cost" type="number" defaultValue="3500000" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bác sĩ thực hiện *</label>
                  <input name="doc" defaultValue="Bs. Nguyễn Văn An" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú lâm sàng / Đơn thuốc</label>
                <textarea name="notes" rows={2} defaultValue="Bệnh nhân hợp tác tốt, vết thương liền nhanh." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddVisitModal(false)}>Hủy</Button>
                <Button type="submit">Lưu lần khám</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  badge,
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  badge?: string;
  active: boolean; 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-300'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
