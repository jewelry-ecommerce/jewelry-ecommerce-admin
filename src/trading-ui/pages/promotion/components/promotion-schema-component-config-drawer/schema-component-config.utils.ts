import {
  AmountComparisonOperator,
  BenefitApplicationScope,
  BenefitRuleType,
  ConditionRuleType,
  DiscountAllocationMethod,
  DiscountAllocationTarget,
  DiscountBase,
  MarkdownDiscountKind,
  RoundingMode,
  VoucherDiscountKind,
  VoucherDiscountTarget,
} from '../../../../apis/promotion/promotion.enum';
import type { PromotionDraftBenefitComponentDto, PromotionDraftConditionComponentDto } from '../../../../apis/promotion/promotion.entities';

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export const isPositiveIntegerText = (value: string): boolean => POSITIVE_INTEGER_PATTERN.test(value.trim());

export const parsePositiveIntegerText = (value: string): number | null => {
  if (!isPositiveIntegerText(value)) return null;
  const numericValue = Number(value.trim());
  return Number.isSafeInteger(numericValue) ? numericValue : null;
};

export const formatMinorAmount = (value: string | number): string => `${Number(value).toLocaleString('vi-VN')} VNĐ`;

export const normalizeBenefitAllocation = (
  applicationScope: BenefitApplicationScope,
): Pick<
  PromotionDraftBenefitComponentDto['config'] & {
    allocationTarget: DiscountAllocationTarget;
    allocationMethod: DiscountAllocationMethod;
  },
  'allocationTarget' | 'allocationMethod'
> => {
  if (applicationScope === BenefitApplicationScope.CART) {
    return {
      allocationTarget: DiscountAllocationTarget.TARGET_ELIGIBLE_LINES,
      allocationMethod: DiscountAllocationMethod.PROPORTIONAL_BY_ELIGIBLE_SUBTOTAL,
    };
  }

  return {
    allocationTarget: DiscountAllocationTarget.NONE,
    allocationMethod: DiscountAllocationMethod.NONE,
  };
};

export const AMOUNT_OPERATOR_LABEL: Record<AmountComparisonOperator, string> = {
  [AmountComparisonOperator.GREATER_THAN]: 'Lớn hơn',
  [AmountComparisonOperator.GREATER_THAN_OR_EQUAL]: 'Lớn hơn hoặc bằng',
};

export const DISCOUNT_BASE_LABEL: Record<DiscountBase, string> = {
  [DiscountBase.ORIGINAL_PRICE]: 'Giá gốc',
  [DiscountBase.CURRENT_SELLING_PRICE]: 'Giá bán hiện tại',
  [DiscountBase.AFTER_SKU_ITEM_PROMOTIONS]: 'Sau khuyến mãi biến thể',
};

export const DISCOUNT_KIND_LABEL: Record<MarkdownDiscountKind, string> = {
  [MarkdownDiscountKind.PERCENT]: 'Phần trăm',
  [MarkdownDiscountKind.FIXED_AMOUNT]: 'Số tiền cố định',
};

export const VOUCHER_DISCOUNT_KIND_LABEL: Record<VoucherDiscountKind, string> = {
  [VoucherDiscountKind.PERCENT]: 'Phần trăm',
  [VoucherDiscountKind.FIXED_AMOUNT]: 'Số tiền cố định',
};

export const VOUCHER_DISCOUNT_TARGET_LABEL: Record<VoucherDiscountTarget, string> = {
  [VoucherDiscountTarget.ORDER_VALUE]: 'Giá trị đơn hàng',
  [VoucherDiscountTarget.SHIPPING_FEE]: 'Phí vận chuyển',
};

export const APPLICATION_SCOPE_LABEL: Record<BenefitApplicationScope, string> = {
  [BenefitApplicationScope.SKU_ITEM]: 'Biến thể',
  [BenefitApplicationScope.LINE_ITEM]: 'Dòng hàng',
  [BenefitApplicationScope.CART]: 'Giỏ hàng',
  [BenefitApplicationScope.SHIPPING]: 'Vận chuyển',
  [BenefitApplicationScope.PAYMENT]: 'Thanh toán',
};

