import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode } from '@/common/config/app.config';
import { numericEntityId } from './product-write.mapper';
export interface WmsSkuSearchListItem {
  id:string;skuCode:string;name:string;slug:string;image:string|null;stock:number;
  product:{id:string;name:string};medias:{url:string}[];
}
interface WireSku extends Omit<WmsSkuSearchListItem,'id'|'product'> {id:number;product:{id:number;name:string}}
export interface SkuPickerQuery {
  search?:string;page?:number;take?:number;isPagination?:boolean;
  orderBy?:'updatedAt'|'skuCode';orderType?:'ASC'|'DESC';categoryIds?:string[];collectionIds?:string[];
}
interface SkuPage {list:WireSku[];total:number;pagination:{
  page:number;take:number;itemCount:number;pageCount:number;hasNextPage:boolean;hasPreviousPage:boolean;
}}
export async function getAdminSkus(query:SkuPickerQuery={}) {
  if(getDataSourceMode()!=='HTTP') throw new Error('Bộ chọn SKU cần backend riêng ở chế độ HTTP.');
  const params=new URLSearchParams();
  for(const key of ['search','page','take','orderBy','orderType'] as const)
    if(query[key]!==undefined&&query[key]!=='') params.set(key,String(query[key]));
  for(const key of ['categoryIds','collectionIds'] as const)
    if(query[key]?.length) params.set(key,query[key].map(id=>numericEntityId(id,key)).join(','));
  const result=await backendRequest<SkuPage>('admin/catalog/skus?'+params);
  return {...result,list:result.list.map(sku=>({...sku,id:String(sku.id),product:{...sku.product,id:String(sku.product.id)}}))};
}
export const searchAdminSkus=getAdminSkus;
