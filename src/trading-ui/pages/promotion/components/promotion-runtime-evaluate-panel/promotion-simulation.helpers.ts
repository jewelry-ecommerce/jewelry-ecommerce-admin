import {
  PromotionSimulationConflictOutcome,
  PromotionSimulationSourceType,
  RUNTIME_EVALUATE_REASON_CODE,
  type PromotionDraftSimulationResponseDto,
  type RuntimeEvaluateResponseDto,
} from '../../../../apis';

const SUCCESS_REASON_CODES = new Set<string>([
  RUNTIME_EVALUATE_REASON_CODE.CANDIDATE_INDEX_MATCHED,
  RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_ALL_PASSED,
  RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_CUSTOMER_SEGMENT_PASSED,
  RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_MANUAL_CUSTOMER_PASSED,
  RUNTIME_EVALUATE_REASON_CODE.TARGET_ALL_MATCHED,
  RUNTIME_EVALUATE_REASON_CODE.TARGET_MANUAL_MATCHED,
  RUNTIME_EVALUATE_REASON_CODE.TARGET_CATEGORY_MATCHED,
  RUNTIME_EVALUATE_REASON_CODE.TARGET_COLLECTION_MATCHED,
  RUNTIME_EVALUATE_REASON_CODE.CONDITION_ALWAYS_PASSED,
  RUNTIME_EVALUATE_REASON_CODE.BENEFIT_MARKDOWN_APPLIED,
  RUNTIME_EVALUATE_REASON_CODE.BENEFIT_FLAT_PRICE_APPLIED,
  RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_SELECTED,
]);

const REASON_CODE_LABELS: Readonly<Record<string, string>> = {
  [RUNTIME_EVALUATE_REASON_CODE.CANDIDATE_INDEX_MATCHED]: 'Tìm thấy ưu đãi phù hợp phạm vi tra cứu',
  [RUNTIME_EVALUATE_REASON_CODE.CANDIDATE_DEDUPED]: 'Ứng viên trùng đã được gộp',
  [RUNTIME_EVALUATE_REASON_CODE.NO_INDEX_MATCH]: 'Không tìm thấy ưu đãi phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_ALL_PASSED]: 'Đối tượng khách hàng phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_CUSTOMER_SEGMENT_PASSED]: 'Phân khúc khách hàng phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_CUSTOMER_SEGMENT_NO_MATCH]: 'Không thuộc phân khúc áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_CUSTOMER_SEGMENT_MISSING_DATA]: 'Thiếu thông tin phân khúc khách hàng',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_MANUAL_CUSTOMER_PASSED]: 'Khách hàng nằm trong danh sách áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_MANUAL_CUSTOMER_NO_MATCH]: 'Khách hàng không nằm trong danh sách áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_MANUAL_CUSTOMER_MISSING_CUSTOMER_ID]: 'Thiếu mã khách hàng',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_UPLOAD_FILE_UNSUPPORTED]: 'Audience import file chưa hỗ trợ runtime',
  [RUNTIME_EVALUATE_REASON_CODE.AUDIENCE_UNSUPPORTED_TYPE]: 'Loại đối tượng khách hàng chưa hỗ trợ',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_ALL_MATCHED]: 'Sản phẩm thuộc phạm vi áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_MANUAL_MATCHED]: 'Biến thể thuộc danh sách áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_MANUAL_NO_MATCH]: 'Biến thể không thuộc danh sách áp dụng',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_CATEGORY_MATCHED]: 'Danh mục sản phẩm phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_CATEGORY_NO_MATCH]: 'Danh mục sản phẩm không phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_COLLECTION_MATCHED]: 'Bộ sưu tập sản phẩm phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_COLLECTION_NO_MATCH]: 'Bộ sưu tập sản phẩm không phù hợp',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_UPLOAD_FILE_UNSUPPORTED]: 'Target import file chưa hỗ trợ runtime',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_UNSUPPORTED_TYPE]: 'Loại phạm vi sản phẩm chưa hỗ trợ',
  [RUNTIME_EVALUATE_REASON_CODE.TARGET_LINE_FILTERED_EXISTING_PROMOTION]: 'Dòng hàng đã có khuyến mãi nên bị loại',
  [RUNTIME_EVALUATE_REASON_CODE.CONDITION_ALWAYS_PASSED]: 'Điều kiện áp dụng đạt',
  [RUNTIME_EVALUATE_REASON_CODE.CONDITION_UNSUPPORTED_TYPE]: 'Loại điều kiện chưa hỗ trợ',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_MARKDOWN_APPLIED]: 'Đã tính giảm giá trực tiếp',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_MARKDOWN_UNSUPPORTED_SCOPE]: 'Giảm giá trực tiếp chưa hỗ trợ phạm vi này',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_MARKDOWN_UNSUPPORTED_DISCOUNT_KIND]: 'Hình thức giảm giá trực tiếp chưa hỗ trợ',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_FLAT_PRICE_APPLIED]: 'Đã tính đồng giá',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_FLAT_PRICE_UNSUPPORTED_SCOPE]: 'Đồng giá chưa hỗ trợ phạm vi này',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_UNSUPPORTED_TYPE]: 'Loại ưu đãi chưa hỗ trợ runtime',
  [RUNTIME_EVALUATE_REASON_CODE.BENEFIT_NO_DISCOUNT_PRODUCED]: 'Ưu đãi không tạo ra giảm giá',
  [RUNTIME_EVALUATE_REASON_CODE.SNAPSHOT_NOT_FOUND]: 'Không tìm thấy snapshot đã xuất bản',
  [RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_SELECTED]: 'Được chọn áp dụng cho dòng hàng',
  [RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_REJECTED_BY_COMPATIBILITY]: 'Bị loại do quy tắc áp dụng đồng thời',
  [RUNTIME_EVALUATE_REASON_CODE.UNKNOWN]: 'Không xác định',
  PROMOTION_VOUCHER_CODE_DISABLED: 'Mã voucher đã bị tắt',
  PROMOTION_VOUCHER_CODE_REDEEMED: 'Mã voucher đã được sử dụng',
  PROMOTION_VOUCHER_CODE_EXPIRED: 'Mã voucher đã hết hạn',
  PROMOTION_VOUCHER_PROMOTION_NOT_ACTIVE: 'Voucher chưa trong thời gian áp dụng tại thời điểm giả lập',
  PROMOTION_VOUCHER_SCHEMA_DISABLED: 'Hình thức voucher đang bị tắt',
  DRAFT_OUTSIDE_EFFECTIVE_WINDOW: 'Draft nằm ngoài thời gian hiệu lực',
  DRAFT_NO_CANDIDATE_MATCH: 'Draft không tạo candidate phù hợp',
  DRAFT_VOUCHER_NOT_SELECTED: 'Voucher draft chưa được chọn',
  DRAFT_ADJUSTMENT_SELECTED: 'Ưu đãi draft được chọn',
  DRAFT_ADJUSTMENT_REJECTED: 'Ưu đãi draft bị loại',
};

