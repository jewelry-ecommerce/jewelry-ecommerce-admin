
import { describe,it,expect } from 'vitest';
import { productFormSnapshot,hydrateProductMatrix,type WireFormProduct } from './product-form.mapper';
import { ProductSpuStatus,ProductSkuStatus } from './product.enum';
import { productWrite } from './product-write.mapper';
import { flattenSkuPreviewMatrixForTable } from '@/trading-ui/pages/product/product-spu/utils/product-spu-sku-matrix-preview.utils';
const product:WireFormProduct={
  id:12,categoryId:2,defaultVariationId:31,name:'Nhẫn bạc',spuCode:'RING',slug:'nhan-bac',status:ProductSpuStatus.DRAFT,
  createdAt:'2026-10-10T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z',unitOfMeasure:'EACH',taxRateOverride:0,
  variations:[{id:31,productId:12,skuCode:'RING-S',status:ProductSkuStatus.ACTIVE,price:'200000',salePrice:null,
    name:'Nhẫn bạc',slug:'nhan-bac',stock:5,attributeValueIds:[4],attributeValues:[{id:4,attribute:{id:3}}],
    medias:[{id:41,productVariationId:31,url:'http://localhost:8083/media/files/image.png',sortOrder:0}],
    sellingPriceAfterTaxMinor:200000,compareAtPriceAfterTaxMinor:250000,skuTaxRateOverride:0}],
};
describe('edit form hydration',()=>{
  it('keeps product/SKU IDs, explicit zero tax and image on save',()=>{
    const snapshot=productFormSnapshot(product),body=productWrite(snapshot.values);
    expect(snapshot.selected).toEqual(['3:4']);
    expect(body.skus[0].id).toBe(31);expect(body.skus[0].taxRateOverride).toBe(0);
    expect(body.skus[0].medias).toEqual([product.variations[0].medias?.[0].url]);
    expect(body.defaultSkuCode).toBe('RING-S');
  });
  it('hydrates matrix from saved SKU instead of sample price/media',()=>{
    const snapshot=productFormSnapshot(product);
    const matrix=hydrateProductMatrix({attributeOrder:['3'],attributes:{'3':{uuid:'3',name:'Size',code:'SIZE'}},
      values:{'4':{uuid:'4',attributeId:'3',name:'S',code:'S'}},matrix:[{valueUuid:'4',canonicalKey:'3:4',children:[]}]},snapshot);
    const rows=flattenSkuPreviewMatrixForTable(matrix,{mediaUrlsByVariantId:new Map([['31',snapshot.skus[0].medias]])});
    const leaf=rows.find(row=>row.leaf);
    expect(leaf?.sourceVariationUuid).toBe('31');expect(leaf?.prefillFromServer?.sellingPriceAfterTaxMinor).toBe('200000');
    expect(leaf?.leafMedias).toEqual(snapshot.skus[0].medias);
  });
});
