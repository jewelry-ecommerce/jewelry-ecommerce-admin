import type { PosShiftCashTransactionType, PosShiftCloseReconStatus, PosShiftLifecycleStatus, PosShiftReconStatus } from '../../../apis/pos/pos-shift.interface';
import { pillToVariant, WMS_PILL_TRIOS } from '../../../common/constant/ware-house/wms-palette.constant';
import type { StatusPillConfig } from '../../../components/status-pill';

export const POS_SHIFT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const POS_SHIFT_DEFAULT_PAGE_SIZE = 20;

/** BE từ chối khoảng ngày kinh doanh dài hơn 93 ngày (POS_SHIFT_INVALID_DATE_RANGE). */
export const POS_SHIFT_MAX_RANGE_DAYS = 93;

/** BE giới hạn `keyword` tối đa 100 ký tự. */
export const POS_SHIFT_KEYWORD_MAX_LENGTH = 100;

/** Debounce ô tìm kiếm trên toolbar danh sách. */
export const POS_SHIFT_SEARCH_DEBOUNCE_MS = 400;

/** Mã lỗi BE khi số dòng xuất vượt giới hạn (422). */
export const POS_SHIFT_EXPORT_TOO_LARGE_CODE = 'POS_SHIFT_EXPORT_TOO_LARGE';

export const POS_SHIFT_EXPORT_SHEET_NAME = 'CaBanHang';

/** Giá trị hiển thị khi ca chưa đóng (tiền cuối ca, giờ đóng ca). */
export const POS_SHIFT_OPEN_LABEL = 'Đang mở';

/** Pill trạng thái ca đang mở (danh sách: cột ĐS Đóng; chi tiết: header). */
export const POS_SHIFT_OPEN_PILL_LABEL = 'Đang mở ca';

/** Cuối khoảng thời gian ca trên tiêu đề trang chi tiết khi ca chưa đóng. */
export const POS_SHIFT_NOW_LABEL = 'Hiện tại';

export const POS_SHIFT_SEARCH_PLACEHOLDER = 'Tìm theo tên cửa hàng, tên hoặc mã nhân viên thu ngân...';

export const POS_SHIFT_SELECT_PLACEHOLDER = 'Vui lòng chọn';

export const POS_SHIFT_RECON_LABEL: Record<PosShiftReconStatus | PosShiftCloseReconStatus, string> = {
  MATCH: 'Khớp',
  OVER: 'Thừa',
  SHORT: 'Thiếu',
  OPEN: POS_SHIFT_OPEN_LABEL,
  NONE: ' - ',
};

/** Ca đầu tiên trên máy: không có ca trước để so sánh tiền bàn giao. */
export const POS_SHIFT_FIRST_SHIFT_NOTE = 'Ca đầu tiên trên máy, không có ca trước để so sánh';

/** Pill đối soát: Khớp xanh lá, Thừa cam, Thiếu đỏ, Đang mở ca xanh dương, chưa có dữ liệu xám. */
export const POS_SHIFT_RECON_PILL_CONFIG: StatusPillConfig<PosShiftReconStatus | PosShiftCloseReconStatus> = {
  MATCH: pillToVariant(WMS_PILL_TRIOS.green, POS_SHIFT_RECON_LABEL.MATCH),
  OVER: pillToVariant(WMS_PILL_TRIOS.amber, POS_SHIFT_RECON_LABEL.OVER),
  SHORT: pillToVariant(WMS_PILL_TRIOS.red, POS_SHIFT_RECON_LABEL.SHORT),
  OPEN: pillToVariant(WMS_PILL_TRIOS.blue, POS_SHIFT_OPEN_PILL_LABEL),
  NONE: pillToVariant(WMS_PILL_TRIOS.gray, '—'),
};

/** Màu chữ số tiền chênh lệch theo trạng thái đối soát (cùng tông với pill). */
export const POS_SHIFT_RECON_AMOUNT_COLOR: Record<PosShiftReconStatus | PosShiftCloseReconStatus, string> = {
  MATCH: WMS_PILL_TRIOS.green.text,
  OVER: WMS_PILL_TRIOS.amber.text,
  SHORT: WMS_PILL_TRIOS.red.text,
  OPEN: '#101828',
  NONE: '#101828',
};

