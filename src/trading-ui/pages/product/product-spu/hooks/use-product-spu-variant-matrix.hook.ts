import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildVariantTree, carryLeafMatrixVmOntoRow, flattenVariantTreeForTable, isStrictDescendantPath, stableVariantValueUuidsKey } from '../utils/product-spu-variant-matrix.utils';
import { PRODUCT_SPU_MATRIX_PARENT_CASCADE_FIELDS, type ProductSpuMatrixParentCascadeField, type VariantMatrixFlatRow, type VariantMatrixRowVm } from '../product-spu.interface';
import { ProductSkuStatus } from '@/trading-ui/apis/pim';
import { calculateBeforeTaxFromAfterTax, formatNullableNumber, resolveEffectiveTaxRate, resolveTaxSource } from '../utils/product-spu-pricing.utils';

type PricingContext = {
  categoryTaxRate?: number | null;
  productTaxRateOverride?: number | null;
};

const isParentCascadeField = (f: string): f is ProductSpuMatrixParentCascadeField => (PRODUCT_SPU_MATRIX_PARENT_CASCADE_FIELDS as readonly string[]).includes(f);

const filterCollapsedVariantRows = <T extends { id: string; depth: number; isGroup: boolean }>(rows: T[], collapsedIds: ReadonlySet<string>): T[] => {
  const out: T[] = [];
  let hideUntilDepth: number | null = null;
  for (const row of rows) {
    if (hideUntilDepth !== null) {
      if (row.depth <= hideUntilDepth) {
        hideUntilDepth = null;
      } else {
        continue;
      }
    }
    out.push(row);
    if (row.isGroup && collapsedIds.has(row.id)) {
      hideUntilDepth = row.depth;
    }
  }
  return out;
};

const hydratePricingFields = (row: VariantMatrixRowVm, context?: PricingContext): VariantMatrixRowVm => {
  const effectiveTaxRate = resolveEffectiveTaxRate({
    categoryTaxRate: context?.categoryTaxRate ?? row.categoryTaxRate,
    productTaxRateOverride: context?.productTaxRateOverride ?? row.productTaxRateOverride,
    skuTaxRateOverride: row.taxRateOverride,
    serverEffectiveTaxRate: row.effectiveTaxRate,
  });
  const taxSource = resolveTaxSource({
    categoryTaxRate: context?.categoryTaxRate ?? row.categoryTaxRate,
    productTaxRateOverride: context?.productTaxRateOverride ?? row.productTaxRateOverride,
    skuTaxRateOverride: row.taxRateOverride,
    serverTaxSource: row.taxSource,
  });

  return {
    ...row,
    effectiveTaxRate: formatNullableNumber(effectiveTaxRate),
    taxSource,
    costPriceBeforeTaxMinor: calculateBeforeTaxFromAfterTax(row.costPriceAfterTaxMinor, effectiveTaxRate),
    compareAtPriceBeforeTaxMinor: calculateBeforeTaxFromAfterTax(row.compareAtPriceAfterTaxMinor, effectiveTaxRate),
    sellingPriceBeforeTaxMinor: calculateBeforeTaxFromAfterTax(row.sellingPriceAfterTaxMinor, effectiveTaxRate),
    b2bWholesalePriceBeforeTax: calculateBeforeTaxFromAfterTax(row.b2bWholesalePriceAfterTax, effectiveTaxRate),
    categoryTaxRate: formatNullableNumber(context?.categoryTaxRate ?? row.categoryTaxRate),
    productTaxRateOverride: formatNullableNumber(context?.productTaxRateOverride ?? row.productTaxRateOverride),
  };
};

const buildBaseVmRow = (row: VariantMatrixFlatRow, context?: PricingContext): VariantMatrixRowVm => {
  const prefill = row.prefillFromServer;
  return hydratePricingFields(
    {
      ...row,
      skuCode: prefill?.skuCode ?? '',
      status: prefill?.status ?? ProductSkuStatus.ACTIVE,
      taxRateOverride: formatNullableNumber(prefill?.taxRateOverride),
      effectiveTaxRate: formatNullableNumber(prefill?.effectiveTaxRate ?? prefill?.serverEffectiveTaxRate),
      taxSource: prefill?.taxSource ?? prefill?.serverTaxSource ?? '',
      medias: row.leafMedias?.length ? [...row.leafMedias] : [],
      costPriceBeforeTaxMinor: formatNullableNumber(prefill?.costPriceBeforeTaxMinor),
      costPriceAfterTaxMinor: formatNullableNumber(prefill?.costPriceAfterTaxMinor),
      compareAtPriceBeforeTaxMinor: formatNullableNumber(prefill?.compareAtPriceBeforeTaxMinor),
      compareAtPriceAfterTaxMinor: formatNullableNumber(prefill?.compareAtPriceAfterTaxMinor),
      sellingPriceBeforeTaxMinor: formatNullableNumber(prefill?.sellingPriceBeforeTaxMinor),
      sellingPriceAfterTaxMinor: formatNullableNumber(prefill?.sellingPriceAfterTaxMinor),
      b2bWholesalePriceBeforeTax: formatNullableNumber(prefill?.b2bWholesalePriceBeforeTax),
      b2bWholesalePriceAfterTax: formatNullableNumber(prefill?.b2bWholesalePriceAfterTax),
      saleStartDate: '',
      saleEndDate: '',
      categoryTaxRate: formatNullableNumber(prefill?.categoryTaxRate ?? context?.categoryTaxRate),
      productTaxRateOverride: formatNullableNumber(prefill?.productTaxRateOverride ?? context?.productTaxRateOverride),
      weight: formatNullableNumber(prefill?.weight),
      length: formatNullableNumber(prefill?.length),
      width: formatNullableNumber(prefill?.width),
      height: formatNullableNumber(prefill?.height),
    },
    context,
  );
};

