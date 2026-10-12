import { type SxProps, type Theme } from '@mui/material';
import { type FocusEventHandler, type ReactElement, type ReactNode } from 'react';
import type { ProductCreateRequestDto, ProductSkuMatrixLeafRowDto, ProductSkuMatrixRowEditorFields, ProductSkuMatrixServerPrefill } from '../../../apis/product/product.interface';
import type { ProductApprovalSummary } from '../../../apis/product/product.entities';
import { type ProductApprovalStatus, type ProductSpuStatus } from '../../../apis/product/product.enum';
import type { AttributeTreeSelectOption } from '../../../components/form/select-attribute-tree-input';
import type { ProductSpuSkuLeafFieldErrors } from './utils/product-spu-sku-field-errors.utils';

export type { ProductSpuSkuLeafFieldErrors };

export type VariantKeyRow = { key: readonly string[] };

export type VariantAttributeDef = {
  code: string;
  label: string;
};

export type NormalizedVariantRow = {
  rawKey: readonly string[];
  valuesByAttr: string[];
};

export type VariantTreeNode = {
  id: string;
  attrCode: string;
  attrLabel: string;
  valueToken: string;
  displayValue: string;
  depth: number;
  pathValues: readonly string[];
  children: VariantTreeNode[];
  leaves: NormalizedVariantRow[];
};

export type VariantMatrixFlatRow = {
  id: string;
  depth: number;
  isGroup: boolean;
  label: string;
  pathValues: readonly string[];
  leaf?: NormalizedVariantRow;
  descendantLeafCount: number;
  descendantRowCount: number;
  variantThumbUrl?: string | null;
  leafMedias?: readonly string[];
  leafAttributeValueUuids?: readonly string[];
  sourceVariationUuid?: string;
  prefillFromServer?: ProductSkuMatrixServerPrefill;
};

export interface SkuMatrixPreviewVariantCarryPayload {
  canonicalKey: string;
  variantId?: string;
  variantData?: unknown;
}

export interface FlattenSkuPreviewMatrixOpts {
  mediaUrlsByVariantId?: ReadonlyMap<string, readonly string[]>;
}

export type ProductSpuCreateFormValues = Omit<ProductCreateRequestDto, 'attributes' | 'skus'>;

export interface ProductSpu {
  id: string;
  name: string;
  code: string;
  approval?: ProductApprovalSummary | null;
  status: ProductSpuStatus;
  category: string;
  brand: string;
  image: string;
}

export interface ProductSpuSectionNavItem {
  key: string;
  label: string;
}

export interface ProductSpuPageSection {
  key: string;
  content: ReactNode;
}

export interface ProductSpuPageSectionsFrameProps {
  sections: ReadonlyArray<ProductSpuPageSection>;
  scrollAreaMaxHeight?: string;
  sx?: SxProps<Theme>;
}

export interface ProductSpuMatrixFieldCellProps {
  disabled?: boolean;
  readOnly: boolean;
  type?: 'text' | 'number' | 'date' | 'currency';
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  prefix?: string;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  numericTooltip?: ReactElement | string;
  error?: boolean;
  errorMessage?: string;
}

export interface ProductSpuAdvancedFilters {
  categoryUuid: string;
  priceRangeKey: string;
  status: ProductSpuStatus;
  approvalStatus: ProductApprovalStatus | '';
}

export interface ProductSpuSidebarProps {
  items: ReadonlyArray<ProductSpuSectionNavItem>;
  activeKey: string;
  onNavigate: (key: string) => void;
}

export interface ProductSpuVariantMatrixComputedFields {
  categoryTaxRate: string;
  productTaxRateOverride: string;
  saleStartDate: string;
  saleEndDate: string;
}

export type VariantMatrixRowVm = VariantMatrixFlatRow & ProductSkuMatrixRowEditorFields & ProductSpuVariantMatrixComputedFields;

export const PRODUCT_SPU_MATRIX_PARENT_CASCADE_FIELDS = [
  'skuCode',
  'status',
  'taxRateOverride',
  'costPriceAfterTaxMinor',
  'compareAtPriceAfterTaxMinor',
  'sellingPriceAfterTaxMinor',
  'b2bWholesalePriceAfterTax',
  'weight',
  'length',
  'width',
  'height',
] as const;

export type ProductSpuMatrixParentCascadeField = (typeof PRODUCT_SPU_MATRIX_PARENT_CASCADE_FIELDS)[number];

export interface AppliedAttributeSummary {
  attributeId: string;
  label: string;
  valuesText: string;
}

export interface VariantMatrixDerivedFromTree {
  summaries: AppliedAttributeSummary[];
  attributeOrder: VariantAttributeDef[];
  keyRows: VariantKeyRow[];
}

export interface ProductSpuVariantMatrixProps {
  readOnly?: boolean;
  isUpdate?: boolean;
  appliedAttributeSummaries: readonly AppliedAttributeSummary[];
  attributeOrder: readonly VariantAttributeDef[];
  keyRows: readonly VariantKeyRow[];
  attributeTreeOptions: readonly AttributeTreeSelectOption[];
  appliedAttributesError?: boolean;
  appliedAttributesErrorMessage?: string;
  selectedAttributes: readonly string[];
  onSelectedAttributesChange: (next: readonly string[]) => void;
  onAttributeSelectOpenChange?: (open: boolean) => void;
  attributeTreeLoading?: boolean;
  categoryTaxRate?: number | null;
  productTaxRateOverride?: number | null;
  skuMatrixPreviewFlatRows?: readonly VariantMatrixFlatRow[];
  skuMatrixPreviewLoading?: boolean;
  enableSortableAttributeSummaries?: boolean;
  onReorderAppliedAttributes?: (orderedAttributeIds: string[]) => void;
  onLeafSkuRowsChange?: (rows: readonly ProductSkuMatrixLeafRowDto[]) => void;
  /** Per leaf-row field errors aligned with leaf order in the matrix. */
  skuMatrixLeafFieldErrors?: readonly (ProductSpuSkuLeafFieldErrors | undefined)[];
}
