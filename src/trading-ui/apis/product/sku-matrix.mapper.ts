
import type { SkuMatrixPreviewRequestDto, SkuMatrixPreviewResponseDto, SkuMatrixPreviewMatrixNode } from './product.interface';
import { numericEntityId } from './product-write.mapper';
interface WireMatrixNode {valueId:number;children:WireMatrixNode[];canonicalKey:string|null}
export interface WireMatrix {
  attributeOrder:number[];attributes:Record<string,{id:number;name:string;code:string}>;
  values:Record<string,{id:number;attributeId:number;name:string;code:string;image?:string}>;
  matrix:WireMatrixNode[];
}
export function matrixWrite(input:SkuMatrixPreviewRequestDto) {
  return {attributes:input.attributes.map(attribute=>({
    attributeId:numericEntityId(attribute.attributeId,'Thuộc tính'),
    valueIds:attribute.values.map(value=>numericEntityId(value.valueUuid,'Giá trị thuộc tính')),
  }))};
}
function matrixNode(node:WireMatrixNode):SkuMatrixPreviewMatrixNode {
  return {valueUuid:String(node.valueId),canonicalKey:node.canonicalKey,children:node.children.map(matrixNode)};
}
export function matrixView(matrix:WireMatrix):SkuMatrixPreviewResponseDto {
  return {attributeOrder:matrix.attributeOrder.map(String),
    attributes:Object.fromEntries(Object.entries(matrix.attributes).map(([key,attribute])=>[key,{uuid:String(attribute.id),name:attribute.name,code:attribute.code}])),
    values:Object.fromEntries(Object.entries(matrix.values).map(([key,value])=>[key,{...value,uuid:String(value.id),attributeId:String(value.attributeId)}])),
    matrix:matrix.matrix.map(matrixNode)};
}
