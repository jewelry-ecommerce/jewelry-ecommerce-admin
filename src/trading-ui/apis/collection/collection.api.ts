
import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode, isJavaBackend } from '@/common/config/app.config';
import { mapCollection, type WireCollection } from './collection-backend.mapper';
import type { CreateCollectionDto, UpdateCollectionDto, QueryCollectionDto, UpdateCollectionByProductIdDto } from './collection.interface';
import { UpdateCollectionAction } from './collection.enum';
import { readCollectionList } from './collection-query.api';
import { javaSaveCollection, javaCollectionDetail, javaCollectionList, javaUpdateMembership } from '@/apis/java/java-collection.api';
const COLLECTION_PATH='admin/catalog/collections';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Quản lý bộ sưu tập cần backend riêng ở chế độ HTTP.');
}
function writeBody(input:CreateCollectionDto) {
  return {name:input.name,slug:input.slug,description:input.description,image:input.image,status:input.status,productIds:input.productIds?.map(Number)};
}
async function rawDetail(id:string):Promise<WireCollection> {assertHttp();return backendRequest(COLLECTION_PATH+'/'+id);}
async function update(id:string,input:UpdateCollectionDto) {
  if (isJavaBackend()) return javaSaveCollection(input, id);
  const current=await rawDetail(id);
  const body=writeBody({...current,...input,productIds:input.productIds??current.productIds.map(String)});
  return mapCollection(await backendRequest<WireCollection>(COLLECTION_PATH+'/'+id,'PUT',body));
}
export const collectionApi={
  async createCollection(input:CreateCollectionDto) {
    assertHttp();if (isJavaBackend()) return javaSaveCollection(input);return mapCollection(await backendRequest<WireCollection>(COLLECTION_PATH,'POST',writeBody(input)));
  },
  updateCollection:update,
  async getCollectionDetail(id:string) {if (isJavaBackend()) return javaCollectionDetail(id);return mapCollection(await rawDetail(id));},
  async deleteCollection(id:string) {assertHttp();await backendRequest<void>(COLLECTION_PATH+'/'+id,'DELETE');return {success:true};},
  async getCollectionList(query:Partial<QueryCollectionDto>={}) {
    assertHttp();
    return isJavaBackend() ? javaCollectionList(query) : readCollectionList(query);
  },
  async updateCollectionByProductId(id:string,input:UpdateCollectionByProductIdDto) {
    if (isJavaBackend()) return javaUpdateMembership(id, input);
    const current=await rawDetail(id),ids=current.productIds.map(String),selected=input.productIds??[];
    const productIds=input.action===UpdateCollectionAction.ADD?[...new Set([...ids,...selected])]
      :input.action===UpdateCollectionAction.REMOVE?ids.filter(productId=>!selected.includes(productId))
      :ids.map(productId=>productId===selected[0]?(selected[1]??productId):productId);
    return update(id,{productIds});
  },
};
