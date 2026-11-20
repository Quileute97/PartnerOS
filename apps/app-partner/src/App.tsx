import React, { useState } from 'react';
import { 
  Wallet, 
  Compass, 
  Link as LinkIcon, 
  Users, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Building,
  DollarSign,
  Search,
  Filter,
  PlusCircle,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard } from '@partner-os/ui';

interface CampaignItem {
  id: string;
  tenantName: string;
  industry: string;
  title: string;
  commissionType: 'percentage' | 'fixed_amount';
  commissionRate: number;
  cookieWindowDays: number;
  minDealValue: number;
  policyVersion: number;
  terms: string;
  isJoined?: boolean;
}

interface ReferralLinkItem {
  id: string;
  campaignTitle: string;
  code: string;
  destinationUrl: string;
  fullReferralUrl: string;
  qrCodeUrl: string;
  clicksCount: number;
  leadsCount: number;
  conversionsCount: number;
}

interface AttributedLeadItem {
  id: string;
  customerName: string;
  phone: string;
  enterprise: string;
  service: string;
  dealValue: string;
  commission: string;
  status: string;
  attributionModel: string;
  clickTime: string;
  daysRemainingInCookie: number;
  policyVersion: number;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'marketplace' | 'my-links' | 'leads'>('marketplace');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Marketplace filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Modal / Join State
  const [joiningCampaign, setJoiningCampaign] = useState<CampaignItem | null>(null);
  const [agreedPolicy, setAgreedPolicy] = useState(true);
  const [applicationNote, setApplicationNote] = useState('');
  const [joinedSuccessMessage, setJoinedSuccessMessage] = useState<string | null>(null);

  // Link Generator State
  const [customSlug, setCustomSlug] = useState('');
  const [selectedCampaignForLink, setSelectedCampaignForLink] = useState('camp-1');

  // Wallet & Payout State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('16500000');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('0071001234567');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN VAN TUAN');
  const [walletBalances, setWalletBalances] = useState({
    available: 16500000,
    pending: 3500000,
    settling: 0,
    lifetime: 128400000
  });