const SCOPE_LABELS: Readonly<Record<string, string>> = {
  SKU_ITEM: 'Biến thể',
  LINE_ITEM: 'Dòng hàng',
  CART: 'Giỏ hàng',
  SHIPPING: 'Phí vận chuyển',
  PAYMENT: 'Thanh toán',
};

const SCHEMA_TYPE_LABELS: Readonly<Record<string, string>> = {
  MARKDOWN: 'Giảm giá trực tiếp',
  FLAT_PRICE: 'Đồng giá',
  VOUCHER: 'Voucher/Coupon/Code',
};

const SIMULATION_SOURCE_LABELS: Readonly<Record<PromotionSimulationSourceType, string>> = {
  [PromotionSimulationSourceType.PUBLISHED]: 'Đã xuất bản',
  [PromotionSimulationSourceType.DRAFT]: 'Draft đang giả lập',
};

const SIMULATION_OUTCOME_LABELS: Readonly<Record<PromotionSimulationConflictOutcome, string>> = {
  [PromotionSimulationConflictOutcome.DRAFT_REPLACES_PUBLISHED]: 'Draft thắng promotion đã xuất bản',
  [PromotionSimulationConflictOutcome.PUBLISHED_BLOCKS_DRAFT]: 'Promotion đã xuất bản chặn draft',
  [PromotionSimulationConflictOutcome.DRAFT_VOUCHER_WINS]: 'Voucher draft thắng',
  [PromotionSimulationConflictOutcome.PUBLISHED_VOUCHER_WINS]: 'Voucher đã xuất bản thắng',
  [PromotionSimulationConflictOutcome.DRAFT_STACKS]: 'Draft được cộng dồn',
  [PromotionSimulationConflictOutcome.DRAFT_ADDS_DISCOUNT]: 'Draft tạo thêm giảm giá',
  [PromotionSimulationConflictOutcome.DRAFT_NO_EFFECT]: 'Draft không tạo thay đổi',
};

export function isSuccessCode(code: string): boolean {
  return SUCCESS_REASON_CODES.has(code);
}

export function formatMinorAmount(minor: string): string {
  try {
    const num = parseInt(minor, 10);
    if (isNaN(num)) return minor;
    return num.toLocaleString('vi-VN');
  } catch {
    return minor;
  }
}

export function formatVnd(minor: string): string {
  return `${formatMinorAmount(minor)}đ`;
}

export function formatSignedVnd(minor: string): string {
  const value = parseInt(minor, 10);
  if (isNaN(value) || value === 0) return formatVnd(minor);
  return value > 0 ? `+${formatVnd(minor)}` : `-${formatVnd(String(Math.abs(value)))}`;
}

export function parseMinorInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '0';
  return digits.replace(/^0+(?=\d)/, '');
}

export function getReasonCodeLabel(code: string): string {
  return REASON_CODE_LABELS[code] ?? code.replace(/_/g, ' ');
}

export function getScopeLabel(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export function getSchemaTypeLabel(schemaType: string): string {
  return SCHEMA_TYPE_LABELS[schemaType] ?? schemaType;
}

export function getSimulationSourceLabel(sourceType: PromotionSimulationSourceType | null): string {
  return sourceType ? (SIMULATION_SOURCE_LABELS[sourceType] ?? sourceType) : 'Không xác định';
}

export function getSimulationOutcomeLabel(outcome: PromotionSimulationConflictOutcome): string {
  return SIMULATION_OUTCOME_LABELS[outcome] ?? outcome;
}

export function isPromotionDraftSimulationResponse(result: RuntimeEvaluateResponseDto): result is PromotionDraftSimulationResponseDto {
  return 'simulation' in result;
}

export function computeLineSubtotal(quantity: number, unitPriceMinor: string): string {
  const price = parseInt(unitPriceMinor, 10);
  if (isNaN(price) || price <= 0) return '0';
  return String(quantity * price);
}

export function sumLinesSubtotal(lines: ReadonlyArray<{ quantity: number; unitPriceMinor: string }>): number {
  return lines.reduce((sum, line) => {
    const qty = Math.max(1, line.quantity);
    const price = parseInt(line.unitPriceMinor, 10);
    return sum + (isNaN(price) ? 0 : qty * price);
  }, 0);
}
