import type { ProductStatus, StockStatus, VariantStatus } from "@/apis/product/product.interface";
import type { FormSelectOption } from "@/components/form/form-field.interface";
import type { StatusTone } from "@/theme/design-tokens";

/**
 * Catalog status vocabulary shared by the PIM and CMS modules — a CMS page carries the same
 * `ProductStatus` union as a product, so the label and the tone must be declared once.
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

export const PRODUCT_STATUS_TONES: Record<ProductStatus, StatusTone> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "neutral",
};

export const PRODUCT_STATUS_OPTIONS: FormSelectOption<ProductStatus>[] = (Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map(
  (status) => ({
    value: status,
    label: PRODUCT_STATUS_LABELS[status],
  }),
);

/** Sentinel for "no status filter". Kept out of the payload by the page's query normaliser. */
export const STATUS_FILTER_ALL = "ALL";

export const PRODUCT_STATUS_FILTER_OPTIONS: FormSelectOption<string>[] = [
  { value: STATUS_FILTER_ALL, label: "All statuses" },
  ...PRODUCT_STATUS_OPTIONS.map((option) => ({ value: option.value as string, label: option.label })),
];

export const VARIANT_STATUS_LABELS: Record<VariantStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const VARIANT_STATUS_OPTIONS: FormSelectOption<VariantStatus>[] = (Object.keys(VARIANT_STATUS_LABELS) as VariantStatus[]).map(
  (status) => ({
    value: status,
    label: VARIANT_STATUS_LABELS[status],
  }),
);

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  PRE_ORDER: "Pre-order",
};

export const STOCK_STATUS_TONES: Record<StockStatus, StatusTone> = {
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "danger",
  PRE_ORDER: "info",
};
