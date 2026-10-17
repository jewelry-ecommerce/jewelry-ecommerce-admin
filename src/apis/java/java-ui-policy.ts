export const JAVA_FORM_LIMITATIONS = [
  { route: /^\/products\/(create|[^/]+\/edit)$/,
    message: 'Đã nối form sản phẩm và bộ lọc người tạo với Java. Bao bì chưa thuộc phạm vi.' },
  { route: /^\/promotions\/(create|[^/]+(?:\/edit)?)$/,
    message: 'Java v7 hỗ trợ Markdown, Đồng giá và Voucher; Online, tất cả khách hàng, không quota/import file. Phạm vi SKU và voucher còn cần BE sửa để đồng nhất với checkout.' },
  { route: /^\/cms\/banners$/,
    message: 'Đã nối Grid, Slider, Double banner, phiên bản và xóa placement với Java. Placement đang được sử dụng có thể bị backend từ chối xóa.' },
] as const;
export const JAVA_ORDER_ACTIONS = {
  Pending: { target: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  Confirmed: { target: 'SHIPPING', label: 'Gửi lệnh giao hàng' },
  Shipping: { target: 'DELIVERED', label: 'Xác nhận giao thành công' },
} as const;
