import type {
  SkuMatrixPreviewMatrixNode,
  SkuMatrixPreviewMetaAttribute,
  SkuMatrixPreviewMetaValue,
  SkuMatrixPreviewRequestDto,
  SkuMatrixPreviewResponseDto,
} from '../../../../apis/product/product.interface';
import { ProductSkuStatus } from '../../../../apis/product/product.enum';
import type { ProductVariationDetail } from '../../../../apis/product/product.entities';
import { displayVariantToken, isStrictDescendantPath } from './product-spu-variant-matrix.utils';
import type { FlattenSkuPreviewMatrixOpts, NormalizedVariantRow, SkuMatrixPreviewVariantCarryPayload, VariantAttributeDef, VariantMatrixFlatRow } from '../product-spu.interface';

export const variationMediaUrlsByVariantId = (variations: readonly ProductVariationDetail[] | undefined): Map<string, string[]> => {
  const m = new Map<string, string[]>();
  for (const v of variations ?? []) {
    const urls = [...(v.medias ?? [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x) => x.url)
      .filter((u): u is string => Boolean(u?.trim()));
    if (urls.length) m.set(v.id, urls);
  }
  return m;
};

const leafPrefillFromPreviewNode = (node: SkuMatrixPreviewMatrixNode): Pick<VariantMatrixFlatRow, 'prefillFromServer' | 'sourceVariationUuid'> => {
  const vd = node.variantData;
  const fromId = typeof node.variantId === 'string' && node.variantId.trim() ? node.variantId : undefined;
  if (!vd || typeof vd !== 'object') {
    return { prefillFromServer: undefined, sourceVariationUuid: fromId };
  }
  const v = vd as Record<string, unknown>;
  const uuid = (typeof v.uuid === 'string' && v.uuid.trim() ? v.uuid : undefined) ?? fromId;
  const rawStatus = typeof v.status === 'string' ? v.status.toUpperCase() : '';
  const status = rawStatus === ProductSkuStatus.INACTIVE ? ProductSkuStatus.INACTIVE : ProductSkuStatus.ACTIVE;
  return {
    prefillFromServer: {
      skuCode: String(v.skuCode ?? ''),
      status,
      taxRateOverride: v.skuTaxRateOverride != null ? String(v.skuTaxRateOverride) : v.taxRate != null && v.taxSource === 'SKU' ? String(v.taxRate) : '',
      effectiveTaxRate: v.effectiveTaxRate != null ? String(v.effectiveTaxRate) : v.taxRate != null ? String(v.taxRate) : '',
      taxSource: typeof v.taxSource === 'string' ? v.taxSource : '',
      categoryTaxRate: v.categoryTaxRate != null ? String(v.categoryTaxRate) : '',
      productTaxRateOverride: v.productTaxRateOverride != null ? String(v.productTaxRateOverride) : '',
      serverEffectiveTaxRate: v.effectiveTaxRate != null ? String(v.effectiveTaxRate) : v.taxRate != null ? String(v.taxRate) : '',
      serverTaxSource: typeof v.taxSource === 'string' ? v.taxSource : '',
      costPriceBeforeTaxMinor: v.costPriceBeforeTaxMinor != null ? String(v.costPriceBeforeTaxMinor) : '',
      costPriceAfterTaxMinor: v.costPriceAfterTaxMinor != null ? String(v.costPriceAfterTaxMinor) : '',
      compareAtPriceBeforeTaxMinor: v.compareAtPriceBeforeTaxMinor != null ? String(v.compareAtPriceBeforeTaxMinor) : '',
      compareAtPriceAfterTaxMinor: v.compareAtPriceAfterTaxMinor != null ? String(v.compareAtPriceAfterTaxMinor) : v.price != null ? String(v.price) : '',
      sellingPriceBeforeTaxMinor: v.sellingPriceBeforeTaxMinor != null ? String(v.sellingPriceBeforeTaxMinor) : '',
      sellingPriceAfterTaxMinor: v.sellingPriceAfterTaxMinor != null ? String(v.sellingPriceAfterTaxMinor) : v.salePrice != null ? String(v.salePrice) : '',
      b2bWholesalePriceBeforeTax: v.b2bWholesalePriceBeforeTax != null ? String(v.b2bWholesalePriceBeforeTax) : '',
      b2bWholesalePriceAfterTax: v.b2bWholesalePriceAfterTax != null ? String(v.b2bWholesalePriceAfterTax) : '',
      weight: v.weight != null ? String(v.weight) : '',
      length: v.length != null ? String(v.length) : '',
      width: v.width != null ? String(v.width) : '',
      height: v.height != null ? String(v.height) : '',
    },
    sourceVariationUuid: uuid,
  };
};

export const skuPreviewResponseToAttributeDefs = (preview: SkuMatrixPreviewResponseDto): VariantAttributeDef[] =>
  preview.attributeOrder.map((id) => {
    const meta = preview.attributes[id];
    return { code: meta?.code ?? id, label: meta?.name ?? id };
  });

/** Tránh hiển thị ma trận preview cũ khi payload/thứ tục trục đã đổi (SWR hoặc held ref lệch request hiện tại). */
export const skuPreviewResponseMatchesRequest = (res: SkuMatrixPreviewResponseDto, req: SkuMatrixPreviewRequestDto): boolean => {
  const reqOrder = req.attributes.map((a) => a.attributeId);
  const { attributeOrder } = res;
  if (attributeOrder.length !== reqOrder.length) return false;
  return attributeOrder.every((id, i) => id === reqOrder[i]);
};

/** `attrId:valueUuid` từ `canonicalKey`, ký tự phân tách `|`. */
const parseCanonicalPairs = (canonicalKey: string): Map<string, string> => {
  const m = new Map<string, string>();
  for (const part of canonicalKey.split('|')) {
    const colon = part.indexOf(':');
    if (colon <= 0) continue;
    const attrId = part.slice(0, colon);
    const valueId = part.slice(colon + 1);
    if (attrId && valueId) m.set(attrId, valueId);
  }
  return m;
};

/** valueUuid theo thứ tự trục trong response (attributeOrder). */
export const valueUuidsFromCanonicalKey = (canonicalKey: string, attributeOrder: readonly string[]): string[] => {
  const pairs = parseCanonicalPairs(canonicalKey);
  return attributeOrder.map((id) => pairs.get(id)).filter((v): v is string => Boolean(v));
};

export const extractVariantsFromPreviewMatrix = (nodes: readonly SkuMatrixPreviewMatrixNode[]): SkuMatrixPreviewVariantCarryPayload[] => {
  const out: SkuMatrixPreviewVariantCarryPayload[] = [];

  const normalizeVariantDataCarry = (vd: unknown): unknown => {
    if (!vd || typeof vd !== 'object') return vd;
    const v = vd as Record<string, unknown>;
    if (typeof v.image === 'string' && v.image.trim()) return vd;

    const medias = v.medias;
    if (!Array.isArray(medias) || medias.length === 0) return vd;
    const first = medias[0] as Record<string, unknown> | null;
    const url = first && typeof first.url === 'string' ? first.url : '';
    if (!url.trim()) return vd;

    return { ...v, image: url };
  };

  const walk = (node: SkuMatrixPreviewMatrixNode) => {
    if (node.canonicalKey && (node.variantId || node.variantData)) {
      out.push({
        canonicalKey: node.canonicalKey,
        variantId: typeof node.variantId === 'string' ? node.variantId : undefined,
        variantData: node.variantData != null ? normalizeVariantDataCarry(node.variantData) : undefined,
      });
    }
    for (const c of node.children) walk(c);
  };

  for (const n of nodes) walk(n);
  return out;
};

const buildNormalizedFromCanonical = (
  canonicalKey: string,
  attributeOrder: readonly string[],
  attributes: Record<string, SkuMatrixPreviewMetaAttribute>,
  values: Record<string, SkuMatrixPreviewMetaValue>,
): NormalizedVariantRow | null => {
  const pairs = parseCanonicalPairs(canonicalKey);
  const rawKey = attributeOrder.map((attrId) => {
    const vid = pairs.get(attrId);
    const ac = attributes[attrId]?.code ?? '';
    if (!vid) return `${ac}:`;
    const vc = values[vid]?.code ?? '';
    return `${ac}:${vc}`;
  });
  const valuesByAttr = attributeOrder.map((attrId) => {
    const vid = pairs.get(attrId);
    return vid ? (values[vid]?.code ?? '') : '';
  });
  if (valuesByAttr.every((v) => !v.trim())) return null;
  return { rawKey, valuesByAttr };
};

const countLeavesUnder = (node: SkuMatrixPreviewMatrixNode, attrs: Record<string, SkuMatrixPreviewMetaAttribute>, vals: Record<string, SkuMatrixPreviewMetaValue>): number => {
  if (!node.children.length && node.canonicalKey) return 1;
  let n = 0;
  for (const c of node.children) n += countLeavesUnder(c, attrs, vals);
  return n;
};

export const flattenSkuPreviewMatrixForTable = (preview: SkuMatrixPreviewResponseDto, opts?: FlattenSkuPreviewMatrixOpts): VariantMatrixFlatRow[] => {
  const { attributeOrder: orderUuids, attributes: attrs, values: vals, matrix } = preview;
  const mediaByVariant = opts?.mediaUrlsByVariantId;
  const out: VariantMatrixFlatRow[] = [];

  const mediaUrlsFromVariantData = (variantData: unknown): string[] | undefined => {
    if (!variantData || typeof variantData !== 'object') return undefined;
    const v = variantData as Record<string, unknown>;

    const medias = v.medias;
    if (Array.isArray(medias) && medias.length > 0) {
      const urls = medias.map((m) => (m && typeof m === 'object' ? (m as Record<string, unknown>).url : undefined)).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
      if (urls.length) return urls;
    }

    const img = v.image;
    if (typeof img === 'string' && img.trim()) return [img];

    return undefined;
  };

  const appendPreviewLeaf = (depthGroup: number, rowId: string, label: string, norm: NormalizedVariantRow, leafIds: string[], vMeta: SkuMatrixPreviewMetaValue, node: SkuMatrixPreviewMatrixNode) => {
    const leafExtra = leafPrefillFromPreviewNode(node);
    const urls = (leafExtra.sourceVariationUuid ? mediaByVariant?.get(leafExtra.sourceVariationUuid) : undefined) ?? mediaUrlsFromVariantData(node.variantData);
    out.push({
      id: rowId,
      depth: depthGroup + 1,
      isGroup: false,
      label,
      pathValues: [...norm.valuesByAttr],
      leaf: norm,
      descendantLeafCount: 1,
      descendantRowCount: 0,
      variantThumbUrl: vMeta.image ?? null,
      leafAttributeValueUuids: leafIds,
      ...(urls?.length ? { leafMedias: urls } : {}),
      ...leafExtra,
    });
  };

  const walk = (nodes: readonly SkuMatrixPreviewMatrixNode[], depthGroup: number, pathCodes: readonly string[], pathValueUuids: readonly string[]) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const vMeta = vals[node.valueUuid];
      if (!vMeta) continue;
      const nextPath = [...pathCodes, vMeta.code];
      const branchValueUuids = [...pathValueUuids, node.valueUuid];

      if (node.children.length > 0) {
        out.push({
          id: `g:sku-prev:${branchValueUuids.join('|')}`,
          depth: depthGroup,
          isGroup: true,
          label: vMeta.name,
          pathValues: nextPath,
          descendantLeafCount: countLeavesUnder(node, attrs, vals),
          descendantRowCount: 0,
          variantThumbUrl: vMeta.image ?? null,
        });
        walk(node.children, depthGroup + 1, nextPath, branchValueUuids);
      } else if (node.canonicalKey) {
        const norm = buildNormalizedFromCanonical(node.canonicalKey, orderUuids, attrs, vals);
        const leafIds = valueUuidsFromCanonicalKey(node.canonicalKey, orderUuids);
        if (!norm) continue;

        const isTerminalBucket = nodes.every((n) => !n.children.length && Boolean(n.canonicalKey));
        const singleSibling = nodes.length === 1;

        if (isTerminalBucket && singleSibling) {
          const lastVal = [...norm.valuesByAttr].reverse().find((v) => v.trim()) ?? '';
          appendPreviewLeaf(depthGroup, `l:sku-prev:${node.canonicalKey}`, displayVariantToken(lastVal) || vMeta.name, norm, leafIds, vMeta, node);
          continue;
        }

        appendPreviewLeaf(depthGroup, `l:sku-prev:${node.canonicalKey}:${i}`, vMeta.name, norm, leafIds, vMeta, node);
      }
    }
  };

  walk(matrix, 0, [], []);

  for (const row of out) {
    if (!row.isGroup) continue;
    row.descendantRowCount = out.filter((r) => r.id !== row.id && isStrictDescendantPath(row.pathValues, r.pathValues)).length;
  }

  return out;
};
