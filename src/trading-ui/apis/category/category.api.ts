
import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode } from '@/common/config/app.config';
import type { CategoryRequestDto, QueryCategoryTreeDto } from './category.interface';
import { mapCategory, type WireCategory } from './category-backend.mapper';
const CATEGORY_PATH='admin/catalog/categories';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Quản lý danh mục cần backend riêng ở chế độ HTTP.');
}
const bodyOf=(input:CategoryRequestDto)=>({...input,
  parentId:input.parentId?Number(input.parentId):null,directAttributeIds:input.directAttributeIds?.map(Number)});
export const categoryApi={
  async getCategoryTree(query:Partial<QueryCategoryTreeDto>={}) {
    assertHttp();
    const params=new URLSearchParams();
    if(query.status) params.set('status',query.status);
    return (await backendRequest<WireCategory[]>(CATEGORY_PATH+'/tree?'+params)).map(mapCategory);
  },
  async getCategoryDetail(id:string) {
    assertHttp();return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH+'/'+id));
  },
  async postCategory(input:CategoryRequestDto) {
    assertHttp();return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH,'POST',bodyOf(input)));
  },
  async patchCategory(id:string,input:CategoryRequestDto) {
    assertHttp();
    const current=await backendRequest<WireCategory>(CATEGORY_PATH+"/"+id);
    const body={...bodyOf(input),slug:current.slug,logo:input.logo??current.logo,image:input.image??current.image,
      metaTitle:input.metaTitle??current.metaTitle,metaDescription:input.metaDescription??current.metaDescription,metaKeywords:input.metaKeywords??current.metaKeywords};
    return mapCategory(await backendRequest<WireCategory>(CATEGORY_PATH+"/"+id,"PUT",body));
  },
  async deleteCategory(id:string) {
    assertHttp();return backendRequest<{success:boolean}>(CATEGORY_PATH+'/'+id,'DELETE');
  },
};