const applyReadOnlyDemoDefaults = (row: VariantMatrixRowVm, context?: PricingContext): VariantMatrixRowVm => hydratePricingFields(row, context);

export const createVariantMatrixVmRow = (row: VariantMatrixFlatRow, context?: PricingContext): VariantMatrixRowVm => buildBaseVmRow(row, context);

export type UseProductSpuVariantMatrixParams = {
  readOnly: boolean;
  attributeOrder: Parameters<typeof buildVariantTree>[1];
  keyRows: Parameters<typeof buildVariantTree>[0];
  previewMatrixFlatRows?: readonly VariantMatrixFlatRow[];
  categoryTaxRate?: number | null;
  productTaxRateOverride?: number | null;
};

export const useProductSpuVariantMatrix = ({ readOnly, attributeOrder, keyRows, previewMatrixFlatRows, categoryTaxRate, productTaxRateOverride }: UseProductSpuVariantMatrixParams) => {
  const pricingContext = useMemo(() => ({ categoryTaxRate, productTaxRateOverride }), [categoryTaxRate, productTaxRateOverride]);
  const tree = useMemo(() => buildVariantTree(keyRows, attributeOrder), [attributeOrder, keyRows]);
  const baseFlatFromClient = useMemo(() => flattenVariantTreeForTable(tree), [tree]);
  const baseFlat = useMemo(() => (previewMatrixFlatRows !== undefined ? [...previewMatrixFlatRows] : baseFlatFromClient), [previewMatrixFlatRows, baseFlatFromClient]);

  const [rowsById, setRowsById] = useState<Record<string, VariantMatrixRowVm>>({});
  const [collapsedGroupRowIds, setCollapsedGroupRowIds] = useState<Set<string>>(() => new Set());
  const overridesRef = useRef(new Set<string>());
  const parentCascadeDisabledRef = useRef(new Set<string>());
  const groupCascadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBaseFlatRef = useRef<VariantMatrixFlatRow[]>([]);

  const descendantCascadeTargetIdsByGroupId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const groupRow of baseFlat) {
      if (!groupRow.isGroup) continue;
      const ids: string[] = [];
      for (const row of baseFlat) {
        if (row.id === groupRow.id) continue;
        if (isStrictDescendantPath(groupRow.pathValues, row.pathValues)) {
          ids.push(row.id);
        }
      }
      map.set(groupRow.id, ids);
    }
    return map;
  }, [baseFlat]);

  useEffect(() => {
    if (groupCascadeTimerRef.current) {
      clearTimeout(groupCascadeTimerRef.current);
      groupCascadeTimerRef.current = null;
    }

    const prevFlat = prevBaseFlatRef.current;

    setRowsById((prevRows) => {
      const carryLeafByKey = new Map<string, VariantMatrixRowVm>();
      for (const row of prevFlat) {
        if (row.isGroup || !row.leafAttributeValueUuids?.length) continue;
        const key = stableVariantValueUuidsKey(row.leafAttributeValueUuids);
        const vm = prevRows[row.id];
        if (vm && !vm.isGroup) {
          carryLeafByKey.set(key, vm);
        }
      }

      const next: Record<string, VariantMatrixRowVm> = {};
      for (const row of baseFlat) {
        let vm = buildBaseVmRow(row, pricingContext);

        if (!row.isGroup && row.leafAttributeValueUuids?.length) {
          const carried = carryLeafByKey.get(stableVariantValueUuidsKey(row.leafAttributeValueUuids));
          if (carried) {
            vm = hydratePricingFields(carryLeafMatrixVmOntoRow(carried, vm), pricingContext);
          }
        }

        if (readOnly) {
          vm = applyReadOnlyDemoDefaults(vm, pricingContext);
        }

        next[row.id] = vm;
      }
      return next;
    });

    overridesRef.current = new Set();
    parentCascadeDisabledRef.current = new Set();
    setCollapsedGroupRowIds(new Set());

    prevBaseFlatRef.current = baseFlat;
  }, [baseFlat, pricingContext, readOnly]);

  useEffect(
    () => () => {
      if (groupCascadeTimerRef.current) {
        clearTimeout(groupCascadeTimerRef.current);
        groupCascadeTimerRef.current = null;
      }
    },
    [],
  );


  const flatVm = useMemo(() => baseFlat.map((row) => hydratePricingFields(rowsById[row.id] ?? buildBaseVmRow(row, pricingContext), pricingContext)), [baseFlat, pricingContext, rowsById]);
  const visibleFlatVm = useMemo(() => filterCollapsedVariantRows(flatVm, collapsedGroupRowIds), [collapsedGroupRowIds, flatVm]);

  const toggleCollapsedRow = useCallback((rowId: string) => {
    setCollapsedGroupRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const applyDescendantCascadeFromGroup = useCallback(
    (prev: Record<string, VariantMatrixRowVm>, groupRowId: string, field: string, opts?: { force?: boolean }): Record<string, VariantMatrixRowVm> => {
      const cascadeKey = `${groupRowId}:${field}`;
      if (!opts?.force && parentCascadeDisabledRef.current.has(cascadeKey)) {
        return prev;
      }
      if (!isParentCascadeField(field)) {
        return prev;
      }

      const groupRow = prev[groupRowId];
      if (!groupRow?.isGroup) {
        return prev;
      }

      const value = groupRow[field as keyof VariantMatrixRowVm];
      const targetIds = descendantCascadeTargetIdsByGroupId.get(groupRowId) ?? [];
      if (!targetIds.length) {
        return prev;
      }

      const nextRows: Record<string, VariantMatrixRowVm> = { ...prev };
      let changed = false;

      for (const id of targetIds) {
        const row = nextRows[id];
        if (!row) continue;
        if (row.leaf) {
          const key = `${id}:${field}`;
          if (overridesRef.current.has(key)) {
            continue;
          }
        }
        const current = row[field as keyof VariantMatrixRowVm];
        if (Object.is(current, value)) {
          continue;
        }
        nextRows[id] = hydratePricingFields({ ...row, [field]: value } as VariantMatrixRowVm, pricingContext);
        changed = true;
      }

      return changed ? nextRows : prev;
    },
    [descendantCascadeTargetIdsByGroupId, pricingContext],
  );

  const onParentCascadeFieldBlur = useCallback(
    (groupRowId: string, field: ProductSpuMatrixParentCascadeField) => {
      if (groupCascadeTimerRef.current) {
        clearTimeout(groupCascadeTimerRef.current);
        groupCascadeTimerRef.current = null;
      }
      setRowsById((prev) => {
        const next = applyDescendantCascadeFromGroup(prev, groupRowId, field, { force: true });
        parentCascadeDisabledRef.current.add(`${groupRowId}:${field}`);
        return next;
      });
    },
    [applyDescendantCascadeFromGroup],
  );

  const patchField = useCallback(
    (rowId: string, field: keyof VariantMatrixRowVm, value: string | boolean | string[]) => {
      if (readOnly) return;
      setRowsById((prev) => {
        const row = prev[rowId];
        if (!row) {
          return prev;
        }

        const nextRows = {
          ...prev,
          [rowId]: hydratePricingFields({ ...row, [field]: value } as VariantMatrixRowVm, pricingContext),
        };

        if (row.isGroup) {
          const cascadeKey = `${rowId}:${String(field)}`;
          const shouldCascade = isParentCascadeField(String(field)) && !parentCascadeDisabledRef.current.has(cascadeKey);

          if (shouldCascade) {
            if (String(field) === 'status') {
              return applyDescendantCascadeFromGroup(nextRows, rowId, String(field));
            }
            if (groupCascadeTimerRef.current) {
              clearTimeout(groupCascadeTimerRef.current);
            }
            groupCascadeTimerRef.current = setTimeout(() => {
              groupCascadeTimerRef.current = null;
              setRowsById((currentRows) => applyDescendantCascadeFromGroup(currentRows, rowId, String(field)));
            }, 100);
          }
          return nextRows;
        }

        if (row.leaf) {
          overridesRef.current.add(`${rowId}:${String(field)}`);
        }

        return nextRows;
      });
    },
    [applyDescendantCascadeFromGroup, pricingContext, readOnly],
  );

  return {
    baseFlat,
    flatVm,
    visibleFlatVm,
    collapsedGroupRowIds,
    toggleCollapsedRow,
    patchField,
    onParentCascadeFieldBlur,
  };
};
