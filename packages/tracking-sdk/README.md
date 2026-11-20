# PartnerOS Tracking SDK

Bộ công cụ tracking siêu nhẹ (~4KB, Zero Dependency) giúp doanh nghiệp nhúng vào Website / Landing Page (Ladipage, Webflow, WordPress, Sapo, Haravan, Shopify) để tự động ghi nhận nguồn CTV giới thiệu.

## 1. Cách nhúng qua thẻ `<script>` (HTML / Landing Page)

Thêm đoạn mã sau vào trước thẻ đóng `</head>` hoặc trước `</body>`:

```html
<!-- PartnerOS Tracking Script -->
<script src="https://cdn.partneros.vn/sdk.v1.js"></script>
<script>
  PartnerOS.init({
    tenantSlug: 'smilecare', // Slug của doanh nghiệp trên PartnerOS
    cookieDays: 60,          // Thời gian bảo lưu nguồn CTV (mặc định 60 ngày)
    autoBindForms: true      // Tự động gán mã CTV vào các Form điền thông tin trên trang
  });
</script>
```

## 2. Cách hoạt động

1. **Bắt link:** Khi khách hàng click vào link giới thiệu có dạng: `https://smilecare.vn/booking?ref=REF_ANH_TUAN`
2. **Lưu trữ đa tầng:** SDK tự động lưu `REF_ANH_TUAN` vào First-party Cookie (60 ngày) và `localStorage`.
3. **Ghi nhận Click:** Gửi beacon nền không chặn tải trang (`navigator.sendBeacon`) về server PartnerOS.
4. **Tự động gắn vào Form:** Khi khách gửi Form liên hệ/đặt lịch, SDK tự động inject input ẩn `referral_code` hoặc gửi event conversion lên hệ thống.

## 3. Gửi chuyển đổi thủ công qua JavaScript (Custom Trigger)

Nếu website của bạn dùng Popup hoặc giỏ hàng tùy chỉnh, bạn có thể gọi trực tiếp:

```javascript
PartnerOS.trackConversion({
  contactName: "Nguyễn Văn A",
  contactPhone: "0901234567",
  contactEmail: "a.nguyen@example.com",
  dealValue: 15000000, // Giá trị đơn hàng (nếu có)
  dealTitle: "Dịch vụ Niềng Răng Mắc Cài"
});
```
