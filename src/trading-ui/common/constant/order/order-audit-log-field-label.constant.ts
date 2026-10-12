export const ORDER_AUDIT_LOG_FIELD_LABELS: Record<string, string> = {
  updatedAt: 'Thời gian cập nhật',
  createdAt: 'Thời gian tạo',
  confirmedAt: 'Thời gian xác nhận',
  packedAt: 'Thời gian đóng gói',
  shippedAt: 'Thời gian gửi hàng',
  deliveredAt: 'Thời gian giao thành công',
  completedAt: 'Thời gian hoàn thành',
  cancelledAt: 'Thời gian hủy',
  paidAt: 'Thời gian thanh toán',
  paymentFailedAt: 'Thời gian thanh toán thất bại',
  orderExpiresAt: 'Hạn thanh toán',
  estimatedDeliveryAt: 'Thời gian giao dự kiến',
  invoiceCreatedAt: 'Thời gian xuất hóa đơn',
  grandTotal: 'Tổng tiền',
  subtotal: 'Tạm tính',
  shippingFee: 'Phí vận chuyển',
  discountTotal: 'Giảm giá',
  taxTotal: 'Tiền thuế',
  declaredValueFee: 'Phí khai giá',
  amountReceived: 'Số tiền đã nhận',
  codAmount: 'Tiền thu hộ (COD)',
  paymentStatus: 'Trạng thái thanh toán',
  paymentMethod: 'Phương thức thanh toán',
  paymentTransactionId: 'Mã giao dịch',
  paymentRetryCount: 'Số lần thanh toán lại',
  currentPaymentId: 'Giao dịch thanh toán hiện tại (ID)',
  invoiceCreated: 'Đã xuất hóa đơn',
  orderCode: 'Mã đơn hàng',
  contactEmail: 'Email',
  customerId: 'Khách hàng (ID)',
  customerType: 'Loại khách hàng',
  warehouseId: 'Kho/Cửa hàng (ID)',
  warehouseName: 'Kho/Cửa hàng',
  cashierId: 'Thu ngân (ID)',
  cashierName: 'Thu ngân',
  salespersonId: 'Nhân viên tư vấn (ID)',
  salespersonName: 'Nhân viên tư vấn',
  shiftId: 'Ca làm việc (ID)',
  terminalCode: 'Máy POS',
  pickupAddressSnapshot: 'Địa chỉ kho giao/nhận',
  shippingAddressSnapshot: 'Địa chỉ nhận hàng',
  shippingFeePayer: 'Bên trả phí vận chuyển',
  isAllowCheck: 'Cho xem hàng',
  vatInvoice: 'Thông tin xuất hóa đơn VAT',
  items: 'Sản phẩm',
  promotions: 'Khuyến mãi',
  points: 'Điểm',
  sortCode: 'Mã phân loại',
  rootOrderId: 'Đơn gốc (ID)',
  chainExchangeCount: 'Số lần đổi hàng',
  orderReturnCode: 'Mã đổi trả',
  orderReturnReason: 'Lý do đổi trả',
  orderReturnTrackingCode: 'Mã vận đơn đổi trả',
  status: 'Trạng thái đơn hàng',
  orderStatus: 'Trạng thái đơn hàng',
  purpose: 'Loại đơn',
  source: 'Nguồn đơn hàng',
  orderKind: 'Loại đơn (hệ thống)',
  receiverPhone: 'Số điện thoại nhận hàng',
  firstName: 'Họ và tên',
  lastName: 'Tên',
  addressLine: 'Địa chỉ',
  wardName: 'Phường/Xã',
  provinceName: 'Tỉnh/Thành phố',
  carrierServiceId: 'Dịch vụ vận chuyển',
  shippingMethod: 'Phương thức giao hàng',
  shippingCarrier: 'Đơn vị vận chuyển',
  note: 'Ghi chú',
  notePayment: 'Ghi chú thanh toán',
  trackingCode: 'Mã vận đơn',
  metadata: 'Thông tin kèm theo',
  errorLog: 'Nhật ký lỗi',
  isDataValid: 'Dữ liệu hợp lệ',
  shipment: 'Vận chuyển',
  shipmentCreationRetry: 'Thử tạo vận đơn lại',
  attempts: 'Số lần thử',
  lastError: 'Lỗi gần nhất',
  lastAttemptAt: 'Lần thử gần nhất',
  noFurtherRetries: 'Không thử lại',
  recall: 'Thu hồi đơn',
  fromKind: 'Loại đơn trước thu hồi',
  fromStatus: 'Trạng thái trước thu hồi',
  recalledAt: 'Thời điểm thu hồi',
  recalledById: 'Người thực hiện thu hồi (ID)',
  proposalStatus: 'Trạng thái đề xuất hoàn tiền',
  sourceType: 'Nguồn yêu cầu hoàn tiền',
  reason: 'Lý do hoàn tiền',
  originalPaymentMethod: 'Phương thức hoàn tiền',
  paymentChannel: 'Phương thức hoàn tiền',
  totalRefundAmount: 'Số tiền hoàn',
  estimatedTotalRefundAmount: 'Số tiền hoàn dự kiến',
  netPaidAmount: 'Số tiền thực thu',
  bankAccountHolder: 'Chủ tài khoản',
  bankAccountNumber: 'Số tài khoản',
  bankName: 'Ngân hàng',
  bankBranch: 'Chi nhánh',
  detailNote: 'Lý do chi tiết',
  originalOrderCode: 'Mã đơn gốc',
  originalOrderId: 'ID đơn gốc',
  sourceId: 'ID nguồn',
  sourceDisplayCode: 'Mã nguồn',
  paymentRefundId: 'Mã giao dịch hoàn tiền',
  totalExpectedQuantity: 'Tổng số lượng dự kiến',
  forceCloseReason: 'Lý do đóng bắt buộc',
  remainingQuantityOnClose: 'Số lượng còn lại khi đóng',
  isDeleted: 'Đã xóa',
};

