import {
  getReasonCodeLabel as getBaseReasonCodeLabel,
  getSimulationOutcomeLabel as getBaseSimulationOutcomeLabel,
  getSimulationSourceLabel as getBaseSimulationSourceLabel,
} from '../components/promotion-runtime-evaluate-panel/promotion-simulation.helpers';

const SANDBOX_REASON_OVERRIDES: Readonly<Record<string, string>> = {
  TARGET_UPLOAD_FILE_UNSUPPORTED: 'Chưa hỗ trợ lọc sản phẩm theo file tải lên',
  BENEFIT_UNSUPPORTED_TYPE: 'Loại ưu đãi chưa được hỗ trợ trong giả lập',
  CANDIDATE_DEDUPED: 'Ưu đãi trùng đã được gộp',
  DRAFT_OUTSIDE_EFFECTIVE_WINDOW: 'Chương trình nháp nằm ngoài thời gian hiệu lực',
  DRAFT_NO_CANDIDATE_MATCH: 'Chương trình nháp không có ưu đãi phù hợp',
  DRAFT_VOUCHER_NOT_SELECTED: 'Chưa chọn voucher của chương trình nháp',
  DRAFT_ADJUSTMENT_SELECTED: 'Ưu đãi chương trình nháp được áp dụng',
  DRAFT_ADJUSTMENT_REJECTED: 'Ưu đãi chương trình nháp bị loại',
  PROMOTION_VOUCHER_SCHEMA_DISABLED: 'Hình thức voucher đang bị tắt',
};

const SANDBOX_SOURCE_OVERRIDES: Readonly<Record<string, string>> = {
  DRAFT: 'Chương trình nháp',
  PUBLISHED: 'Đang phát hành',
};

const SANDBOX_OUTCOME_OVERRIDES: Readonly<Record<string, string>> = {
  DRAFT_REPLACES_PUBLISHED: 'Chương trình nháp thay thế chương trình đang phát hành',
  PUBLISHED_BLOCKS_DRAFT: 'Chương trình đang phát hành chặn chương trình nháp',
  DRAFT_VOUCHER_WINS: 'Voucher chương trình nháp được ưu tiên',
  PUBLISHED_VOUCHER_WINS: 'Voucher đang phát hành được ưu tiên',
  DRAFT_STACKS: 'Chương trình nháp được cộng dồn',
  DRAFT_ADDS_DISCOUNT: 'Chương trình nháp tạo thêm giảm giá',
  DRAFT_NO_EFFECT: 'Chương trình nháp không thay đổi giá',
};

export const getSandboxReasonCodeLabel = (code: string): string => SANDBOX_REASON_OVERRIDES[code] ?? getBaseReasonCodeLabel(code);

export const getSandboxSimulationSourceLabel = (sourceType: string | null): string => {
  if (!sourceType) return 'Không xác định';
  return SANDBOX_SOURCE_OVERRIDES[sourceType] ?? getBaseSimulationSourceLabel(sourceType as never);
};

export const getSandboxSimulationOutcomeLabel = (outcome: string): string => SANDBOX_OUTCOME_OVERRIDES[outcome] ?? getBaseSimulationOutcomeLabel(outcome as never);
