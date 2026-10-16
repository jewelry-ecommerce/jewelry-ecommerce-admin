export const JAVA_FORM_LIMITATIONS = [
  { route: /^\/products\/(create|[^/]+\/edit)$/,
    message: 'Đã nối form sản phẩm với Java, gồm SEO, thông tin bổ sung, phối kèm, thương hiệu và mùa. Bao bì chưa thuộc phạm vi; bộ lọc người tạo chưa được Java hỗ trợ.' },
  { route: /^\/promotions\/(create|[^/]+(?:\/edit)?)$/,
    message: 'Java hiện có khuyến mãi cơ bản, chưa có đầy đủ campaign/draft/schema cho quy trình cấu hình này.' },
  { route: /^\/cms\/banners$/,
    message: 'Đã nối layout Grid, Slider và Double banner với Java. Backend chưa có API xóa placement.' },
] as const;
export const JAVA_ORDER_ACTIONS = {
  Pending: { target: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  Confirmed: { target: 'SHIPPING', label: 'Gửi lệnh giao hàng' },
  Shipping: { target: 'DELIVERED', label: 'Xác nhận giao thành công' },
} as const;
