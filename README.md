# PartnerOS (Multi-Tenant SaaS CRM + Affiliate Marketplace + Centralized Settlement)

Nền tảng công nghệ kết nối Doanh nghiệp với Mạng lưới Cộng tác viên (CTV) & Đối tác thông qua CRM cá nhân hóa và Hệ thống đối soát hoa hồng tập trung.

---

## 1. Cấu trúc Monorepo

```text
partner-os/
├── apps/
│   ├── app-business/       # Business CRM Portal dành cho Doanh nghiệp (React + Vite + Tailwind)
│   ├── app-partner/        # Partner Portal dành cho Cộng tác viên (Mobile-first, React + Vite)
│   └── api-server/         # Cloudflare Workers + Hono.js (REST API, Tracking, Webhooks)
├── packages/
│   ├── shared-types/       # TypeScript types (Tenant, CRM, Affiliate, Finance, Ledger)
│   ├── ui/                 # Component UI dùng chung (shadcn/ui style, Tailwind CSS)
│   ├── database/           # 7 migration SQL files cho Supabase PostgreSQL (RLS, Triggers, Ledger)
│   └── tracking-sdk/       # Lightweight JS SDK (~4KB) nhúng vào Landing Page đối tác
├── package.json
└── pnpm-workspace.yaml
```

---

## 2. Hướng dẫn Chạy Thử nghiệm (Local Development)

### Cài đặt dependencies:
```bash
pnpm install
```

### Chạy Business CRM Portal (Port 3000):
```bash
pnpm dev:business
```

### Chạy Partner Portal (Port 3001):
```bash
pnpm dev:partner
```

### Chạy API Server (Cloudflare Workers / Hono):
```bash
pnpm dev:api
```

---

## 3. Kiến trúc Database & Triển khai Supabase

Toàn bộ mã DDL SQL được đặt trong thư mục `packages/database/migrations/`:

1. `01_init_extensions_and_enums.sql`: Kích hoạt extensions và khởi tạo các ENUM nghiệp vụ.
2. `02_tenants_and_users.sql`: Bảng tổ chức (`tenants`), `user_profiles` và phân quyền `tenant_members`.
3. `03_dynamic_crm_and_pipelines.sql`: Hệ thống CRM động: `crm_field_definitions` (No-code schema), `crm_contacts`, `crm_deals` với trường `custom_fields jsonb` kèm chỉ mục GIN.
4. `04_affiliate_and_tracking.sql`: Hệ thống chiến dịch (`affiliate_campaigns`), link giới thiệu (`referral_links`), log click bất biến (`tracking_clicks`) và ghi nhận chuyển đổi (`tracking_conversions`).
5. `05_financial_ledger_and_settlement.sql`: Hệ thống hoa hồng (`commissions`), ví đối tác (`partner_wallets`), **Sổ cái kế toán kép bất biến (`ledger_entries`)**, và kỳ đối soát (`settlement_batches`).
6. `06_row_level_security_rls.sql`: Chính sách RLS cách ly 100% dữ liệu đa doanh nghiệp (Multi-tenant isolation).
7. `07_triggers_and_automation.sql`: Trigger tự động tính hoa hồng khi Deal `won`, tự động đồng bộ số dư ví và chặn tuyệt đối sửa/xóa sổ cái.

---

## 4. Tracking SDK & Máy Trạng Thái Tài Chính (Commission Engine)

### Nhúng Tracking SDK vào Landing page doanh nghiệp:
```html
<script src="https://cdn.partneros.vn/sdk.v1.js"></script>
<script>
  PartnerOS.init({
    tenantSlug: 'smilecare',
    cookieDays: 60,
    autoBindForms: true
  });
</script>
```

### Máy Trạng Thái Hoa Hồng (State Machine):
- `PENDING`: Giao dịch thành công, đang trong thời gian đối soát/chống hoàn tiền (mặc định 14 ngày).
- `APPROVED`: Doanh nghiệp xác nhận, ghi nhận bút toán kép `Debit: tenant_payable` và `Credit: partner_receivable`.
- `IN_SETTLEMENT`: Đưa vào kỳ đối soát định kỳ (ngày 15 & 30 hàng tháng).
- `PAID`: Giải ngân thành công về tài khoản ngân hàng của CTV.
- `REVERSED`: Trường hợp phát hiện gian lận hoặc hoàn tiền sau thanh toán $\rightarrow$ Sinh bút toán đảo (Reversal Entry) trong Sổ cái bất biến, không bao giờ xóa dữ liệu.
