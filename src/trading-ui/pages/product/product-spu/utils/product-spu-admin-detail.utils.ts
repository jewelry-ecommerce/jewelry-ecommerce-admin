import type { AdminProductDetailDto, ProductAttributeCreateRequestDto } from '../../../../apis/product/product.interface';
import type { AppliedAttributeSummary } from '../product-spu.interface';

export const selectedAttributeKeysFromProductDetail = (detail: AdminProductDetailDto): string[] => {
  const out = new Set<string>();
  for (const row of detail.variations ?? []) {
    for (const link of row.variationAttributeValues ?? []) {
      const aid = link.attributeValue?.attributeId;
      if (aid && link.attributeValueId) out.add(`${aid}:${link.attributeValueId}`);
    }
  }
  return [...out];
};

export const buildProductAttributeAssignmentsFromDetail = (detail: AdminProductDetailDto): ProductAttributeCreateRequestDto[] => {
  const map = new Map<string, Set<string>>();
  for (const row of detail.variations ?? []) {
    for (const link of row.variationAttributeValues ?? []) {
      const aid = link.attributeValue?.attributeId;
      if (!aid || !link.attributeValueId) continue;
      if (!map.has(aid)) map.set(aid, new Set());
      map.get(aid)!.add(link.attributeValueId);
    }
  }
  return [...map.entries()].map(([attributeUuid, set]) => ({ attributeUuid, valueUuids: [...set] }));
};

export const orderedAttributeIdsFromProductDetail = (detail: AdminProductDetailDto): string[] => {
  const vm = detail.variantMatrix;
  if (vm?.attributeOrder?.length) return [...vm.attributeOrder];
  if (detail.variantAttributeOrder?.length) return [...detail.variantAttributeOrder];
  return buildProductAttributeAssignmentsFromDetail(detail).map((a) => a.attributeUuid);
};

export const buildAppliedSummariesFromVariantMatrixDetail = (detail: AdminProductDetailDto): AppliedAttributeSummary[] => {
  const vm = detail.variantMatrix;
  if (!vm) return [];
  const order = orderedAttributeIdsFromProductDetail(detail);
  const selectedByAttr = new Map<string, Set<string>>();
  for (const key of selectedAttributeKeysFromProductDetail(detail)) {
    const colon = key.indexOf(':');
    if (colon <= 0) continue;
    const attrId = key.slice(0, colon);
    const vid = key.slice(colon + 1);
    if (!selectedByAttr.has(attrId)) selectedByAttr.set(attrId, new Set());
    selectedByAttr.get(attrId)!.add(vid);
  }
  return order
    .map((attrId) => {
      const meta = vm.attributes[attrId];
      const ids = selectedByAttr.get(attrId);
      if (!meta || !ids?.size) return null;
      const parts = [...ids].map((vid) => vm.values[vid]?.name ?? vid);
      return { attributeId: attrId, label: meta.name, valuesText: parts.join(', ') };
    })
    .filter((x): x is AppliedAttributeSummary => Boolean(x));
};
