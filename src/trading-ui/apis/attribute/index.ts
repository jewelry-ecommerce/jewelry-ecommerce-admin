import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode, isJavaBackend } from '@/common/config/app.config';
import type { Attribute } from './attribute.entities';
import type { AttributeRequestDto, QueryAttributeDto,CreateAttributeValueDto,UpdateAttributeValueDto } from './attribute.interface';
import { mapAttribute, type WireAttribute } from './attribute-backend.mapper';
import { PIM_QUERY_POLICY } from '../pim.config';
import { categoryApi } from '../category/category.api';
import { AttributeStatus } from './attribute.enum';
export * from './attribute.enum';
export type * from './attribute.interface';
import { javaAttributes, javaAttributeDetail, javaAttributeTree, javaSaveAttribute } from '@/apis/java/java-taxonomy.api';
const ATTRIBUTE_PATH = 'admin/catalog/attributes';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Quản lý thuộc tính cần backend riêng ở chế độ HTTP.');
}
function attributeWrite(current:Attribute):AttributeRequestDto{
  return {name:current.name,code:current.code,displayType:current.displayType,status:current.status,isVariantAxis:current.isVariantAxis,values:(current.values??[]).map(value=>({id:value.id,code:value.code,value:value.value,image:value.image??undefined}))};
}
export const attributeApi = {
  async patchAttribute(id:string,input:Partial<AttributeRequestDto>){
    const current=attributeWrite(await attributeApi.getAttributeDetail(id));
    return attributeApi.putAttribute(id,{...current,...input});
  },
  async deleteAttributeValue(attributeId:string,valueId:string){
    const current=await attributeApi.getAttributeDetail(attributeId);
    return attributeApi.putAttribute(attributeId,{...attributeWrite(current),values:(current.values??[]).filter(value=>value.id!==valueId).map(value=>({...value,image:value.image??undefined}))});
  },
  async patchAttributeValue(attributeId:string,valueId:string,input:UpdateAttributeValueDto){
    const current=await attributeApi.getAttributeDetail(attributeId);
    return attributeApi.putAttribute(attributeId,{...attributeWrite(current),values:(current.values??[]).map(value=>({...value,image:value.image??undefined,...(value.id===valueId?input:{})}))});
  },
  async postAttributeValue(attributeId:string,input:CreateAttributeValueDto){
    const current=attributeWrite(await attributeApi.getAttributeDetail(attributeId));
    return attributeApi.putAttribute(attributeId,{...current,values:[...current.values,input]});
  },
  async getAttributeTree(query:{categoryId:string;isPagination?:boolean}) {
    assertHttp();
    if (isJavaBackend()) return javaAttributeTree(query.categoryId);
    const [category,global]=await Promise.all([categoryApi.getCategoryDetail(query.categoryId),allAttributes({status:AttributeStatus.ACTIVE,isPagination:false})]);
    const selected=new Map([...global.list.filter(attribute=>attribute.isGlobal),...(category.effectiveAttributes??[])].map(attribute=>[attribute.id,attribute]));
    const list=[...selected.values()].filter(attribute=>attribute.status===AttributeStatus.ACTIVE && attribute.isVariantAxis)
      .sort((left,right)=>left.index-right.index).map(attribute=>({...attribute,children:attribute.values??[]}));
    return {list,total:list.length};
  },
  async postAttribute(input:AttributeRequestDto) {
    assertHttp(); if (isJavaBackend()) return javaSaveAttribute(input);return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH,'POST',input));
  },
  async putAttribute(id:string,input:AttributeRequestDto) {
    assertHttp(); if (isJavaBackend()) return javaSaveAttribute(input,id);return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH+'/'+id,'PUT',input));
  },
  async getAttributeDetail(id:string) {
    assertHttp(); if (isJavaBackend()) return javaAttributeDetail(id);return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH+'/'+id));
  },
  async getAttributeList(query:Partial<QueryAttributeDto>) {
    assertHttp();
    if (isJavaBackend()) {const result=await javaAttributes(query);return {...result,pagination:{total:result.total}};}
    if(query.isPagination === false) return allAttributes(query);
    return attributePage(query, Math.max(query.page??PIM_QUERY_POLICY.firstPage,PIM_QUERY_POLICY.firstPage));
  },
  async deleteAttribute(id:string) {
    assertHttp();await backendRequest<void>(ATTRIBUTE_PATH+'/'+id,'DELETE');return {success:true};
  },
};
async function attributePage(query:Partial<QueryAttributeDto>,page:number) {
  const take=query.isPagination===false ? PIM_QUERY_POLICY.maximumTake : Math.min(Math.max(query.take??PIM_QUERY_POLICY.defaultTake,1),PIM_QUERY_POLICY.maximumTake);
  const params=new URLSearchParams({page:String(page),take:String(take)});
  if(query.search?.trim()) params.set('search',query.search.trim());
  if(query.status) params.set('status',query.status);
  const result=await backendRequest<{list:WireAttribute[];total:number}>(ATTRIBUTE_PATH+'?'+params);
  return {...result,pagination:{total:result.total},list:result.list.map(mapAttribute)};
}
async function allAttributes(query:Partial<QueryAttributeDto>) {
  const result=await attributePage(query,PIM_QUERY_POLICY.firstPage);
  for(let page=PIM_QUERY_POLICY.firstPage+1;result.list.length<result.total;page++) {
    const next=await attributePage(query,page);
    if(!next.list.length) break;
    result.list.push(...next.list);
  }
  return result;
}
