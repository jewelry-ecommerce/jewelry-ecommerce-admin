import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode } from '@/common/config/app.config';
import type { AttributeRequestDto, QueryAttributeDto } from './attribute.interface';
import { mapAttribute, type WireAttribute } from './attribute-backend.mapper';
import { PIM_QUERY_POLICY } from '../pim.config';
import { categoryApi } from '../category/category.api';
import { AttributeStatus } from './attribute.enum';
export * from './attribute.enum';
export type * from './attribute.interface';
const ATTRIBUTE_PATH = 'admin/catalog/attributes';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Quản lý thuộc tính cần backend riêng ở chế độ HTTP.');
}
export const attributeApi = {
  async getAttributeTree(query:{categoryId:string;isPagination?:boolean}) {
    assertHttp();
    const [category,global]=await Promise.all([categoryApi.getCategoryDetail(query.categoryId),allAttributes({status:AttributeStatus.ACTIVE,isPagination:false})]);
    const selected=new Map([...global.list.filter(attribute=>attribute.isGlobal),...(category.effectiveAttributes??[])].map(attribute=>[attribute.id,attribute]));
    const list=[...selected.values()].filter(attribute=>attribute.status===AttributeStatus.ACTIVE && attribute.isVariantAxis)
      .sort((left,right)=>left.index-right.index).map(attribute=>({...attribute,children:attribute.values??[]}));
    return {list,total:list.length};
  },
  async postAttribute(input:AttributeRequestDto) {
    assertHttp(); return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH,'POST',input));
  },
  async putAttribute(id:string,input:AttributeRequestDto) {
    assertHttp(); return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH+'/'+id,'PUT',input));
  },
  async getAttributeDetail(id:string) {
    assertHttp(); return mapAttribute(await backendRequest<WireAttribute>(ATTRIBUTE_PATH+'/'+id));
  },
  async getAttributeList(query:Partial<QueryAttributeDto>) {
    assertHttp();
    if(query.isPagination === false) return allAttributes(query);
    return attributePage(query, Math.max(query.page??PIM_QUERY_POLICY.firstPage,PIM_QUERY_POLICY.firstPage));
  },
  async deleteAttribute(id:string) {
    assertHttp(); return backendRequest<{success:boolean}>(ATTRIBUTE_PATH+'/'+id,'DELETE');
  },
};
async function attributePage(query:Partial<QueryAttributeDto>,page:number) {
  const take=query.isPagination===false ? PIM_QUERY_POLICY.maximumTake : Math.min(Math.max(query.take??PIM_QUERY_POLICY.defaultTake,1),PIM_QUERY_POLICY.maximumTake);
  const params=new URLSearchParams({page:String(page),take:String(take)});
  if(query.search?.trim()) params.set('search',query.search.trim());
  if(query.status) params.set('status',query.status);
  const result=await backendRequest<{list:WireAttribute[];total:number}>(ATTRIBUTE_PATH+'?'+params);
  return {...result,list:result.list.map(mapAttribute)};
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
