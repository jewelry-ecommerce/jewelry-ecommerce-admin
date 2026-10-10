import { ProductApprovalAction, ProductApprovalStatus, ProductSpuStatus } from '../../../apis/product/product.enum';
import type { ProductApprovalSummary } from '../../../apis/product/product.entities';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../common/config/runtime-config';
export const PRODUCT_SPU_DEFAULT_IMAGE_SRC = resolveTenantBrandProductDefaultImageSrc();
export const getProductApprovalStatusLabelVi = (approval?: ProductApprovalSummary | null, lifecycleStatus?: ProductSpuStatus): string => {
  if (!approval?.status) {
    return lifecycleStatus === ProductSpuStatus.DRAFT ? 'Chưa gửi duyệt' : 'Không có yêu cầu';
  }

  switch (approval.status) {
    case ProductApprovalStatus.PENDING:
      return approval.action === ProductApprovalAction.UPDATE_PRODUCT ? 'Chờ duyệt cập nhật' : 'Chờ duyệt tạo mới';
    case ProductApprovalStatus.APPROVED:
      return 'Đã duyệt';
    case ProductApprovalStatus.REJECTED:
      return 'Từ chối';
    case ProductApprovalStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return String(approval.status);
  }
};

export const getProductLifecycleStatusLabelVi = (status: ProductSpuStatus): string => {
  if (status === ProductSpuStatus.DISCONTINUED) {
    return 'Ngừng kinh doanh';
  }

  switch (status) {
    case ProductSpuStatus.DRAFT:
      return 'Bản nháp';
    case ProductSpuStatus.UNPUBLISHED:
      return 'Ngừng xuất bản';
    case ProductSpuStatus.PUBLISHED:
      return 'Xuất bản';
    case ProductSpuStatus.ARCHIVED:
      return 'Lưu trữ';
    default:
      return String(status);
  }
};
