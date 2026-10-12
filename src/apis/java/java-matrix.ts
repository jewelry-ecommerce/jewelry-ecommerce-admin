
import type { SkuMatrixPreviewRequestDto, SkuMatrixPreviewResponseDto, SkuMatrixPreviewMatrixNode } from '@/trading-ui/apis/product/product.interface';
import { javaAttributeDetail } from './java-taxonomy.api';
export async function javaMatrix(input: SkuMatrixPreviewRequestDto): Promise<SkuMatrixPreviewResponseDto> {
  const definitions = await Promise.all(input.attributes.map(attribute => javaAttributeDetail(attribute.attributeId)));
  const attributes: SkuMatrixPreviewResponseDto['attributes'] = {}, values: SkuMatrixPreviewResponseDto['values'] = {};
  for (const definition of definitions) {
    attributes[definition.id] = { uuid: definition.id, name: definition.name, code: definition.code };
    for (const value of definition.values ?? []) values[value.id] = {
      uuid: value.id, attributeId: definition.id, name: value.value, code: value.code };
  }
  function nodes(depth: number, selected: string[]): SkuMatrixPreviewMatrixNode[] {
    const attribute = input.attributes[depth];
    if (!attribute) return [];
    return attribute.values.map(value => {
      if (!values[value.valueUuid]) throw new Error('Giá trị thuộc tính đã thay đổi, chọn lại thuộc tính.');
      const path = [...selected, value.valueUuid], children = nodes(depth + 1, path);
      return { valueUuid: value.valueUuid, children, canonicalKey: children.length ? null : path.join('|') };
    });
  }
  return { attributeOrder: definitions.map(attribute => attribute.id), attributes, values, matrix: nodes(0, []) };
}
