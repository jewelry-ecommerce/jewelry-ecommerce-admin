import type { NormalizedVariantRow, VariantAttributeDef, VariantKeyRow, VariantMatrixFlatRow, VariantMatrixRowVm, VariantTreeNode } from '../product-spu.interface';
import type { ProductSkuMatrixLeafRowDto } from '../../../../apis/product/product.interface';

export { type VariantKeyRow, type VariantAttributeDef, type NormalizedVariantRow, type VariantTreeNode, type VariantMatrixFlatRow };

export const VARIANT_MATRIX_MAX_DEPTH = 5;
export const VARIANT_MATRIX_MAX_CHILDREN = 5;

function parseSegment(segment: string | undefined, attrCode: string): string {
  if (!segment || !segment.trim()) return '';
  const s = segment.trim();
  const idx = s.indexOf(':');
  if (idx === -1) return s;
  const left = s.slice(0, idx).trim().toUpperCase();
  const right = s.slice(idx + 1).trim();
  if (left === attrCode.toUpperCase()) return right;
  return right || s;
}

export function normalizeVariantKeyRow(row: VariantKeyRow, attributeOrder: readonly VariantAttributeDef[]): NormalizedVariantRow | null {
  if (!row.key?.length) return null;
  const valuesByAttr = attributeOrder.map((def, i) => parseSegment(row.key[i], def.code));
  if (valuesByAttr.every((v) => !v)) return null;
  return { rawKey: row.key, valuesByAttr };
}

export function displayVariantToken(token: string): string {
  if (!token) return '—';
  return token.replace(/_/g, ' ');
}

function groupByAttrValue(rows: NormalizedVariantRow[], depth: number): Map<string, NormalizedVariantRow[]> {
  const m = new Map<string, NormalizedVariantRow[]>();
  for (const r of rows) {
    const v = (r.valuesByAttr[depth] ?? '').trim();
    if (!v) continue;
    const arr = m.get(v) ?? [];
    arr.push(r);
    m.set(v, arr);
  }
  return m;
}

export function countLeafRowsUnder(node: VariantTreeNode): number {
  let n = node.leaves.length;
  for (const c of node.children) n += countLeafRowsUnder(c);
  return n;
}

export const isStrictDescendantPath = (ancestor: readonly string[], path: readonly string[]): boolean => {
  if (path.length <= ancestor.length) return false;
  return ancestor.every((a, i) => a === path[i]);
};

export function buildVariantTree(rows: readonly VariantKeyRow[], attributeOrder: readonly VariantAttributeDef[]): VariantTreeNode[] {
  const normalized = rows.map((r) => normalizeVariantKeyRow(r, attributeOrder)).filter((r): r is NormalizedVariantRow => Boolean(r));

  const maxDepth = Math.min(VARIANT_MATRIX_MAX_DEPTH, attributeOrder.length);

  const buildLevel = (bucket: NormalizedVariantRow[], depth: number, pathValues: string[]): VariantTreeNode[] => {
    if (!bucket.length || depth >= maxDepth) return [];

    const attr = attributeOrder[depth];
    if (!attr) return [];

    const isLastAttr = depth >= attributeOrder.length - 1;

    const groups = groupByAttrValue(bucket, depth);
    const keys = [...groups.keys()].slice(0, VARIANT_MATRIX_MAX_CHILDREN);

    return keys.map((valueToken, idx) => {
      const groupRows = groups.get(valueToken) ?? [];
      const nextPath = [...pathValues, valueToken];
      const id = `${depth}:${nextPath.join('>')}:${idx}`;

      if (isLastAttr) {
        return {
          id,
          attrCode: attr.code,
          attrLabel: attr.label,
          valueToken,
          displayValue: displayVariantToken(valueToken),
          depth,
          pathValues: nextPath,
          children: [],
          leaves: groupRows,
        };
      }

      const children = buildLevel(groupRows, depth + 1, nextPath);
      return {
        id,
        attrCode: attr.code,
        attrLabel: attr.label,
        valueToken,
        displayValue: displayVariantToken(valueToken),
        depth,
        pathValues: nextPath,
        children,
        leaves: [],
      };
    });
  };

  return buildLevel(normalized, 0, []);
}

/** Khớp cùng một tổ hợp giá trị biến thể khi đổi thứ tục trục / cấu trúc nhóm trong ma trận. */
export const stableVariantValueUuidsKey = (uuids: readonly string[]): string => [...uuids].sort().join('\u0001');