export const ALLOCATION_TARGET_LABEL: Record<DiscountAllocationTarget, string> = {
  [DiscountAllocationTarget.NONE]: 'Không',
  [DiscountAllocationTarget.TARGET_ELIGIBLE_LINES]: 'Dòng hàng hợp lệ theo phạm vi sản phẩm',
};

export const ALLOCATION_METHOD_LABEL: Record<DiscountAllocationMethod, string> = {
  [DiscountAllocationMethod.NONE]: 'Không',
  [DiscountAllocationMethod.PROPORTIONAL_BY_ELIGIBLE_SUBTOTAL]: 'Tỷ lệ theo tổng phụ hợp lệ',
};

export const ROUNDING_MODE_LABEL: Record<RoundingMode, string> = {
  [RoundingMode.FLOOR]: 'Làm tròn xuống',
  [RoundingMode.CEIL]: 'Làm tròn lên',
  [RoundingMode.HALF_UP]: 'Làm tròn nửa lên',
};

export const formatConditionSummary = (condition: PromotionDraftConditionComponentDto | null | undefined): string => {
  const config = condition?.config;
  if (!config) return 'Chưa cấu hình';
  if (config.type === ConditionRuleType.ALWAYS) return 'Luôn áp dụng';
  if (config.type !== ConditionRuleType.TARGET_SUBTOTAL) return 'Điều kiện chưa hỗ trợ';
  return `Giá trị đơn hàng ${AMOUNT_OPERATOR_LABEL[config.operator].toLowerCase()} ${formatMinorAmount(config.amountMinor)} (${DISCOUNT_BASE_LABEL[config.subtotalBase]})`;
};

export const formatBenefitSummary = (benefit: PromotionDraftBenefitComponentDto | null | undefined): string => {
  const config = benefit?.config;
  if (!config) return 'Chưa cấu hình';

  if (config.type === BenefitRuleType.FLAT_PRICE) {
    const quotaPolicy = config.quotaPolicy;
    const quotaParts = quotaPolicy
      ? [
          quotaPolicy.perLineLimit != null ? `mỗi dòng ${Number(quotaPolicy.perLineLimit).toLocaleString('vi-VN')}` : null,
          quotaPolicy.perCustomerLimit != null ? `mỗi khách ${Number(quotaPolicy.perCustomerLimit).toLocaleString('vi-VN')}` : null,
        ].filter((part): part is string => Boolean(part))
      : [];
    const quotaSummary = quotaParts.length > 0 ? `, giới hạn ${quotaParts.join(' | ')}` : quotaPolicy ? ', không giới hạn số lượng' : '';
    return `Giá đồng giá: ${formatMinorAmount(config.fixedPriceAmountMinor)}${quotaSummary}`;
  }

  if (config.type === BenefitRuleType.VOUCHER) {
    const value = config.discountKind === VoucherDiscountKind.PERCENT ? `${config.discountValue / 100}%` : formatMinorAmount(config.discountValue);
    const maxDiscount = config.maxDiscountAmount ? `, tối đa ${formatMinorAmount(config.maxDiscountAmount.amountMinor)}` : '';
    return `Loại giảm giá: ${VOUCHER_DISCOUNT_KIND_LABEL[config.discountKind]} - ${value}${maxDiscount} (${VOUCHER_DISCOUNT_TARGET_LABEL[config.discountTarget]})`;
  }

  if (config.type !== BenefitRuleType.MARKDOWN) return 'Ưu đãi chưa hỗ trợ';

  const value = config.discountKind === MarkdownDiscountKind.PERCENT ? `${config.discountValue / 100}%` : formatMinorAmount(config.discountValue);
  const maxDiscount = config.maxDiscountAmount ? `, tối đa ${formatMinorAmount(config.maxDiscountAmount.amountMinor)}` : '';
  return `Loại giảm giá: ${DISCOUNT_KIND_LABEL[config.discountKind]} - ${value}${maxDiscount}`;
};
