# PartnerOS — Phase 0: System Architecture Blueprint & Foundation Specification

> **Version:** 1.0  
> **Status:** Architecture Blueprint (Approved for Implementation)  
> **Platform Category:** Multi-tenant SaaS CRM + Affiliate Marketplace + Centralized Settlement  

---

## 1. Monorepo Organization

```text
partneros/
├── apps/
│   ├── website/              # Trang chủ, Marketplace công khai, Pricing, Docs
│   ├── business-crm/         # Business CRM Portal (Vite + React 19 + Tailwind)
│   ├── partner-portal/       # Affiliate/Partner Portal (Mobile-first, Wallet, Links, QR)
│   ├── admin-console/        # Bàn điều hành Operator (Kiểm duyệt, Rủi ro, Đối soát)
│   ├── desktop-crm/          # (Future) Windows Desktop App (Tauri)
│   └── api-server/           # Central API Engine (Cloudflare Workers + Hono.js)
├── packages/
│   ├── ui/                   # Design system dùng chung (shadcn/ui style, Tailwind CSS)
│   ├── auth/                 # Supabase Auth Client wrapper & Session sync
│   ├── permissions/          # RBAC engine, Permission matrix, Role checker
│   ├── database/             # Generated database types & Supabase client factory
│   ├── api-client/           # Typed SDK kết nối Backend API cho Frontends
│   ├── shared-types/         # Domain models (Identity, Tenant, Deal, Ledger, Settlement, Risk)
│   ├── validation/           # Zod schemas cho validation
│   ├── events/               # Event schemas (UserCreated, DealWon, CommissionCreated)
│   ├── tracking-sdk/         # Zero-dependency JS SDK (~4KB) cho Landing Page
│   └── logging/              # Structured audit logging helper
├── services/                 # Logical backend service modules (API-first)
│   ├── identity/             # Quản lý tài khoản, mật khẩu, phiên làm việc
│   ├── organization/         # Hồ sơ DN, chi nhánh, tên miền tùy biến, xác thực pháp lý
│   ├── crm/                  # Quản lý khách hàng, lead, hợp đồng, custom fields
│   ├── marketplace/          # Sàn chiến dịch, danh mục ngành nghề, tìm kiếm & duyệt CTV
│   ├── affiliate/            # Cấp mã ref, QR code, quản lý mạng lưới
│   ├── tracking/             # Thu thập Click, Lead, Attribution engine
│   ├── commission/           # Máy tính hoa hồng, snapshot tỷ lệ, quy tắc điều kiện
│   ├── settlement/           # Sổ cái kế toán kép bất biến, kỳ đối soát định kỳ
│   ├── payment/              # Bộ chuyển đổi cổng thanh toán & ngân hàng
│   ├── trust-risk/           # Đánh giá điểm rủi ro, phát hiện gian lận tự refer
│   ├── integrations/         # Webhooks, API keys, kết nối CRM ngoài
│   ├── billing/              # Đăng ký gói SaaS cho DN
│   └── notification/         # Trung tâm thông báo In-app, Email, SMS, Webhook
├── supabase/
│   ├── migrations/           # Các bản migration DDL SQL chính thức
│   ├── tests/                # Bộ test SQL tự động kiểm tra RLS (pgTAP)
│   └── seed/                 # Dữ liệu mẫu khởi tạo môi trường Dev & Staging
├── infrastructure/
│   ├── cloudflare/           # wrangler.toml, Worker routes, R2 buckets, WAF
│   └── github-actions/       # CI/CD: lint, typecheck, test, deploy
└── docs/                     # Tài liệu kiến trúc, API docs, sơ đồ ERD
```

---

## 2. Core Identity & Multi-Tenancy Data Model

### Identity
- `users`: Bảng tài khoản người dùng gắn với Supabase Auth.
- `user_profiles`: Mở rộng thông tin cá nhân (`full_name`, `phone`, `avatar_url`, `language`, `timezone`).
- `user_sessions`: Lưu lịch sử phiên đăng nhập, IP, User-Agent, trạng thái thu hồi.
- `user_security_events`: Audit log bảo mật (đổi mật khẩu, đăng nhập thất bại, bật MFA).

### Organizations
- `organizations`: Bảng tổ chức doanh nghiệp (`id`, `name`, `slug`, `legal_name`, `tax_id`, `status`, `tier`).
- `organization_profiles`: Logo, màu nhận diện (`branding`), ngành nghề (`industry`), mô tả, hotline, địa chỉ.
- `organization_branches`: Chi nhánh/cơ sở trực thuộc.
- `organization_domains`: Quản lý Custom Domain (`crm.domain.com`) kèm trạng thái xác thực DNS.
- `organization_settings`: Cấu hình tiền tệ, múi giờ, chu kỳ đối soát, thời gian bảo lưu hoa hồng chống hoàn tiền (`hold_period_days`).

### RBAC Permissions
- `permissions`: Danh mục quyền nguyên tử (`crm.contacts.read`, `crm.contacts.write`, `deals.stage.change`, `affiliate.campaigns.manage`, `finance.settlement.approve`, `org.members.invite`).
- `roles`: Vai trò chuẩn (`owner`, `admin`, `branch_manager`, `sales_rep`, `accountant`, `support`).
- `role_permissions`: Ma trận gán quyền cho vai trò.
- `organization_memberships`: Thành viên của tổ chức kèm chi nhánh gán (`branch_id`).
- `membership_roles`: Phân vai trò cho từng thành viên trong tổ chức.

---

## 3. Row-Level Security (RLS) & Isolation Invariants

Mọi truy vấn dữ liệu từ Frontend gửi kèm JWT:
1. Hàm PostgreSQL `is_org_member(target_org_id, auth.uid())` kiểm tra xem người dùng hiện tại có thuộc tổ chức hay không.
2. Hàm `has_org_permission(target_org_id, required_permission)` kiểm tra quyền cụ thể của người dùng trong tổ chức đó.
3. Chính sách RLS trên mọi bảng nghiệp vụ tự động lọc:
   `WHERE organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid() AND status = 'active')`
4. Dữ liệu giữa các doanh nghiệp được cách ly 100% ở tầng Database Engine.