export const ORDER_AUDIT_LOG_ACTION_LABELS: Record<string, string> = {
  update: 'Cập nhật',
  create: 'Tạo',
  delete: 'Xóa dữ liệu',
  CreateOrder: 'Tạo',
  UpdateOrder: 'Cập nhật',
  ValidateAddress: 'Kiểm tra địa chỉ',
  ConfirmOrder: 'Xác nhận đơn',
  UpdatePayment: 'Cập nhật thanh toán',
  UpdateSku: 'Sửa SKU',
  CancelOrder: 'Hủy',
  RecallOrder: 'Tạo lệnh thu hồi',
  CreateRefundProposal: 'Tạo đề xuất hoàn tiền',
  UpdateRefundProposal: 'Cập nhật đề xuất hoàn tiền',
  ApproveRefundProposal: 'Duyệt đề xuất hoàn tiền',
  RejectRefundProposal: 'Từ chối đề xuất hoàn tiền',
  ExecutePaymentRefund: 'Thực hiện hoàn tiền',
};

export const mapOrderAuditFieldLabel = (fieldPath?: string): string => {
  if (!fieldPath) return '—';
  const leafField = fieldPath.split('.').pop() ?? fieldPath;
  return ORDER_AUDIT_LOG_FIELD_LABELS[fieldPath] ?? ORDER_AUDIT_LOG_FIELD_LABELS[leafField] ?? leafField;
};

export const mapOrderAuditActionLabel = (action?: string): string => {
  if (!action?.trim()) return 'Cập nhật đơn hàng';
  const raw = action.trim();
  const lower = raw.toLowerCase();
  return ORDER_AUDIT_LOG_ACTION_LABELS[raw] ?? ORDER_AUDIT_LOG_ACTION_LABELS[lower] ?? raw;
};

/** Giá trị audit từ BE (enum / message) — hiển thị tiếng Việt. */
export const ORDER_AUDIT_LOG_VALUE_LABELS: Record<string, string> = {
  'To address conflict': 'Xung đột địa chỉ giao hàng',
  'From address conflict': 'Xung đột địa chỉ lấy hàng',
  true: 'Có',
  false: 'Không',
};

export const mapOrderAuditValueLabel = (raw: unknown): string | undefined => {
  if (raw == null) return undefined;
  if (typeof raw === 'boolean') {
    return ORDER_AUDIT_LOG_VALUE_LABELS[String(raw)] ?? (raw ? 'Có' : 'Không');
  }
  const s = String(raw).trim();
  if (!s) return undefined;
  return ORDER_AUDIT_LOG_VALUE_LABELS[s] ?? undefined;
};
