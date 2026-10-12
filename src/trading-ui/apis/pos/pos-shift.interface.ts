/**
 * Kiểu dữ liệu màn Admin — Quản lý ca bán POS (US-S05).
 * Khớp contract pos-service `admin/pos-shifts` (X-Report v1 + AdminShiftRow).
 */

/** Trạng thái vòng đời ca: CLOSING = ca Open đang đối soát đóng ca. */
export type PosShiftLifecycleStatus = 'OPEN' | 'CLOSING' | 'CLOSED';

/** Trạng thái đối soát theo chênh lệch: NONE = không có dữ liệu so sánh (ca đầu tiên). */
export type PosShiftReconStatus = 'MATCH' | 'OVER' | 'SHORT' | 'NONE';

/** Đối soát đóng ca trên danh sách: OPEN = ca chưa chốt (⏳ Đang mở). */
export type PosShiftCloseReconStatus = 'MATCH' | 'OVER' | 'SHORT' | 'OPEN';

export interface PosShiftRevenueByMethod {
  method: string;
  label: string;
  orderCount: number;
  amount: number;
}

export interface PosShiftXReportShift {
  id: string;
  tenantCode: string | null;
  warehouseId: string;
  warehouseName: string | null;
  terminalCode: string;
  deviceId: string | null;
  deviceName: string | null;
  businessDate: string | null;
  openedAt: string;
  closedAt: string | null;
  lifecycleStatus: PosShiftLifecycleStatus;
  cashierId: string;
  cashierName: string | null;
  cashierCode: string | null;
}

export interface PosShiftXReportOpening {
  previousShiftId: string | null;
  handoverExpectedAmount: number | null;
  openingFloat: number;
  handoverVariance: number | null;
  reconStatus: PosShiftReconStatus;
  handoverReason: string | null;
  approvedByManagerId: string | null;
  approvedAt: string | null;
}

export interface PosShiftXReportOrders {
  paidCount: number;
  refundedCount: number;
  cancelledCount: number;
  cancelledAfterPaidCount: number;
  cancelledAfterPaidAmount: number;
  cancelledAfterPaidCashAmount: number;
  pendingCount: number;
}

export interface PosShiftXReportRevenue {
  total: number;
  byMethod: PosShiftRevenueByMethod[];
}

export interface PosShiftXReportCashDrawer {
  openingFloat: number;
  cashSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
}

export interface PosShiftXReportClosing {
  actualCash: number;
  expectedCash: number;
  variance: number;
  reconStatus: Exclude<PosShiftReconStatus, 'NONE'>;
  varianceReason: string | null;
  /** Thu ngân giữ ca tự xác nhận chênh lệch bằng mật khẩu của mình (không cần Cửa hàng trưởng). */
  confirmedById: string | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  /** Bàn giao tiền mặt cuối ca (BRD S03 v2.0 AC6) — không có ở ca chốt trước đó. */
  handoverAmount?: number | null;
  retainedCash?: number | null;
}

/** X-Report v1 — payload bất biến lưu khi chốt ca; `closing` chỉ có khi CLOSED. */
export interface PosShiftXReportV1 {
  version: 1;
  generatedAt: string;
  shift: PosShiftXReportShift;
  opening: PosShiftXReportOpening;
  orders: PosShiftXReportOrders;
  revenue: PosShiftXReportRevenue;
  cashDrawer: PosShiftXReportCashDrawer;
  closing: PosShiftXReportClosing | null;
}

/** Loại giao dịch tiền mặt trong ca: nộp thêm vào két / rút tiền khỏi két. */
export type PosShiftCashTransactionType = 'CASH_IN' | 'CASH_OUT';

/** Một lần nộp/rút tiền mặt trong ca (`PosShiftAdminDetail.cashTransactions`). */
export interface PosShiftCashTransaction {
  type: PosShiftCashTransactionType;
  occurredAt: string;
  amount: number;
  reason: string | null;
  actorName: string | null;
  actorCode: string | null;
  /** Phiếu rút két "Bàn giao tiền cuối ca" do hệ thống tự ghi khi chốt ca. */
  automatic?: boolean;
}

/**
 * Chi tiết ca trả về cho admin: ca đóng lấy payload, ca mở tính trực tiếp.
 * Khi OMS lỗi (`liveUnavailable`), các khối số liệu đơn/doanh thu/két có thể null.
 */
export type PosShiftAdminDetail = Omit<PosShiftXReportV1, 'orders' | 'revenue' | 'cashDrawer'> & {
  orders: PosShiftXReportOrders | null;
  revenue: PosShiftXReportRevenue | null;
  cashDrawer: PosShiftXReportCashDrawer | null;
  liveUnavailable?: boolean;
  /** Lịch sử nộp/rút tiền mặt của ca, kể cả phiếu bàn giao cuối ca tự động. */
  cashTransactions?: PosShiftCashTransaction[] | null;
};

export interface PosShiftAdminRow {
  shiftId: string;
  warehouseId: string;
  warehouseName: string | null;
  terminalCode: string;
  deviceId: string | null;
  deviceName: string | null;
  businessDate: string;
  openedAt: string;
  closedAt: string | null;
  lifecycleStatus: PosShiftLifecycleStatus;
  cashierId: string;
  cashierName: string | null;
  cashierCode: string | null;
  openReconStatus: PosShiftReconStatus;
  openingVariance: number | null;
  openingVarianceReason: string | null;
  closeReconStatus: PosShiftCloseReconStatus;
  closingVariance: number | null;
  closingVarianceReason: string | null;
  openingFloat: number;
  cashIn: number;
  cashOut: number;
  revenue: number | null;
  cashRevenue: number | null;
  revenueByMethod: PosShiftRevenueByMethod[] | null;
  expectedCash: number | null;
  actualCash: number | null;
  /** Tiền nộp công ty / giữ lại két khi chốt ca (null: ca chưa chốt hoặc chốt trước BRD v2.0). */
  handoverAmount?: number | null;
  retainedCash?: number | null;
  liveUnavailable: boolean;
}

/** Body lọc — ngày kinh doanh dạng `YYYY-MM-DD`, tối đa 93 ngày. */
export interface PosShiftAdminFilterDto {
  businessDateFrom: string;
  businessDateTo: string;
  warehouseIds?: string[];
  deviceIds?: string[];
  openReconStatuses?: PosShiftReconStatus[];
  closeReconStatuses?: PosShiftCloseReconStatus[];
  cashierKeyword?: string;
  /** Ô tìm kiếm: tên cửa hàng, tên/mã thu ngân, mã máy POS (tối đa 100 ký tự). */
  keyword?: string;
  page?: number;
  take?: number;
}

export type PosShiftAdminExportDto = Omit<PosShiftAdminFilterDto, 'page' | 'take'>;

export interface PosShiftAdminListResponse {
  total: number;
  page: number;
  take: number;
  list: PosShiftAdminRow[];
}

export interface PosShiftPaymentMethodColumn {
  method: string;
  label: string;
}

export interface PosShiftAdminExportResponse {
  total: number;
  paymentMethods: PosShiftPaymentMethodColumn[];
  rows: PosShiftAdminRow[];
}

/** Máy POS theo cửa hàng — gồm cả máy đã xóa mềm (vẫn còn ca lịch sử). */
export interface PosShiftDeviceOption {
  deviceId: string;
  warehouseId: string;
  terminalCode: string;
  name: string;
  status: string;
  deleted: boolean;
}
