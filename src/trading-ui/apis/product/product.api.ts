
import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode, isJavaBackend } from '@/common/config/app.config';
import { mapProduct, type WireProduct } from './product-backend.mapper';
import type { ProductListResponseDto, ProductQuery } from './product.interface';
import { PIM_QUERY_POLICY } from '../pim.config';
import type { ProductCreateRequestDto, SkuMatrixPreviewRequestDto } from './product.interface';
import { productWrite } from './product-write.mapper';
import { matrixWrite, matrixView, type WireMatrix } from './sku-matrix.mapper';
import { type ProductSpuStatus } from './product.enum';
import { productFormSnapshot,type WireFormProduct } from './product-form.mapper';
import { javaProductList, javaGetProductForm, javaGetProductDetail, javaSaveProduct, javaProductStatus } from '@/apis/java/java-product.api';
import { javaMatrix } from '@/apis/java/java-matrix';
function assertHttp():void {
  if(getDataSourceMode() !== 'HTTP') throw new Error('Chọn sản phẩm cần backend riêng ở chế độ HTTP.');
}
export async function getAdminProductList(query:ProductQuery={}):Promise<ProductListResponseDto> {
  assertHttp();
  if (isJavaBackend()) return javaProductList(query);
  const params=new URLSearchParams({page:String(Math.max(query.page??1,1)),take:String(query.isPagination===false?PIM_QUERY_POLICY.maximumTake:query.take??PIM_QUERY_POLICY.defaultTake)});
  if(query.search?.trim()) params.set('search',query.search.trim());
  if(query.status && query.status!=='ALL') params.set('status',query.status);
  if(query.productIds?.length) params.set('productIds',Array.isArray(query.productIds)?query.productIds.join(','):query.productIds);
  const result=await backendRequest<{list:WireProduct[];total:number;counts:ProductListResponseDto['counts'];pagination:{page:number;take:number;hasNextPage:boolean}}>('admin/catalog/products?'+params);
  const {page,take,hasNextPage}=result.pagination;
  return {...result,list:result.list.map(mapProduct),pagination:{total:result.total,currentPage:page,totalPage:Math.ceil(result.total/take),
    nextPage:hasNextPage,previousPage:page>1,hasNextPage,hasPreviousPage:page>1}};
}
export const productApi={ getAdminProductList,
  async getProductForm(id:string) {
    assertHttp();if (isJavaBackend()) return javaGetProductForm(id);
    return productFormSnapshot(await backendRequest<WireFormProduct>('admin/catalog/products/'+id));
  },
  async putAdminProduct(id:string,input:ProductCreateRequestDto) {
    assertHttp();
    if (isJavaBackend()) return javaSaveProduct(input, id);
    return mapProduct(await backendRequest<WireProduct>('admin/catalog/products/'+id,'PUT',productWrite(input)));
  },
  async postAdminProduct(input:ProductCreateRequestDto) {
    assertHttp();
    if (isJavaBackend()) return javaSaveProduct(input);
    return mapProduct(await backendRequest<WireProduct>('admin/catalog/products','POST',productWrite(input)));
  },
  async patchAdminProductStatus(id:string,status:ProductSpuStatus) {
    assertHttp();
    if (isJavaBackend()) return javaProductStatus(id, status);
    return mapProduct(await backendRequest<WireProduct>('admin/catalog/products/'+id+'/status','PATCH',{status}));
  },
  async postSkuMatrixPreview(input:SkuMatrixPreviewRequestDto) {
    assertHttp();
    if (isJavaBackend()) return javaMatrix(input);
    return matrixView(await backendRequest<WireMatrix>('admin/catalog/sku-matrix/preview','POST',matrixWrite(input)));
  },
  async getProductDetail(id:string) {assertHttp();if (isJavaBackend()) return javaGetProductDetail(id);return mapProduct(await backendRequest<WireProduct>('admin/catalog/products/'+id));}
};
