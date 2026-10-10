
import type { ProductCreateRequestDto,ProductSkuUpsertRequestDto,SkuMatrixPreviewResponseDto,SkuMatrixPreviewMatrixNode } from './product.interface';
import type { WireProduct,WireVariation } from './product-backend.mapper';
import { ProductUnitOfMeasure } from './product.enum';
export interface WireFormVariation extends WireVariation {attributeValueIds:number[];attributeValues:{id:number;attribute:{id:number}}[]}
export interface WireFormProduct extends Omit<WireProduct,'variations'|'productMixMatch'> {variations:WireFormVariation[];productMixMatch?:number[]}
export interface ProductFormSnapshot {id:string;status:WireProduct['status'];values:ProductCreateRequestDto;skus:ProductSkuUpsertRequestDto[];selected:string[]}
function formSku(sku:WireFormVariation):ProductSkuUpsertRequestDto {
  return {uuid:String(sku.id),skuCode:sku.skuCode,status:sku.status,medias:(sku.medias??[]).map(media=>media.url),
    attributeValueUuids:sku.attributeValueIds.map(String),sellingPriceAfterTaxMinor:sku.sellingPriceAfterTaxMinor??undefined,
    compareAtPriceAfterTaxMinor:sku.compareAtPriceAfterTaxMinor,costPriceAfterTaxMinor:sku.costPriceAfterTaxMinor,
    taxRateOverride:sku.skuTaxRateOverride,b2bWholesalePriceAfterTax:sku.b2bWholesalePriceAfterTax??undefined,
    weight:sku.weight??undefined,length:sku.length??undefined,width:sku.width??undefined,height:sku.height??undefined};
}
export function productFormSnapshot(product:WireFormProduct):ProductFormSnapshot {
  const attributes=new Map<string,Set<string>>();
  for(const sku of product.variations) for(const value of sku.attributeValues) {
    const key=String(value.attribute.id),values=attributes.get(key)??new Set<string>();
    values.add(String(value.id));attributes.set(key,values);
  }
  const skus=product.variations.map(formSku);
  return {id:String(product.id),status:product.status,skus,
    selected:[...attributes].flatMap(([id,values])=>[...values].map(value=>id+':'+value)),
    values:{spuCode:product.spuCode,name:product.name,categoryUuid:String(product.categoryId),
      unitOfMeasure:Object.values(ProductUnitOfMeasure).find(unit=>unit===product.unitOfMeasure),taxRateOverride:product.taxRateOverride,description:product.description??undefined,
      weight:product.weight??undefined,length:product.length??undefined,width:product.width??undefined,height:product.height??undefined,
      metaTitle:product.metaTitle??'',metaDescription:product.metaDescription??'',metaKeywords:product.metaKeywords??'',
      defaultSkuCode:product.variations.find(sku=>sku.id===product.defaultVariationId)?.skuCode,
      productInfos:product.productInfos?.map(info=>({...info,description:info.description??''})),
      productMixMatch:product.productMixMatch?.map(String),
      attributes:[...attributes].map(([attributeUuid,values])=>({attributeUuid,valueUuids:[...values]})),skus}};
}
function sameValues(left:readonly string[],right:readonly string[]):boolean {
  return left.length===right.length && left.every(value=>right.includes(value));
}
export function hydrateProductMatrix(matrix:SkuMatrixPreviewResponseDto,snapshot:ProductFormSnapshot|undefined):SkuMatrixPreviewResponseDto {
  if(!snapshot) return matrix;
  const walk=(node:SkuMatrixPreviewMatrixNode,path:string[]):SkuMatrixPreviewMatrixNode=>{
    const values=[...path,node.valueUuid];
    const sku=node.children.length?undefined:snapshot.skus.find(sku=>sameValues(sku.attributeValueUuids,values));
    return {...node,children:node.children.map(child=>walk(child,values)),variantId:sku?.uuid,
      variantData:sku?{...sku,uuid:sku.uuid,skuTaxRateOverride:sku.taxRateOverride}:undefined};
  };
  return {...matrix,matrix:matrix.matrix.map(node=>walk(node,[]))};
}
