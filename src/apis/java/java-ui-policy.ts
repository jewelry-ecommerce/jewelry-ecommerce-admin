export const JAVA_FORM_LIMITATIONS = [
  { route: /^\/products\/(create|[^/]+\/edit)$/,
    message: 'Form sản phẩm giữ đầy đủ trường gốc. Java hiện chưa lưu SEO, thuế, thông tin bổ sung và phối kèm; chưa thể xác nhận lưu toàn bộ form.' },
  { route: /^\/promotions\/(create|[^/]+(?:\/edit)?)$/,
    message: 'Java hiện có khuyến mãi cơ bản, chưa có đầy đủ campaign/draft/schema cho quy trình cấu hình này.' },
  { route: /^\/cms\/banners$/,
    message: 'Slider đã có adapter. Java chưa lưu đầy đủ layout Grid/Double banner và chưa có API xóa placement.' },
] as const;
export const JAVA_ORDER_ACTIONS = {
  Pending: { target: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  Confirmed: { target: 'SHIPPING', label: 'Gửi lệnh giao hàng' },
  Shipping: { target: 'DELIVERED', label: 'Xác nhận giao thành công' },
} as const;
