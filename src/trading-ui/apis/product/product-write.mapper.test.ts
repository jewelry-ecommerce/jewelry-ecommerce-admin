
import { describe,it,expect } from 'vitest';
import { productWrite,numericEntityId } from './product-write.mapper';
import { ProductSkuStatus } from './product.enum';
describe('product form backend payload',()=>{
  it('sends numeric IDs and omits company-only fields',()=>{
    const body=productWrite({spuCode:'RING',name:'Nhẫn',categoryUuid:'12',seasonUuid:'',brandId:'company-brand',
      attributes:[{attributeUuid:'3',valueUuids:['4']}],skus:[{skuCode:'RING-4',status:ProductSkuStatus.ACTIVE,
        sellingPriceAfterTaxMinor:200000,attributeValueUuids:['4'],medias:['http://localhost:8083/media/image']}],
      productInfos:[{title:'Chi tiết',description:'Nội dung',sortOrder:9}]});
    expect(body.categoryId).toBe(12);expect(body.attributes).toEqual([{attributeId:3,valueIds:[4]}]);
    expect(body.skus[0].attributeValueIds).toEqual([4]);expect(body.defaultSkuCode).toBe('RING-4');
    expect(body.productInfos?.[0].sortOrder).toBe(0);
    expect(body).not.toHaveProperty('seasonUuid');expect(body).not.toHaveProperty('brandId');
  });
  it('rejects UUID and unsafe IDs instead of silently casting',()=>{
    expect(()=>numericEntityId('uuid','ID')).toThrow();expect(()=>numericEntityId('9007199254740992','ID')).toThrow();
  });
});
