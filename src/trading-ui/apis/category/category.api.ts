
import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode, isJavaBackend } from '@/common/config/app.config';
import type { Category } from './category.entities';
import type { QueryCategoryDto, CategoryRequestDto, QueryCategoryTreeDto } from './category.interface';
import { mapCategory, type WireCategory } from './category-backend.mapper';
import { javaCategoryTree, javaCategoryDetail, javaSaveCategory } from '@/apis/java/java-taxonomy.api';
const CATEGORY_PATH='admin/catalog/categories';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Quản lý danh mục cần backend riêng ở chế độ HTTP.');
}
const bodyOf=(input:CategoryRequestDto)=>({...input,
  parentId:input.parentId?Number(input.parentId):null,directAttributeIds:input.directAttributeIds?.map(Number)});
function flattenCategories(categories:Category[]):Category[]{
  return categories.flatMap(category=>[category,...flattenCategories(category.children??[])]);
}
export const categoryApi={
  async getCategoryList(query:Partial<QueryCategoryDto>={}) {
    const tree=await categoryApi.getCategoryTree({status:query.status});
    const search=query.search?.toLowerCase();
    const matches=flattenCategories(tree).filter(category=>(!search||category.name.toLowerCase().includes(search))&&(!query.parentId||category.parentId===query.parentId));
    const page=query.page??1,take=query.take??20;
    return {list:query.isPagination===false?matches:matches.slice((page-1)*take,page*take),total:matches.length};
  },
  async getCategoryTree(query:Partial<QueryCategoryTreeDto>={}) {
    assertHttp();
    if (isJavaBackend()) return javaCategoryTree(query.status);
    const params=new URLSearchParams();
    if(query.status) params.set('status',query.status);
    return (await backendRequest<WireCategory[]>(CATEGORY_PATH+'/tree?'+params)).map(mapCategory);
  },
  async getCategoryDetail(id:string) {
    assertHttp();if (isJavaBackend()) return javaCategoryDetail(id);return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH+'/'+id));
  },
  async postCategory(input:CategoryRequestDto) {
    assertHttp();if (isJavaBackend()) return javaSaveCategory(input);return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH,'POST',bodyOf(input)));
  },
  async patchCategory(id:string,input:CategoryRequestDto) {
    assertHttp();
    if (isJavaBackend()) return javaSaveCategory(input, id);
    const current=await backendRequest<WireCategory>(CATEGORY_PATH+"/"+id);
    const body={...bodyOf(input),slug:current.slug,logo:input.logo??current.logo,image:input.image??current.image,
      metaTitle:input.metaTitle??current.metaTitle,metaDescription:input.metaDescription??current.metaDescription,metaKeywords:input.metaKeywords??current.metaKeywords};
    return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH+"/"+id,"PUT",body));
  },
  async deleteCategory(id:string) {
    assertHttp();await backendRequest<void>(CATEGORY_PATH+'/'+id,'DELETE');return {success:true};
  },
};
