import type { AttributeTreeItem } from '../../../../apis/attribute/attribute.entities';
import type { ProductAttributeCreateRequestDto, SkuMatrixPreviewRequestDto } from '../../../../apis/product/product.interface';
import type { AttributeTreeSelectOption } from '../../../../components/form/select-attribute-tree-input';
import type { AppliedAttributeSummary } from '../product-spu.interface';
import type { VariantAttributeDef } from '../product-spu.interface';

export const buildAttributeTreeSelectOptions = (tree: readonly AttributeTreeItem[]): AttributeTreeSelectOption[] => {
  const out: AttributeTreeSelectOption[] = [];
  for (const attr of tree) {
    const children = attr.children ?? [];
    if (!children.length) continue;
    out.push({ group: attr.id, value: attr.id, label: attr.name });
    for (const child of children) {
      out.push({ group: attr.id, value: `${attr.id}:${child.id}`, label: child.value });
    }
  }
  return out;
};

/** Các attribute có ít nhất một value lá được chọn — theo thứ tự `tree`. */
export const getActiveAttributeIdsInTreeOrder = (tree: readonly AttributeTreeItem[], selectedValues: readonly string[]): string[] => {
  const selected = new Set(selectedValues);
  return tree.filter((attr) => (attr.children ?? []).some((c) => selected.has(`${attr.id}:${c.id}`))).map((a) => a.id);
};

/** Giữ thứ tự kéo thả cũ, thêm attribute mới vào cuối. */
export const mergeOrderedAttributeIds = (previousOrdered: readonly string[], activeIds: readonly string[]): string[] => {
  const active = new Set(activeIds);
  const kept = previousOrdered.filter((id) => active.has(id));
  const added = activeIds.filter((id) => !kept.includes(id));
  return [...kept, ...added];
};

export const buildProductAttributeAssignmentsFromSelection = (tree: readonly AttributeTreeItem[], selectedValues: readonly string[]): ProductAttributeCreateRequestDto[] => {
  const selected = new Set(selectedValues);
  return tree
    .map((attr) => {
      const valueUuids = (attr.children ?? []).filter((c) => selected.has(`${attr.id}:${c.id}`)).map((c) => c.id);
      if (!valueUuids.length) return null;
      return { attributeUuid: attr.id, valueUuids };
    })
    .filter((x): x is ProductAttributeCreateRequestDto => Boolean(x));
};

export const buildAppliedSummariesOrdered = (tree: readonly AttributeTreeItem[], selectedValues: readonly string[], orderedAttributeIds: readonly string[]): AppliedAttributeSummary[] => {
  const selected = new Set(selectedValues);
  const byId = new Map(tree.map((a) => [a.id, a]));
  return orderedAttributeIds
    .map((id) => {
      const attr = byId.get(id);
      if (!attr) return null;
      const parts = (attr.children ?? []).filter((c) => selected.has(`${attr.id}:${c.id}`)).map((c) => c.value);
      if (!parts.length) return null;
      return { attributeId: id, label: attr.name, valuesText: parts.join(', ') };
    })
    .filter((x): x is AppliedAttributeSummary => Boolean(x));
};

export const orderedAttributeIdsToVariantAttributeDefs = (tree: readonly AttributeTreeItem[], orderedAttributeIds: readonly string[]): VariantAttributeDef[] => {
  const byId = new Map(tree.map((a) => [a.id, a]));
  return orderedAttributeIds
    .map((id) => {
      const attr = byId.get(id);
      if (!attr) return null;
      return { code: attr.code || id, label: attr.name };
    })
    .filter((x): x is VariantAttributeDef => Boolean(x));
};

export const buildSkuMatrixPreviewRequestDto = (orderedAttributeIds: readonly string[], assignments: readonly ProductAttributeCreateRequestDto[]): SkuMatrixPreviewRequestDto | null => {
  if (!orderedAttributeIds.length) return null;
  const byAttr = new Map(assignments.map((a) => [a.attributeUuid, a]));
  const attributes = orderedAttributeIds
    .map((attributeId) => {
      const a = byAttr.get(attributeId);
      if (!a?.valueUuids.length) return null;
      return {
        attributeId,
        values: a.valueUuids.map((valueUuid) => ({ valueUuid })),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (attributes.length !== orderedAttributeIds.length) return null;
  return { attributes };
};
