import { beforeEach, expect, test, vi } from 'vitest';
const transport=vi.hoisted(()=>({request:vi.fn(),detail:vi.fn()}));
vi.mock('@/apis/backend-request',()=>({backendRequest:transport.request}));
vi.mock('@/apis/java/java-product.api',()=>({javaRawProduct:transport.detail}));
import { getJavaOrderProducts,getJavaOrderProductDetail,getJavaOrderProductVariations } from './order-java-catalog.adapter';

const product={id:5,name:'Ring',slug:'ring',categoryName:'Rings',thumbnailUrl:'/ring.png',
  skus:[{id:8,name:'Ring S',skuCode:'R-S',status:'PUBLISHED',listPrice:200000,salePrice:150000,availableStock:3,
    attributeBindings:[{id:6,name:'Size',code:'SIZE',type:'SELECT',value:'S'}]},
    {id:9,name:'Ring M',skuCode:'R-M',status:'ARCHIVED',listPrice:100000,salePrice:null,availableStock:4,attributeBindings:[]}],
  media:[{id:7,skuId:8,url:'/ring-s.png',sortOrder:0,type:'IMAGE'}]};
beforeEach(()=>{transport.request.mockReset();transport.detail.mockReset().mockResolvedValue(product);});

test('order picker uses actual published SKU price/stock and excludes archived SKU from totals',async()=>{
  transport.request.mockResolvedValue({list:[product],total:1});
  const result=await getJavaOrderProducts({page:1,take:20,search:'ring'});
  expect(transport.request).toHaveBeenCalledWith('admin/catalog/products?page=1&take=20&status=PUBLISHED&search=ring');
  expect(result.list[0]).toMatchObject({id:'5',cheapestVariationId:'8',totalVariations:1,totalSellableStock:3,minSellingPriceAfterTaxMinor:150000});
});

test('detail preserves SKU identities and actual stock for stock checks',async()=>{
  const result=await getJavaOrderProductDetail('5');
  expect(result.variations[0]).toMatchObject({id:'8',skuCode:'R-S',stockQuantity:3,salePrice:150000,imageUrl:'/ring-s.png'});
});

test('variation list maps media and attribute binding without invented dimensions',async()=>{
  const result=await getJavaOrderProductVariations('5');
  expect(result[0].medias).toEqual([{url:'/ring-s.png',sortOrder:0}]);
  expect(result[0].attributes[0]).toMatchObject({attributeCode:'SIZE',value:'S'});
  expect(result[0].lengthCm).toBeUndefined();
});
