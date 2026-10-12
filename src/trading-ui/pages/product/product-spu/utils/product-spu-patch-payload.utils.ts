import type { ProductPatchRequestDto, ProductSkuUpsertRequestDto } from '../../../../apis';

type FormSnapshot = ProductPatchRequestDto;

const isSame = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

const skuMatchKey = (sku: ProductSkuUpsertRequestDto): string => sku.uuid ?? sku.skuCode;

/** Field optional: omit trên PATCH = giữ cũ; muốn xóa phải gửi `null`. */
const NULLABLE_CLEAR_SKU_FIELDS = ['costPriceAfterTaxMinor', 'taxRateOverride'] as const;

/** SKU đã có: chỉ gửi field đổi + uuid/skuCode. SKU mới: gửi full row. */
const diffSkuRow = (baselineRow: ProductSkuUpsertRequestDto | undefined, currentRow: ProductSkuUpsertRequestDto): ProductSkuUpsertRequestDto | null => {
  if (!baselineRow) return { ...currentRow };

  const changed: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(currentRow)) {
    if (field === 'uuid' || field === 'skuCode' || field === 'clientKey') continue;
    if (!isSame(baselineRow[field as keyof ProductSkuUpsertRequestDto], value)) {
      changed[field] = value;
    }
  }

  for (const field of NULLABLE_CLEAR_SKU_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(changed, field)) continue;
    if (Object.prototype.hasOwnProperty.call(currentRow, field)) continue;
    const baselineValue = baselineRow[field];
    if (baselineValue !== undefined && baselineValue !== null) {
      changed[field] = null;
    }
  }

  if (Object.keys(changed).length === 0) return null;

  return {
    uuid: currentRow.uuid,
    skuCode: currentRow.skuCode,
    ...changed,
  } as ProductSkuUpsertRequestDto;
};

/**
 * So sánh form hiện tại với baseline (snapshot lúc load/lưu xong).
 * Chỉ đưa vào PATCH những phần thực sự thay đổi — không auto gửi kèm attributes khi chỉ sửa giá SKU.
 *
 * Nullable clear: field optional như costPriceAfterTaxMinor phải có mặt với `null` trên current row
 * thì diff mới nhận ra (omit = không đổi theo contract BE hydrate).
 */
export const buildProductPatchBody = (baseline: FormSnapshot, current: FormSnapshot): ProductPatchRequestDto => {
  const patch: ProductPatchRequestDto = {};

  const scalarFields: (keyof ProductPatchRequestDto)[] = [
    'name',
    'unitOfMeasure',
    'categoryUuid',
    'brandId',
    'seasonUuid',
    'taxRateOverride',
    'description',
    'weight',
    'length',
    'width',
    'height',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'defaultVariationUuid',
  ];

  for (const field of scalarFields) {
    if (!isSame(baseline[field], current[field])) {
      patch[field] = current[field] as never;
    }
  }

  if (current.attributes && !isSame(baseline.attributes, current.attributes)) {
    patch.attributes = current.attributes;
  }

  const baselineSkuRows = baseline.skus?.upsert ?? [];
  const changedSkuRows = (current.skus?.upsert ?? [])
    .map((row) =>
      diffSkuRow(
        baselineSkuRows.find((base) => skuMatchKey(base) === skuMatchKey(row)),
        row,
      ),
    )
    .filter((row): row is ProductSkuUpsertRequestDto => row != null);

  if (changedSkuRows.length > 0) {
    patch.skus = { upsert: changedSkuRows };
  }

  if (current.productInfos && !isSame(baseline.productInfos, current.productInfos)) {
    patch.productInfos = current.productInfos;
  }

  if (current.packagingRelations && !isSame(baseline.packagingRelations, current.packagingRelations)) {
    patch.packagingRelations = current.packagingRelations;
  }

  if (current.productMixMatch !== undefined && !isSame(baseline.productMixMatch ?? [], current.productMixMatch)) {
    patch.productMixMatch = current.productMixMatch;
  }

  return patch;
};
