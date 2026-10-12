import type { StatusPillConfig } from '../../../components/status-pill';
import { PreOrderOrderStatus } from '../../../apis/pre-order-order';

export const PRE_ORDER_ORDER_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

/** Placeholder ô tìm kiếm nhanh (mã đơn / SĐT / tên SP · SKU). */
export const PRE_ORDER_ORDER_SEARCH_PLACEHOLDER = 'Tìm theo mã đơn hàng, SĐT khách hàng, tên sản phẩm / SKU...';

export const PRE_ORDER_ORDER_STATUS_LABELS: Record<PreOrderOrderStatus, string> = {
  [PreOrderOrderStatus.DRAFT]: 'Nháp',
  [PreOrderOrderStatus.PRE_ORDERED]: 'Đặt trước',
  [PreOrderOrderStatus.STOCK_AVAILABLE]: 'Đã có hàng',
  [PreOrderOrderStatus.ZNS_FAILED]: 'Gửi ZNS lỗi',
  [PreOrderOrderStatus.AWAITING_PAYMENT]: 'Chờ thanh toán',
  [PreOrderOrderStatus.CONVERTED]: 'Thành công',
  [PreOrderOrderStatus.CANCELLED]: 'Đã hủy',
  [PreOrderOrderStatus.EXPIRED]: 'Hết hạn',
};

/** Thứ tự tab list (theo AC + đầy đủ enum BE). Tab Nháp không hiển thị. */
export const PRE_ORDER_ORDER_STATUS_TAB_ORDER: PreOrderOrderStatus[] = [
  PreOrderOrderStatus.PRE_ORDERED,
  PreOrderOrderStatus.STOCK_AVAILABLE,
  PreOrderOrderStatus.AWAITING_PAYMENT,
  PreOrderOrderStatus.ZNS_FAILED,
  PreOrderOrderStatus.CONVERTED,
  PreOrderOrderStatus.CANCELLED,
  PreOrderOrderStatus.EXPIRED,
];

/** 6 trạng thái chuẩn dùng cho bộ lọc multiselect danh sách đơn đặt trước. */
export const PRE_ORDER_ORDER_FILTER_STATUSES: PreOrderOrderStatus[] = [
  PreOrderOrderStatus.PRE_ORDERED,
  PreOrderOrderStatus.STOCK_AVAILABLE,
  PreOrderOrderStatus.AWAITING_PAYMENT,
  PreOrderOrderStatus.ZNS_FAILED,
  PreOrderOrderStatus.CONVERTED,
  PreOrderOrderStatus.CANCELLED,
];

export type PreOrderOrderStatusTab = 'all' | PreOrderOrderStatus;

export const PRE_ORDER_ORDER_STATUS_PILL_CONFIG: StatusPillConfig<PreOrderOrderStatus> = {
  [PreOrderOrderStatus.DRAFT]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.DRAFT],
    color: '#344054',
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
  },
  [PreOrderOrderStatus.PRE_ORDERED]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.PRE_ORDERED],
    color: '#B54708',
    backgroundColor: '#FFFAEB',
    borderColor: '#FDE68A',
  },
  [PreOrderOrderStatus.STOCK_AVAILABLE]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.STOCK_AVAILABLE],
    color: '#155EEF',
    backgroundColor: '#EFF8FF',
    borderColor: '#B2DDFF',
  },
  [PreOrderOrderStatus.AWAITING_PAYMENT]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.AWAITING_PAYMENT],
    color: '#C11574',
    backgroundColor: '#FDF2FA',
    borderColor: '#FCCEEE',
  },
  [PreOrderOrderStatus.ZNS_FAILED]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.ZNS_FAILED],
    color: '#B42318',
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
  },
  [PreOrderOrderStatus.CONVERTED]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.CONVERTED],
    color: '#027A48',
    backgroundColor: '#ECFDF3',
    borderColor: '#ABEFC6',
  },
  [PreOrderOrderStatus.CANCELLED]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.CANCELLED],
    color: '#344054',
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
  },
  [PreOrderOrderStatus.EXPIRED]: {
    label: PRE_ORDER_ORDER_STATUS_LABELS[PreOrderOrderStatus.EXPIRED],
    color: '#B54708',
    backgroundColor: '#FFFAEB',
    borderColor: '#FDE68A',
  },
};

export const getPreOrderOrderStatusLabel = (status: string | null | undefined): string => {
  if (!status) return '—';
  if (Object.prototype.hasOwnProperty.call(PRE_ORDER_ORDER_STATUS_LABELS, status)) {
    return PRE_ORDER_ORDER_STATUS_LABELS[status as PreOrderOrderStatus];
  }
  return status;
};
