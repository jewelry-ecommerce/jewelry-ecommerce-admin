export const PRODUCT_AUDIT_LOG_FIELD_LABELS: Record<string, string> = {
  updatedAt: 'Thời gian cập nhật',
  createdAt: 'Thời gian tạo',
  deletedAt: 'Thời gian xóa',
  status: 'Trạng thái',
  name: 'Tên sản phẩm',
  spuCode: 'Mã sản phẩm',
  slug: 'Slug',
  productKind: 'Loại sản phẩm',
  description: 'Mô tả',
  categoryId: 'Danh mục (ID)',
  categoryCode: 'Mã danh mục',
  categoryName: 'Danh mục',
  brandId: 'Thương hiệu (ID)',
  brandCode: 'Mã thương hiệu',
  brandName: 'Thương hiệu',
  seasonId: 'Mùa (ID)',
  seasonCode: 'Mã mùa',
  seasonName: 'Mùa',
  productInfos: 'Thông tin sản phẩm (tab)',
  skus: 'Biến thể',
  packagingRelations: 'Quan hệ bao bì',
  defaultVariationId: 'Biến thể đại diện',
  taxRateOverride: 'Thuế suất (ghi đè)',
  metaTitle: 'Meta title',
  metaDescription: 'Meta description',
  metaKeywords: 'Meta keywords',
  image: 'Ảnh đại diện',
  imageHover: 'Ảnh hover',
  weight: 'Khối lượng (g)',
  length: 'Chiều dài (cm)',
  width: 'Chiều rộng (cm)',
  height: 'Chiều cao (cm)',
  variantAttributeOrder: 'Thứ tự thuộc tính biến thể',
  beforeSnapshot: 'Ảnh chụp trước',
  afterSnapshot: 'Ảnh chụp sau',
  actionType: 'Loại yêu cầu duyệt',
  rejectReason: 'Lý do từ chối',
  reviewedBy: 'Người duyệt',
  requestedBy: 'Người yêu cầu',
  submittedBy: 'Người gửi',
  createdById: 'Người tạo',
  updatedById: 'Người cập nhật',
};

export const PRODUCT_AUDIT_LOG_ACTION_LABELS: Record<string, string> = {
  create: 'Tạo',
  update: 'Cập nhật',
  delete: 'Xóa',
  read: 'Xem',
  'pim.product.create': 'Tạo sản phẩm',
  'pim.product.update_draft': 'Cập nhật bản nháp sản phẩm',
  'pim.product.status_change': 'Đổi trạng thái sản phẩm',
  'pim.product.delete': 'Xóa sản phẩm',
  'pim.product.approve_create': 'Duyệt tạo sản phẩm',
  'pim.product.approve_update': 'Duyệt cập nhật sản phẩm',
  'pim.product_packaging_relation.replace': 'Cập nhật bao bì đi kèm',
  'pim.approval.request_update': 'Yêu cầu duyệt cập nhật',
  'pim.approval.submit_create': 'Gửi duyệt tạo sản phẩm',
  'pim.approval.approve': 'Phê duyệt yêu cầu',
  'pim.approval.reject': 'Từ chối yêu cầu',
  'pim.approval.cancel': 'Hủy yêu cầu duyệt',
  'pim.import.validate_batch': 'Kiểm tra import',
  'pim.import.apply_batch': 'Áp dụng import',
  'pim.import.product_create': 'Import — tạo sản phẩm',
  'pim.import.product_update': 'Import — cập nhật sản phẩm',
};

export const PRODUCT_AUDIT_LOG_VALUE_LABELS: Record<string, string> = {
  true: 'Có',
  false: 'Không',
  DRAFT: 'Bản nháp',
  UNPUBLISHED: 'Chưa xuất bản',
  PUBLISHED: 'Đang bán',
  DISCONTINUED: 'Ngừng kinh doanh',
  ARCHIVED: 'Lưu trữ',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  MERCHANDISE: 'Hàng hóa',
  PACKAGING: 'Bao bì',
  SHIPPING_PACKAGING: 'Bao bì vận chuyển',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

export const mapProductAuditFieldLabel = (fieldPath?: string): string => {
  if (!fieldPath) return '—';
  const leafField = fieldPath.split('.').pop() ?? fieldPath;
  return PRODUCT_AUDIT_LOG_FIELD_LABELS[fieldPath] ?? PRODUCT_AUDIT_LOG_FIELD_LABELS[leafField] ?? leafField;
};

export const mapProductAuditActionLabel = (action?: string): string => {
  if (!action?.trim()) return 'Cập nhật sản phẩm';
  const raw = action.trim();
  const lower = raw.toLowerCase();
  if (PRODUCT_AUDIT_LOG_ACTION_LABELS[raw]) return PRODUCT_AUDIT_LOG_ACTION_LABELS[raw];
  if (PRODUCT_AUDIT_LOG_ACTION_LABELS[lower]) return PRODUCT_AUDIT_LOG_ACTION_LABELS[lower];
  if (raw.startsWith('pim.')) {
    return raw
      .replace(/^pim\./, '')
      .replaceAll('_', ' ')
      .replaceAll('.', ' — ');
  }
  return raw;
};

export const mapProductAuditValueLabel = (raw: unknown): string | undefined => {
  if (raw == null) return undefined;
  if (typeof raw === 'boolean') {
    return PRODUCT_AUDIT_LOG_VALUE_LABELS[String(raw)] ?? (raw ? 'Có' : 'Không');
  }
  const s = String(raw).trim();
  if (!s) return undefined;
  return PRODUCT_AUDIT_LOG_VALUE_LABELS[s] ?? undefined;
};
