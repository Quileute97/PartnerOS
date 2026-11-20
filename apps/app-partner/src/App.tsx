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
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatCard } from '@partner-os/ui';

export function App() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'marketplace' | 'my-links' | 'leads'>('wallet');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-5xl mx-auto shadow-sm">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
            P
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Partner Portal</h1>
            <p className="text-xs text-slate-500">Mạng lưới Đối tác & CTV PartnerOS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900">Nguyễn Văn Tuấn</p>
            <p className="text-[11px] text-emerald-600 font-medium">Đối tác VIP</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            NT
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 flex gap-1 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'wallet' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Ví & Thu nhập
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'marketplace' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Affiliate Marketplace
        </button>
        <button
          onClick={() => setActiveTab('my-links')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'my-links' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Link & Mã QR của tôi
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'leads' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Khách hàng đã giới thiệu
        </button>
      </nav>

      {/* Body Views */}
      <main className="p-4 sm:p-6 space-y-6 flex-1">
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Balance Overview Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Số dư khả dụng</span>
                  <h2 className="text-3xl font-extrabold mt-1 text-white">16,500,000 ₫</h2>
                  <p className="text-xs text-slate-400 mt-1">Sẽ tự động chuyển khoản vào ngày 15 hàng tháng</p>
                </div>
                <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
                  Rút tiền về Ngân hàng
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 relative z-10">
                <div>
                  <span className="text-xs text-slate-400">Chờ duyệt (Pending)</span>
                  <p className="text-base font-bold text-amber-400">3,500,000 ₫</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Đang đối soát</span>
                  <p className="text-base font-bold text-sky-400">0 ₫</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Tổng đã nhận (Lifetime)</span>
                  <p className="text-base font-bold text-emerald-400">128,400,000 ₫</p>
                </div>
              </div>
            </div>

            {/* Recent Commission Events */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử Hoa hồng gần đây</CardTitle>
                <Badge variant="success">Minh bạch Ledger</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[
                    { title: 'Trồng răng Implant - Khách: Phạm Minh Đức', enterprise: 'Nha Khoa SmileCare', amount: '+3,500,000 ₫', status: 'Chờ duyệt', date: '20/11/2026' },
                    { title: 'Bọc răng sứ HT - Khách: Vũ Lan Anh', enterprise: 'Nha Khoa SmileCare', amount: '+2,400,000 ₫', status: 'Đã duyệt', date: '18/11/2026' },
                    { title: 'Căn hộ Grand View - Khách: Lê Minh Tuấn', enterprise: 'BĐS SkyLand', amount: '+50,000,000 ₫', status: 'Đã chi trả', date: '15/11/2026' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.enterprise} • {item.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-600">{item.amount}</span>
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

        {activeTab === 'marketplace' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Affiliate Marketplace</h2>
              <p className="text-sm text-slate-500">Khám phá và tham gia các chiến dịch hoa hồng hấp dẫn từ nhiều doanh nghiệp</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div>
                    <Badge variant="info" className="mb-1">Nha khoa & Y tế</Badge>
                    <CardTitle>Nha Khoa Thẩm Mỹ SmileCare</CardTitle>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-600">10%</span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Hoa hồng 10% trên mỗi ca bọc răng sứ, niềng răng, cấy ghép Implant. Cookie lưu trữ 60 ngày.
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Đơn tối thiểu: 5,000,000 ₫</span>
                    <span className="text-emerald-700 font-semibold">Đã tham gia</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <Badge variant="warning" className="mb-1">Bất động sản</Badge>
                    <CardTitle>Dự án Căn hộ Sun Riverside</CardTitle>
                  </div>
                  <span className="text-xl font-extrabold text-indigo-600">50 Tr / Căn</span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Hoa hồng cố định 50,000,000 ₫ khi khách ký hợp đồng cọc thành công. Đối soát vào ngày 30 hàng tháng.
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Thời hạn cookie: 90 ngày</span>
                    <Button size="sm">Đăng ký tham gia</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'my-links' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mã giới thiệu & Link chia sẻ cá nhân</h2>
              <p className="text-sm text-slate-500">Chia sẻ link hoặc mã QR để được ghi nhận khách hàng tự động</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code preview */}
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://smilecare.partneros.vn/booking?ref=REF_TUAN_VIP"
                      alt="Referral QR Code"
                      className="w-40 h-40 rounded-lg"
                    />
                    <span className="block mt-2 text-xs font-mono font-bold text-slate-700">REF_TUAN_VIP</span>
                  </div>

                  {/* Links and Share actions */}
                  <div className="space-y-4 flex-1 w-full">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Referral Link trực tiếp:</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value="https://smilecare.partneros.vn/booking?ref=REF_TUAN_VIP"
                          className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('https://smilecare.partneros.vn/booking?ref=REF_TUAN_VIP')}
                          className="shrink-0 gap-1.5"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCode ? 'Đã sao chép' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">Lượt click</span>
                        <p className="text-lg font-bold text-slate-900">348</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">Khách tiềm năng</span>
                        <p className="text-lg font-bold text-slate-900">48</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">Đơn thành công</span>
                        <p className="text-lg font-bold text-emerald-600">12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Khách hàng được ghi nhận nguồn của bạn</h2>
              <p className="text-sm text-slate-500">Hệ thống tự động bảo vệ nguồn khách (Attribution Engine) trong suốt thời gian quy định</p>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Doanh nghiệp</th>
                      <th className="p-4">Dịch vụ quan tâm</th>
                      <th className="p-4">Trạng thái xử lý</th>
                      <th className="p-4">Hoa hồng dự kiến</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">Phạm Minh Đức</p>
                        <p className="text-xs text-slate-400 font-mono">0912***678</p>
                      </td>
                      <td className="p-4">Nha Khoa SmileCare</td>
                      <td className="p-4 text-xs font-medium">Cấy ghép Implant Straumann</td>
                      <td className="p-4"><Badge variant="success">Đã chốt hợp đồng</Badge></td>
                      <td className="p-4 font-bold text-emerald-600">3,500,000 ₫</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">Hoàng Khánh Linh</p>
                        <p className="text-xs text-slate-400 font-mono">0977***112</p>
                      </td>
                      <td className="p-4">Nha Khoa SmileCare</td>
                      <td className="p-4 text-xs font-medium">Niềng răng trong suốt</td>
                      <td className="p-4"><Badge variant="warning">Đang tư vấn</Badge></td>
                      <td className="p-4 font-bold text-slate-400">Đang chờ chốt</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