/** Header trang chi tiết: ca Open/Closing = "Đang mở ca", ca Closed = "Đã đóng ca". */
export const POS_SHIFT_LIFECYCLE_LABEL: Record<PosShiftLifecycleStatus, string> = {
  OPEN: POS_SHIFT_OPEN_PILL_LABEL,
  CLOSING: POS_SHIFT_OPEN_PILL_LABEL,
  CLOSED: 'Đã đóng ca',
};

export const POS_SHIFT_LIFECYCLE_PILL_CONFIG: StatusPillConfig<PosShiftLifecycleStatus> = {
  OPEN: pillToVariant(WMS_PILL_TRIOS.blue, POS_SHIFT_LIFECYCLE_LABEL.OPEN),
  CLOSING: pillToVariant(WMS_PILL_TRIOS.blue, POS_SHIFT_LIFECYCLE_LABEL.CLOSING),
  CLOSED: pillToVariant(WMS_PILL_TRIOS.gray, POS_SHIFT_LIFECYCLE_LABEL.CLOSED),
};

/** Lựa chọn trạng thái đối soát trong bộ lọc (chọn nhiều; không chọn = tất cả). */
export const POS_SHIFT_OPEN_RECON_FILTER_OPTIONS: Array<{ value: Exclude<PosShiftReconStatus, 'NONE'>; label: string }> = [
  { value: 'MATCH', label: POS_SHIFT_RECON_LABEL.MATCH },
  { value: 'OVER', label: POS_SHIFT_RECON_LABEL.OVER },
  { value: 'SHORT', label: POS_SHIFT_RECON_LABEL.SHORT },
];

export const POS_SHIFT_CLOSE_RECON_FILTER_OPTIONS: Array<{ value: PosShiftCloseReconStatus; label: string }> = [
  { value: 'MATCH', label: POS_SHIFT_RECON_LABEL.MATCH },
  { value: 'OVER', label: POS_SHIFT_RECON_LABEL.OVER },
  { value: 'SHORT', label: POS_SHIFT_RECON_LABEL.SHORT },
  { value: 'OPEN', label: POS_SHIFT_OPEN_PILL_LABEL },
];

/**
 * Phương thức thanh toán đang mở trên POS — BE luôn liệt kê theo đúng thứ tự này (kể cả = 0) rồi mới tới các mã khác
 * có phát sinh trong ca, theo alphabet (`sortPaymentMethods` ở pos-service). Nhãn là nhãn BE trả về, dùng cho tiêu đề cột Excel.
 */
export const POS_SHIFT_POS_PAYMENT_METHODS: ReadonlyArray<{ method: string; label: string }> = [
  { method: 'CASH', label: 'Tiền mặt' },
  { method: 'QR_CODE', label: 'QR Code' },
  { method: 'CARD_POS_PAYOO', label: 'Thẻ / Chạm POS Payoo' },
];

/** Nhãn hiển thị phương thức thanh toán trên trang chi tiết (mã khác dùng nhãn BE trả về). */
export const POS_SHIFT_PAYMENT_METHOD_DISPLAY_LABEL: Readonly<Record<string, string>> = {
  CASH: 'Tiền mặt',
  MOMO_WALLET: 'Momo',
  CREDIT_CARD: 'Thẻ ngân hàng',
  APPLE_PAY: 'ApplePay',
  QR_CODE: 'Quét mã QR',
  ZALO_PAY: 'ZaloPay',
  CARD_POS_PAYOO: 'Thẻ / Chạm',
};

export const POS_SHIFT_CASH_TRANSACTION_PILL_CONFIG: StatusPillConfig<PosShiftCashTransactionType> = {
  CASH_IN: pillToVariant(WMS_PILL_TRIOS.green, 'Nộp tiền'),
  CASH_OUT: pillToVariant(WMS_PILL_TRIOS.red, 'Rút tiền'),
};

export const POS_SHIFT_CASH_TRANSACTION_AMOUNT_COLOR: Record<PosShiftCashTransactionType, string> = {
  CASH_IN: WMS_PILL_TRIOS.green.text,
  CASH_OUT: WMS_PILL_TRIOS.red.text,
};

export const POS_SHIFT_CASH_TRANSACTION_EMPTY = 'Chưa có giao dịch nộp/rút tiền mặt trong ca';