export function flattenVariantTreeForTable(nodes: readonly VariantTreeNode[]): VariantMatrixFlatRow[] {
  const out: VariantMatrixFlatRow[] = [];

  const walk = (node: VariantTreeNode) => {
    const isTerminalBucket = node.children.length === 0 && node.leaves.length > 0;

    /** Cấp cuối chỉ có 1 SKU: bỏ hàng nhóm trùng nhãn (vd "34" + "1 biến thể" rồi lại hàng "34"). */
    if (isTerminalBucket && node.leaves.length === 1) {
      const leaf = node.leaves[0]!;
      const lastVal = [...leaf.valuesByAttr].reverse().find((v) => v.trim()) ?? '';
      out.push({
        id: `l:${node.id}:0:${leaf.rawKey.join('|')}`,
        depth: node.depth + 1,
        isGroup: false,
        label: displayVariantToken(lastVal),
        pathValues: [...leaf.valuesByAttr],
        leaf,
        descendantLeafCount: 1,
        descendantRowCount: 0,
      });
      return;
    }

    out.push({
      id: `g:${node.id}`,
      depth: node.depth,
      isGroup: true,
      label: node.displayValue,
      pathValues: node.pathValues,
      descendantLeafCount: countLeafRowsUnder(node),
      descendantRowCount: 0,
    });

    for (const c of node.children) walk(c);

    for (let i = 0; i < node.leaves.length; i++) {
      const leaf = node.leaves[i];
      const lastVal = [...leaf.valuesByAttr].reverse().find((v) => v.trim()) ?? '';
      out.push({
        id: `l:${node.id}:${i}:${leaf.rawKey.join('|')}`,
        depth: node.depth + 1,
        isGroup: false,
        label: displayVariantToken(lastVal),
        pathValues: [...leaf.valuesByAttr],
        leaf,
        descendantLeafCount: 1,
        descendantRowCount: 0,
      });
    }
  };

  for (const n of nodes) walk(n);

  for (const row of out) {
    if (!row.isGroup) continue;
    row.descendantRowCount = out.filter((r) => r.id !== row.id && isStrictDescendantPath(row.pathValues, r.pathValues)).length;
  }

  return out;
}

/** Các field form ma trận (không gồm metadata hàng từ `VariantMatrixFlatRow`). */
export const carryLeafMatrixVmOntoRow = (from: VariantMatrixRowVm, into: VariantMatrixRowVm): VariantMatrixRowVm => ({
  ...into,
  skuCode: from.skuCode,
  status: from.status,
  taxRateOverride: from.taxRateOverride,
  effectiveTaxRate: from.effectiveTaxRate,
  taxSource: from.taxSource,
  medias: from.medias,
  costPriceBeforeTaxMinor: from.costPriceBeforeTaxMinor,
  costPriceAfterTaxMinor: from.costPriceAfterTaxMinor,
  compareAtPriceBeforeTaxMinor: from.compareAtPriceBeforeTaxMinor,
  compareAtPriceAfterTaxMinor: from.compareAtPriceAfterTaxMinor,
  sellingPriceBeforeTaxMinor: from.sellingPriceBeforeTaxMinor,
  sellingPriceAfterTaxMinor: from.sellingPriceAfterTaxMinor,
  saleStartDate: from.saleStartDate,
  saleEndDate: from.saleEndDate,
  b2bWholesalePriceBeforeTax: from.b2bWholesalePriceBeforeTax,
  b2bWholesalePriceAfterTax: from.b2bWholesalePriceAfterTax,
  categoryTaxRate: from.categoryTaxRate,
  productTaxRateOverride: from.productTaxRateOverride,
  weight: from.weight,
  length: from.length,
  width: from.width,
  height: from.height,
});

/** Lá ma trận → payload submit (map `id` / `leafAttributeValueUuids` sang tên aligned API). */
export const variantMatrixLeafRowsToSkuMatrixDtos = (flatVm: readonly VariantMatrixRowVm[]): ProductSkuMatrixLeafRowDto[] =>
  flatVm
    .filter((r) => !r.isGroup && r.leafAttributeValueUuids?.length)
    .map((r) => {
      const {
        id: rowId,
        leafAttributeValueUuids,
        skuCode,
        status,
        taxRateOverride,
        costPriceAfterTaxMinor,
        compareAtPriceAfterTaxMinor,
        sellingPriceAfterTaxMinor,
        b2bWholesalePriceAfterTax,
        medias,
        weight,
        length,
        width,
        height,
      } = r;
      return {
        rowId,
        attributeValueUuids: [...leafAttributeValueUuids!],
        variationUuid: r.sourceVariationUuid,
        skuCode,
        status,
        taxRateOverride,
        costPriceAfterTaxMinor,
        compareAtPriceAfterTaxMinor,
        sellingPriceAfterTaxMinor,
        b2bWholesalePriceAfterTax,
        medias: [...(medias ?? [])],
        weight,
        length,
        width,
        height,
      };
    });
