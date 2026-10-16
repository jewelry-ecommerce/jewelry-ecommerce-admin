
import { backendRequest } from '@/apis/backend-request';
import * as referenceApi from './product-reference.api';
import { productApi as javaApi } from './product.api';
import type { Product } from './product.entities';
import type { AdminProductDetailDto } from './product.interface';
import type { ProductMutationResponseDto,ProductCreateRequestDto,ProductPatchRequestDto,ProductPatchStatusRequestDto } from './product.interface';
import { ProductSkuStatus } from './product.enum';
import { javaSubmitProduct } from '@/apis/java/java-product-approval.api';
function mutation(product:Product):ProductMutationResponseDto{
  return {uuid:product.id,status:product.status,approval:product.approval??undefined,hasPendingApproval:product.hasPendingApproval??false};
}
async function postAdminProduct(input:ProductCreateRequestDto){return mutation(await javaApi.postAdminProduct(input));}
async function patchAdminProductStatus(id:string,body:ProductPatchStatusRequestDto){return mutation(await javaApi.patchAdminProductStatus(id,body.status));}
async function patchAdminProduct(id:string,body:ProductPatchRequestDto){
  const current=await javaApi.getProductForm(id);
  const updates=new Map((body.skus?.upsert??[]).map(sku=>[sku.uuid??sku.skuCode,sku]));
  const skus=current.skus.map(sku=>({...sku,...updates.get(sku.uuid??sku.skuCode),
    status:body.skus?.disable?.includes(sku.uuid??'')?ProductSkuStatus.INACTIVE:body.skus?.enable?.includes(sku.uuid??'')?ProductSkuStatus.ACTIVE:sku.status}));
  for(const sku of updates.values())if(!skus.some(current=>sku.uuid?current.uuid===sku.uuid:current.skuCode===sku.skuCode))skus.push(sku);
  const input:ProductCreateRequestDto={...current.values,...body,seasonUuid:body.seasonUuid===undefined?current.values.seasonUuid:body.seasonUuid??undefined,skus};
  return mutation(await javaApi.putAdminProduct(id,input));
}
async function getAdminProductDetail(id:string):Promise<AdminProductDetailDto>{
  const product=await javaApi.getProductDetail(id);
  const {productMixMatch,...detail}=product;
  const matches=await Promise.all((productMixMatch??[]).map(async relatedId=>{
    const related=await javaApi.getProductDetail(relatedId);
    return {id:related.id,name:related.name,spuCode:related.spuCode};
  }));
  return {...detail,productMixMatch:matches};
}
async function deleteAdminProduct(id:string):Promise<void>{await backendRequest('admin/catalog/products/'+id,'DELETE');}
export const productSourceApi={...referenceApi,deleteAdminProduct,getAdminProductList:javaApi.getAdminProductList,getAdminProductDetail,
  getAdminVariationListByProduct:async(id:string)=>{const variations=(await javaApi.getProductDetail(id)).variations??[];return {list:variations,total:variations.length};},
  postAdminProduct,patchAdminProduct,patchAdminProductStatus,postSkuMatrixPreview:javaApi.postSkuMatrixPreview,
  postAdminProductSubmit:javaSubmitProduct};
