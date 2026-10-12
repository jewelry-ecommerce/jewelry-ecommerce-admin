
import { beforeEach, expect, test, vi } from 'vitest';
import { CollectionStatus,UpdateCollectionAction } from './collection.enum';
import type { WireCollection } from './collection-backend.mapper';
const request=vi.hoisted(()=>vi.fn());
vi.mock('@/apis/backend-request',()=>({backendRequest:request}));
vi.mock('@/common/config/app.config',()=>({getDataSourceMode:()=> 'HTTP', isJavaBackend:()=>false}));
import { collectionApi } from './collection.api';
const current:WireCollection={id:5,name:'Collection',slug:'collection',description:'Description',status:CollectionStatus.ACTIVE,
  createdAt:'2026-10-10T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z',productIds:[11],productCollections:[]};
beforeEach(()=>request.mockReset());
test('collection create sends numeric product IDs, not UUID UI keys',async()=>{
  request.mockResolvedValue(current);
  await collectionApi.createCollection({name:'Collection',status:CollectionStatus.ACTIVE,productIds:['11']});
  expect(request.mock.calls[0][2].productIds).toEqual([11]);
});
test('adding a product preserves collection metadata and existing membership',async()=>{
  request.mockResolvedValue(current);
  await collectionApi.updateCollectionByProductId('5',{action:UpdateCollectionAction.ADD,productIds:['12']});
  const write=request.mock.calls.find(call=>call[1]==='PUT');
  expect(write?.[2]).toMatchObject({name:'Collection',slug:'collection',description:'Description',productIds:[11,12]});
});
test('removing a product only removes selected membership',async()=>{
  request.mockResolvedValue(current);
  await collectionApi.updateCollectionByProductId('5',{action:UpdateCollectionAction.REMOVE,productIds:['11']});
  expect(request.mock.calls.find(call=>call[1]==='PUT')?.[2].productIds).toEqual([]);
});