  const [ledgerHistory, setLedgerHistory] = useState([
    { title: 'Trồng răng Implant - Khách: Phạm Minh Đức', enterprise: 'Nha Khoa SmileCare', amount: '+3,500,000 ₫', status: 'Chờ duyệt', date: '20/11/2026' },
    { title: 'Bọc răng sứ HT - Khách: Vũ Lan Anh', enterprise: 'Nha Khoa SmileCare', amount: '+2,400,000 ₫', status: 'Đã duyệt', date: '18/11/2026' },
    { title: 'Căn hộ Grand View - Khách: Lê Minh Tuấn', enterprise: 'BĐS SkyLand', amount: '+50,000,000 ₫', status: 'Đã chi trả', date: '15/11/2026' },
  ]);

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Vui lòng nhập số tiền rút hợp lệ');
      return;
    }
    if (amountNum > walletBalances.available) {
      alert('Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    setWalletBalances({
      ...walletBalances,
      available: walletBalances.available - amountNum,
      settling: walletBalances.settling + amountNum
    });

    const newLedgerItem = {
      title: `Yêu cầu rút tiền về ${bankName} (${bankAccountNumber})`,
      enterprise: 'Hệ thống PartnerOS',
      amount: `-${amountNum.toLocaleString('vi-VN')} ₫`,
      status: 'Đang đối soát',
      date: new Date().toLocaleDateString('vi-VN')
    };

    setLedgerHistory([newLedgerItem, ...ledgerHistory]);
    setIsPayoutModalOpen(false);
    setJoinedSuccessMessage(`Đã gửi yêu cầu rút ${amountNum.toLocaleString('vi-VN')} ₫ về tài khoản ${bankName} thành công!`);
    setTimeout(() => setJoinedSuccessMessage(null), 6000);
  };

  // Initial Campaigns Data
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: 'camp-1',
      tenantName: 'Nha Khoa Thẩm Mỹ SmileCare',
      industry: 'Nha khoa & Y tế',
      title: 'Giới thiệu khách hàng Trồng răng & Niềng răng SmileCare',
      commissionType: 'percentage',
      commissionRate: 10,
      cookieWindowDays: 60,
      minDealValue: 5000000,
      policyVersion: 1,
      terms: 'Hoa hồng 10% trên tổng giá trị hợp đồng điều trị. Thanh toán định kỳ ngày 15 hàng tháng. Cookie bảo vệ nguồn 60 ngày.',
      isJoined: true
    },
    {
      id: 'camp-2',
      tenantName: 'BĐS SkyLand',
      industry: 'Bất động sản',
      title: 'Môi giới BĐS Căn hộ cao cấp Vinhomes Grand View',
      commissionType: 'fixed_amount',
      commissionRate: 50000000,
      cookieWindowDays: 90,
      minDealValue: 1000000000,
      policyVersion: 1,
      terms: 'Hoa hồng 50,000,000 VNĐ / căn hộ hoàn tất giao dịch đặt cọc hợp lệ. Đối soát sau khi hợp đồng công chứng.',
      isJoined: false
    },
    {
      id: 'camp-3',
      tenantName: 'Học viện Oxford Star',
      industry: 'Giáo dục & Đào tạo',
      title: 'Giới thiệu học viên Luyện thi IELTS 7.5+ & Du học',
      commissionType: 'percentage',
      commissionRate: 15,
      cookieWindowDays: 45,
      minDealValue: 12000000,
      policyVersion: 2,
      terms: 'Hoa hồng 15% gói combo học phí trọn khoá khi học viên ghi danh thành công. Đối soát ngày 20 hàng tháng.',
      isJoined: false
    },
    {
      id: 'camp-4',
      tenantName: 'Aura Beauty Clinic & Spa',
      industry: 'Thẩm mỹ & Làm đẹp',
      title: 'Giới thiệu khách hàng Gói Trẻ hoá Da & Nâng cơ Hifu',
      commissionType: 'percentage',
      commissionRate: 12,
      cookieWindowDays: 30,
      minDealValue: 3000000,
      policyVersion: 1,
      terms: 'Hoa hồng 12% trên mọi hoá đơn điều trị thẩm mỹ công nghệ cao từ 3 triệu trở lên.',
      isJoined: false
    }
  ]);

  // Links Data
  const [links, setLinks] = useState<ReferralLinkItem[]>([
    {
      id: 'link-1',
      campaignTitle: 'Giới thiệu Trồng răng & Niềng răng SmileCare',
      code: 'REF_TUAN_VIP',
      destinationUrl: 'https://smilecare.partneros.vn/booking',
      fullReferralUrl: 'https://smilecare.partneros.vn/booking?ref=REF_TUAN_VIP',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Fsmilecare.partneros.vn%2Fbooking%3Fref%3DREF_TUAN_VIP',
      clicksCount: 348,
      leadsCount: 48,
      conversionsCount: 12
    }
  ]);

  // Leads & Attributions Data
  const [leads] = useState<AttributedLeadItem[]>([
    {
      id: 'lead-1',
      customerName: 'Phạm Minh Đức',
      phone: '0912***678',
      enterprise: 'Nha Khoa SmileCare',
      service: 'Cấy ghép Implant Straumann',
      dealValue: '35,000,000 ₫',
      commission: '+3,500,000 ₫',
      status: 'Đã chốt hợp đồng',
      attributionModel: 'Last-Click (Khớp phiên)',
      clickTime: '15/11/2026 09:20',
      daysRemainingInCookie: 55,
      policyVersion: 1
    },
    {
      id: 'lead-2',
      customerName: 'Hoàng Khánh Linh',
      phone: '0977***112',
      enterprise: 'Nha Khoa SmileCare',
      service: 'Niềng răng máng trong suốt',
      dealValue: '55,000,000 ₫',
      commission: 'Dự kiến 5,500,000 ₫',
      status: 'Đang tư vấn (Lead)',
      attributionModel: 'Last-Click (Mã giới thiệu)',
      clickTime: '18/11/2026 14:15',
      daysRemainingInCookie: 58,
      policyVersion: 1
    },
    {
      id: 'lead-3',
      customerName: 'Trần Bảo Ngọc',
      phone: '0903***889',
      enterprise: 'Học viện Oxford Star',
      service: 'Khoá IELTS Master 7.5+',
      dealValue: '18,000,000 ₫',
      commission: '+2,700,000 ₫',
      status: 'Đã thanh toán',
      attributionModel: 'Last-Click (Session Cookie)',
      clickTime: '19/11/2026 11:00',
      daysRemainingInCookie: 43,
      policyVersion: 2
    }
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleJoinCampaign = (campaign: CampaignItem) => {
    setJoiningCampaign(campaign);
    setAgreedPolicy(true);
    setApplicationNote('');
  };

  const confirmJoinCampaign = () => {
    if (!joiningCampaign) return;

    // Generate new link
    const newCode = `REF_TUAN_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const destinationUrl = `https://${joiningCampaign.id}.partneros.vn/offer`;
    const fullReferralUrl = `${destinationUrl}?ref=${newCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(fullReferralUrl)}`;

    const newLink: ReferralLinkItem = {
      id: `link-${Date.now()}`,
      campaignTitle: joiningCampaign.title,
      code: newCode,
      destinationUrl,
      fullReferralUrl,
      qrCodeUrl,
      clicksCount: 0,
      leadsCount: 0,
      conversionsCount: 0
    };

    setLinks([newLink, ...links]);

    // Update campaign isJoined
    setCampaigns(campaigns.map(c => c.id === joiningCampaign.id ? { ...c, isJoined: true } : c));

    setJoinedSuccessMessage(`Chúc mừng bạn đã gia nhập "${joiningCampaign.title}"! Mã giới thiệu của bạn là ${newCode}`);
    setJoiningCampaign(null);
    setTimeout(() => setJoinedSuccessMessage(null), 6000);
  };

  const handleCreateCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find(c => c.id === selectedCampaignForLink) || campaigns[0];
    const slug = customSlug.trim() ? customSlug.trim().toUpperCase() : Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `REF_${slug}`;
    const destinationUrl = `https://${campaign.id}.partneros.vn/offer`;
    const fullReferralUrl = `${destinationUrl}?ref=${code}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(fullReferralUrl)}`;

    const newLink: ReferralLinkItem = {
      id: `link-${Date.now()}`,
      campaignTitle: campaign.title,
      code,
      destinationUrl,
      fullReferralUrl,
      qrCodeUrl,
      clicksCount: 0,
      leadsCount: 0,
      conversionsCount: 0
    };

    setLinks([newLink, ...links]);
    setCustomSlug('');
    setJoinedSuccessMessage(`Đã tạo link giới thiệu mới: ${code}`);
    setTimeout(() => setJoinedSuccessMessage(null), 4000);
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-5xl mx-auto shadow-sm">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base leading-tight">PartnerOS</h1>
              <Badge variant="success">Partner Portal v1.0</Badge>
            </div>
            <p className="text-xs text-slate-500">Mạng lưới Đối tác & Tiếp thị Liên kết Toàn diện</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900">Nguyễn Văn Tuấn</p>
            <p className="text-[11px] text-emerald-600 font-medium">Đối tác VIP (Global Identity)</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300">
            NT
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {joinedSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{joinedSuccessMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 flex gap-1 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'marketplace' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Affiliate Marketplace
          <Badge variant="neutral" className="ml-1 text-[10px]">{campaigns.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('my-links')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'my-links' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Link & Mã QR của tôi
          <Badge variant="neutral" className="ml-1 text-[10px]">{links.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'leads' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Khách hàng & Quy kết (Attribution)
          <Badge variant="neutral" className="ml-1 text-[10px]">{leads.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'wallet' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Ví & Thu nhập Ledger
        </button>
      </nav>

      {/* Main Body */}
      <main className="p-4 sm:p-6 space-y-6 flex-1">
        {/* TAB 1: MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Affiliate Marketplace</h2>
                <p className="text-sm text-slate-500">Khám phá và tham gia các chiến dịch đối tác từ nhiều ngành nghề khác nhau</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm chiến dịch, doanh nghiệp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Industry Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Ngành nghề:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Nha khoa & Y tế', label: 'Nha khoa & Y tế' },
                { id: 'Bất động sản', label: 'Bất động sản' },
                { id: 'Giáo dục & Đào tạo', label: 'Giáo dục & Đào tạo' },
                { id: 'Thẩm mỹ & Làm đẹp', label: 'Thẩm mỹ & Làm đẹp' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                    selectedIndustry === ind.id 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map(camp => (
                <Card key={camp.id} className="hover:border-slate-300 transition-all">
                  <CardHeader className="flex justify-between items-start pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{camp.industry}</Badge>
                        <Badge variant="neutral" className="text-[10px] text-slate-500">
                          Chính sách v{camp.policyVersion}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-slate-900 leading-snug">
                        {camp.title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {camp.tenantName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-extrabold text-emerald-600 block">
                        {camp.commissionType === 'percentage' 
                          ? `${camp.commissionRate}%` 
                          : `${(camp.commissionRate / 1000000).toLocaleString('vi-VN')} Tr / Đơn`}
                      </span>
                      <span className="text-[11px] text-slate-400">Hoa hồng chuẩn</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {camp.terms}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Thời hạn Cookie:</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> {camp.cookieWindowDays} ngày bảo vệ nguồn
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Đơn tối thiểu:</span>
                        <span className="font-semibold text-slate-700">
                          {camp.minDealValue > 0 ? `${(camp.minDealValue / 1000000).toLocaleString('vi-VN')} Tr VNĐ` : 'Không giới hạn'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      {camp.isJoined ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đã tham gia (Đang hoạt động)
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Chưa tham gia</span>
                      )}

                      {camp.isJoined ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setActiveTab('my-links')}
                          className="text-xs"
                        >
                          Lấy link chia sẻ
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinCampaign(camp)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Tham gia ngay
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY LINKS & QR CODES */}
        {activeTab === 'my-links' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mã giới thiệu & Link chia sẻ cá nhân</h2>
                <p className="text-sm text-slate-500">Chia sẻ link hoặc mã QR để được ghi nhận khách hàng tự động vào tài khoản đối tác của bạn</p>
              </div>
            </div>

            {/* Custom Link Creator Card */}
            <Card className="bg-emerald-50/40 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-950 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  Tạo mã giới thiệu hoặc link rút gọn tuỳ chỉnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCustomLink} className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Chọn chiến dịch:</label>
                    <select
                      value={selectedCampaignForLink}
                      onChange={(e) => setSelectedCampaignForLink(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-1/3">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mã định danh riêng (Slug):</label>
                    <input
                      type="text"
                      placeholder="VD: TUAN_SUMMER_26"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button type="submit" size="sm" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                      Tạo link ngay
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Links List */}
            <div className="space-y-4">
              {links.map((link) => (
                <Card key={link.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* QR Code preview */}
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center shrink-0">
                        <img
                          src={link.qrCodeUrl}
                          alt="Referral QR Code"
                          className="w-36 h-36 rounded-lg mx-auto"
                        />
                        <span className="block mt-2 text-xs font-mono font-bold text-slate-800 bg-slate-100 py-1 px-2 rounded">
                          {link.code}
                        </span>
                      </div>

                      {/* Links and Share actions */}
                      <div className="space-y-4 flex-1 w-full">
                        <div>
                          <Badge variant="neutral" className="mb-1 text-slate-600">{link.campaignTitle}</Badge>
                          <label className="text-xs font-semibold text-slate-600 block mt-1">Referral Link trực tiếp:</label>
                          <div className="flex gap-2 mt-1">
                            <input
                              readOnly
                              value={link.fullReferralUrl}
                              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 select-all"
                            />
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(link.fullReferralUrl, link.id)}
                              className="shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {copiedCode === link.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedCode === link.id ? 'Đã sao chép' : 'Copy'}
                            </Button>
                          </div>
                        </div>

                        {/* Real-time Link Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500">Lượt click</span>
                            <p className="text-lg font-bold text-slate-900">{link.clicksCount}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500">Khách tiềm năng</span>
                            <p className="text-lg font-bold text-slate-900">{link.leadsCount}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500">Đơn thành công</span>
                            <p className="text-lg font-bold text-emerald-600">{link.conversionsCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEADS & ATTRIBUTION ENGINE */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Khách hàng được ghi nhận nguồn của bạn</h2>
                <p className="text-sm text-slate-500">Hệ thống bảo vệ nguồn khách (Attribution Engine) minh bạch theo cơ chế Last-Click & Cookie Window</p>
              </div>
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cơ chế Attribution Bất biến
              </Badge>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Doanh nghiệp</th>
                      <th className="p-4">Dịch vụ & Doanh số</th>
                      <th className="p-4">Mô hình Quy kết (Attribution)</th>
                      <th className="p-4">Thời hạn bảo vệ</th>
                      <th className="p-4 text-right">Hoa hồng ghi nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">{lead.customerName}</p>
                          <p className="text-xs text-slate-400 font-mono">{lead.phone}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">{lead.enterprise}</p>
                          <span className="text-[11px] text-slate-400">Chính sách v{lead.policyVersion}</span>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-semibold text-slate-900">{lead.service}</p>
                          <span className="text-xs text-slate-500">{lead.dealValue}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="neutral" className="text-slate-700 bg-slate-50">
                            {lead.attributionModel}
                          </Badge>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click: {lead.clickTime}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Còn {lead.daysRemainingInCookie} ngày
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-emerald-600 text-sm block">{lead.commission}</span>
                          <Badge variant={lead.status === 'Đã chốt hợp đồng' || lead.status === 'Đã thanh toán' ? 'success' : 'warning'}>
                            {lead.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: WALLET & FINANCES */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Balance Overview Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Số dư khả dụng</span>
                  <h2 className="text-3xl font-extrabold mt-1 text-white">
                    {walletBalances.available.toLocaleString('vi-VN')} ₫
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Sẽ tự động chuyển khoản vào ngày 15 hàng tháng theo tài khoản ngân hàng liên kết</p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20"
                >
                  Rút tiền về Ngân hàng
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 relative z-10">
                <div>
                  <span className="text-xs text-slate-400">Chờ duyệt (Pending)</span>
                  <p className="text-base font-bold text-amber-400">{walletBalances.pending.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Đang đối soát</span>
                  <p className="text-base font-bold text-sky-400">{walletBalances.settling.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Tổng đã nhận (Lifetime)</span>
                  <p className="text-base font-bold text-emerald-400">{walletBalances.lifetime.toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>
            </div>

            {/* Recent Commission Events */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử Hoa hồng đối soát (Immutable Ledger)</CardTitle>
                <Badge variant="success">Minh bạch Kế toán Kép</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {ledgerHistory.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.enterprise} • {item.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${item.amount.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.amount}
                        </span>
                        <div>
                          <Badge variant={item.status === 'Đã chi trả' ? 'success' : item.status === 'Đã duyệt' ? 'info' : 'warning'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL: JOIN CAMPAIGN & AGREE POLICY VERSION */}
      {joiningCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <Badge variant="info" className="mb-1">{joiningCampaign.industry}</Badge>
                <h3 className="text-lg font-bold text-slate-900">{joiningCampaign.title}</h3>
                <p className="text-xs text-slate-500">{joiningCampaign.tenantName}</p>
              </div>
              <button 
                onClick={() => setJoiningCampaign(null)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mức hoa hồng:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {joiningCampaign.commissionType === 'percentage' 
                      ? `${joiningCampaign.commissionRate}%` 
                      : `${(joiningCampaign.commissionRate / 1000000).toLocaleString('vi-VN')} Tr VNĐ`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời hạn Cookie bảo lưu:</span>
                  <span className="font-semibold text-slate-800">{joiningCampaign.cookieWindowDays} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phiên bản chính sách:</span>
                  <span className="font-mono font-semibold text-slate-800">Version {joiningCampaign.policyVersion}.0</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Điều khoản & Quy định:</label>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 max-h-24 overflow-y-auto">
                  {joiningCampaign.terms}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú giới thiệu về bạn (tuỳ chọn):</label>
                <textarea
                  rows={2}
                  placeholder="Kênh quảng bá của bạn (Website, Facebook, Tik Tok, Cộng đồng...)"
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedPolicy}
                  onChange={(e) => setAgreedPolicy(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700">
                  Tôi đã đọc và cam kết tuân thủ chính sách hoa hồng <strong>v{joiningCampaign.policyVersion}</strong> của doanh nghiệp.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setJoiningCampaign(null)}>
                Huỷ bỏ
              </Button>
              <Button 
                size="sm" 
                disabled={!agreedPolicy} 
                onClick={confirmJoinCampaign}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Xác nhận & Cấp Link ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAYOUT REQUEST */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Yêu cầu rút tiền hoa hồng</h3>
                <p className="text-xs text-slate-500">
                  Số dư khả dụng: <strong className="text-emerald-600">{walletBalances.available.toLocaleString('vi-VN')} ₫</strong>
                </p>
              </div>
              <button 
                onClick={() => setIsPayoutModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số tiền muốn rút (VNĐ):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="100000"
                    max={walletBalances.available}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full text-sm font-semibold p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(walletBalances.available.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100"
                  >
                    Tối đa
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ngân hàng thụ hưởng:</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Vietcombank">Vietcombank (Ngoại thương Việt Nam)</option>
                  <option value="Techcombank">Techcombank (Kỹ thương)</option>
                  <option value="MB Bank">MB Bank (Quân đội)</option>
                  <option value="ACB">ACB (Á Châu)</option>
                  <option value="VPBank">VPBank (Việt Nam Thịnh Vượng)</option>
                  <option value="VietinBank">VietinBank (Công thương)</option>
                  <option value="BIDV">BIDV (Đầu tư và Phát triển)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số tài khoản ngân hàng:</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tên chủ tài khoản (Không dấu):</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full text-xs font-semibold uppercase p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                Giao dịch giải ngân sẽ được đối soát và chuyển khoản tự động qua hệ thống VietQR / Napas 24/7.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsPayoutModalOpen(false)}>
                  Huỷ
                </Button>
                <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Xác nhận rút tiền
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
