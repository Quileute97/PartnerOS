# PartnerOS Database Architecture (Supabase PostgreSQL)

Tài liệu hướng dẫn triển khai cơ sở dữ liệu cho PartnerOS trên Supabase.

## Cấu trúc Migrations

1. `01_init_extensions_and_enums.sql`: Kích hoạt `uuid-ossp`, `pgcrypto`, `citext` và định nghĩa các ENUM (roles, deal status, commission status, ledger account types).
2. `02_tenants_and_users.sql`: Bảng tổ chức (`tenants`), hồ sơ người dùng (`user_profiles`), và thành viên doanh nghiệp (`tenant_members`).
3. `03_dynamic_crm_and_pipelines.sql`: Hệ thống CRM động: định nghĩa trường tùy biến (`crm_field_definitions`), giai đoạn (`crm_stages`), khách hàng (`crm_contacts`), cơ hội bán hàng (`crm_deals`) với cột `custom_fields jsonb` kèm chỉ mục GIN.
4. `04_affiliate_and_tracking.sql`: Hệ thống chiến dịch (`affiliate_campaigns`), link & QR (`referral_links`), log click bất biến (`tracking_clicks`) và ghi nhận chuyển đổi (`tracking_conversions`).
5. `05_financial_ledger_and_settlement.sql`: Hệ thống tài chính: danh sách hoa hồng (`commissions`), ví CTV (`partner_wallets`), **Sổ cái kế toán kép bất biến (`ledger_entries`)**, và các đợt đối soát (`settlement_batches`, `settlement_items`).
6. `06_row_level_security_rls.sql`: Chính sách RLS cách ly 100% dữ liệu giữa các tenant và bảo mật thông tin ví cho đối tác.
7. `07_triggers_and_automation.sql`: Trigger tự động tính hoa hồng khi Deal `won`, tự động đồng bộ số dư ví và khóa chống sửa/xóa sổ cái kế toán.

## Cách chạy Migration trên Supabase

1. Đăng nhập Supabase Console $\rightarrow$ Chọn Project của bạn.
2. Mở **SQL Editor**.
3. Chạy lần lượt các file từ `01` đến `07`.
