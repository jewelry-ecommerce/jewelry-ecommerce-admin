
import type { ProductCreateRequestDto, ProductSkuUpsertRequestDto } from './product.interface';
export function numericEntityId(value:string|undefined, field:string):number {
  const id=Number(value);
  if(!Number.isSafeInteger(id)||id<1) throw new Error(field+' phải là ID số nguyên dương.');
  return id;
}
function skuWrite(sku:ProductSkuUpsertRequestDto) {
  return {
    id:sku.uuid?numericEntityId(sku.uuid,'SKU'):undefined,
    skuCode:sku.skuCode,status:sku.status,attributeValueIds:sku.attributeValueUuids.map(value=>numericEntityId(value,'Giá trị thuộc tính')),
    medias:sku.medias,sellingPriceAfterTaxMinor:sku.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor:sku.compareAtPriceAfterTaxMinor,costPriceAfterTaxMinor:sku.costPriceAfterTaxMinor,
    b2bWholesalePriceAfterTax:sku.b2bWholesalePriceAfterTax,taxRateOverride:sku.taxRateOverride,
    weight:sku.weight,length:sku.length,width:sku.width,height:sku.height,
  };
}
export function productWrite(input:ProductCreateRequestDto) {
  return {
    spuCode:input.spuCode,name:input.name,categoryId:numericEntityId(input.categoryUuid,'Danh mục'),
    unitOfMeasure:input.unitOfMeasure,taxRateOverride:input.taxRateOverride,description:input.description,
    defaultSkuCode:input.defaultSkuCode?.trim()||input.skus[0]?.skuCode||'',
    weight:input.weight,length:input.length,width:input.width,height:input.height,
    metaTitle:input.metaTitle,metaDescription:input.metaDescription,metaKeywords:input.metaKeywords,
    attributes:input.attributes.map(attribute=>({attributeId:numericEntityId(attribute.attributeUuid,'Thuộc tính'),
      valueIds:attribute.valueUuids.map(value=>numericEntityId(value,'Giá trị thuộc tính'))})),
    skus:input.skus.map(skuWrite),
    productInfos:input.productInfos?.map((info,sortOrder)=>({...info,sortOrder})),
    productMixMatch:input.productMixMatch?.map(value=>numericEntityId(value,'Sản phẩm mua kèm')),
  };
}
