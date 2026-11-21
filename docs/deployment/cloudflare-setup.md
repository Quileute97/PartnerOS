# Hướng Dẫn Cấu Hình Triển Khai Cloudflare (Workers & Pages) Cho PartnerOS

Dự án **PartnerOS** được xây dựng theo kiến trúc **Monorepo (PNPM Workspace)** gồm nhiều ứng dụng độc lập trong thư mục `apps/`. 

Khi triển khai trên Cloudflare, lỗi:
```text
[ERROR] The Wrangler application detection logic has been run
in the root of a workspace instead of targeting a specific project.
```
xảy ra do Cloudflare mặc định chạy lệnh ở thư mục gốc (Root) của repository thay vì đi vào thư mục của ứng dụng cụ thể.

Dưới đây là bảng thông số cấu hình chính xác 100% cho từng ứng dụng trên Cloudflare.

---

## 1. Backend API (Cloudflare Workers)

Dùng cho: `apps/api-server` (Hono.js + Cloudflare Workers)

### Các bước cài đặt:
1. Vào **Cloudflare Dashboard** → **Workers & Pages**.
2. Chọn dự án API Worker đã kết nối với GitHub `PartnerOS`.
3. Vào tab **Settings** → **Builds & deployments** (hoặc cấu hình lúc tạo mới).
4. Điền các trường cấu hình sau:

| Tên Cấu Hình | Giá Trị Cần Điền | Ghi Chú |
| :--- | :--- | :--- |
| **Root directory** | `apps/api-server` | **BẮT BUỘC** (Tránh lỗi Wrangler chạy ở root) |
| **Build command** | `pnpm install` *(hoặc để trống)* | Wrangler tự động bundle `src/index.ts` |
| **Deploy command** | `npx wrangler deploy` | Sử dụng cấu hình trong `apps/api-server/wrangler.toml` |

---

## 2. Frontend Applications (Cloudflare Pages)

Tất cả 4 ứng dụng giao diện đều sử dụng **Cloudflare Pages**.

### A. Business CRM (`apps/app-business`)
- **Dự án:** CRM Doanh nghiệp quản lý khách hàng, lead, hợp đồng, hoa hồng.
- **Cấu hình trên Cloudflare Pages:**
  - **Project name:** `partneros-business`
  - **Framework preset:** `Vite`
  - **Root directory:** `apps/app-business`
  - **Build command:** `pnpm build`
  - **Build output directory:** `dist`

### B. Partner Portal (`apps/app-partner`)
- **Dự án:** Cổng Cộng tác viên / Đối tác (Sàn chiến dịch, link QR, rút tiền).
- **Cấu hình trên Cloudflare Pages:**
  - **Project name:** `partneros-partner`
  - **Framework preset:** `Vite`
  - **Root directory:** `apps/app-partner`
  - **Build command:** `pnpm build`
  - **Build output directory:** `dist`

### C. Admin Console (`apps/admin-console`)
- **Dự án:** Bàn điều hành Sàn (Kiểm duyệt pháp nhân, xử lý gian lận, sổ cái).
- **Cấu hình trên Cloudflare Pages:**
  - **Project name:** `partneros-admin`
  - **Framework preset:** `Vite`
  - **Root directory:** `apps/admin-console`
  - **Build command:** `pnpm build`
  - **Build output directory:** `dist`

### D. Main Website (`apps/website`)
- **Dự án:** Landing Page giới thiệu giải pháp và sàn Affiliate công khai.
- **Cấu hình trên Cloudflare Pages:**
  - **Project name:** `partneros-website`
  - **Framework preset:** `Vite`
  - **Root directory:** `apps/website`
  - **Build command:** `pnpm build`
  - **Build output directory:** `dist`

---

## 3. Biến Môi Trường Cần Thiết (Environment Variables)

Trong mục **Settings** → **Environment variables**:

- `NODE_VERSION`: `20` (hoặc hệ thống đã tự động nhận diện từ `.node-version`)
- `VITE_API_URL`: URL của Backend Worker (VD: `https://api.partneros.vn` hoặc `https://partner-os-api.<subdomain>.workers.dev`)
