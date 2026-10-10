
import type { Product, ProductVariation, ProductCategorySummary } from './product.entities';
export type WireVariation = Omit<ProductVariation,'id'|'productId'|'medias'|'variationAttributeValues'> & {
  id:number;productId:number;medias?:{id:number;productVariationId:number;url:string;sortOrder:number}[];
};
export type WireProduct = Omit<Product,'id'|'categoryId'|'defaultVariationId'|'createdAt'|'updatedAt'|'variations'|'brandId'|'category'> & {
  id:number;categoryId:number;defaultVariationId:number|null;createdAt:string;updatedAt:string;variations:WireVariation[];
  category?:Omit<ProductCategorySummary,'id'|'parentId'|'taxRate'> & {id:number;parentId:number|null;taxRate:number};
};
function mapVariation(variation:WireVariation):ProductVariation {
  return {...variation,id:String(variation.id),productId:String(variation.productId),
    medias:variation.medias?.map(media=>({...media,id:String(media.id),productVariationId:String(media.productVariationId)}))};
}
export function mapProduct(product:WireProduct):Product {
  return {...product,id:String(product.id),brandId:null,categoryId:String(product.categoryId),
    defaultVariationId:product.defaultVariationId===null?null:String(product.defaultVariationId),
    createdAt:new Date(product.createdAt),updatedAt:new Date(product.updatedAt),
    variations:product.variations.map(mapVariation),skuCount:product.variations.length,
    category:product.category?{...product.category,id:String(product.category.id),
      parentId:product.category.parentId===null?null:String(product.category.parentId),taxRate:String(product.category.taxRate)}:undefined};
}
