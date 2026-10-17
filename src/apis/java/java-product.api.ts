
import { backendRequest } from '../backend-request';
import { JAVA_CATALOG_PATH, JAVA_PAGE_POLICY, decodeOption, type JavaProduct, type JavaPage, type JavaMedia } from './java-catalog.types';
import { javaProductView, javaProductForm } from './java-product.mapper';
import { javaAttributes } from './java-taxonomy.api';
import { ProductSpuStatus, ProductSkuStatus } from '@/trading-ui/apis/product/product.enum';
import type { ProductCreateRequestDto, ProductSkuUpsertRequestDto, ProductQuery, ProductListResponseDto } from '@/trading-ui/apis/product/product.interface';
const path = JAVA_CATALOG_PATH + '/products';
export async function javaRawProduct(id: string): Promise<JavaProduct> { return backendRequest(path + '/' + id); }
async function productQueryParams(query: ProductQuery): Promise<URLSearchParams> {
  const params = new URLSearchParams({ page: String(query.isPagination === false ? JAVA_PAGE_POLICY.firstPage : query.page ?? 1),
    take: String(query.isPagination === false ? JAVA_PAGE_POLICY.take : query.take ?? 20) });
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  for(const key of ['stockStatus','brandId','seasonUuid','createdById','orderBy','orderType'] as const)
    if(query[key])params.set(key==='seasonUuid'?'seasonId':key,String(query[key]));
  for(const key of ['hasPendingApproval','approvalStatus','createdFrom','createdTo','updatedFrom','updatedTo','minPrice','maxPrice','timeFilter','timeFrom','timeTo'] as const)
    if(query[key]!==undefined && query[key]!==null && query[key]!=='') params.set(key,String(query[key]));
  for (const [id, segment, key] of [[query.categoryUuid, 'categories', 'categorySlug'], [query.collectionUuid, 'collections', 'collectionSlug']] as const) {
    if (!id) continue;
    const entries = await backendRequest<Array<{ id: string | number; slug: string }>>(JAVA_CATALOG_PATH + '/' + segment);
    const entry = entries.find(candidate => String(candidate.id) === id);
    if (!entry) throw new Error('Không tìm thấy danh mục hoặc bộ sưu tập đã chọn.');
    params.set(key, entry.slug);
  }
  return params;
}
async function readProductPage(query: ProductQuery): Promise<JavaPage<JavaProduct>> {
  if (query.productIds?.trim()) {
    const ids = [...new Set(query.productIds.split(',').map(id => id.trim()).filter(Boolean))];
    if (ids.some(id => !/^[1-9][0-9]*$/.test(id))) throw new Error('ID sản phẩm phải là số nguyên dương.');
    const list = await Promise.all(ids.map(javaRawProduct));
    return { list, total: list.length, pagination: { currentPage: 1, totalPage: 1, hasNextPage: false, hasPreviousPage: false } };
  }
  const params = await productQueryParams(query);
  const result = await backendRequest<JavaPage<JavaProduct>>(path + '?' + params);
  if (query.isPagination === false) {
    while (result.pagination.hasNextPage) {
      params.set('page', String(result.pagination.currentPage + 1));
      const next = await backendRequest<JavaPage<JavaProduct>>(path + '?' + params);
      result.list.push(...next.list);
      result.pagination = next.pagination;
    }
  }
  return result;
}
export async function javaProductList(query: ProductQuery = {}): Promise<ProductListResponseDto> {
  const result = await readProductPage(query);
  const countParams=await productQueryParams(query);
  for(const key of ['status','page','take','hasPendingApproval','approvalStatus']) countParams.delete(key);
  const counts=await backendRequest<NonNullable<ProductListResponseDto['counts']>>(path+'/counts?'+countParams);
  return { total: result.total, list: result.list.map(javaProductView),
    pagination: { ...result.pagination, total: result.total, nextPage: result.pagination.hasNextPage, previousPage: result.pagination.hasPreviousPage },
    counts };
}
function validateProductInput(input: ProductCreateRequestDto): void {
  if(input.productInfos?.some(info=>!info.description?.trim())) throw new Error('Điền nội dung thông tin bổ sung trước khi lưu.');
}
function skuBody(sku: ProductSkuUpsertRequestDto, input: ProductCreateRequestDto, current?: JavaProduct) {
  const selling = sku.sellingPriceAfterTaxMinor ?? 0, compare = sku.compareAtPriceAfterTaxMinor;
  const previous = current?.skus.find(entry => String(entry.id) === sku.uuid || entry.skuCode === sku.skuCode);
  return { ...previous, skuCode: sku.skuCode, name: input.name, weightGram: sku.weight,
    costPrice:sku.costPriceAfterTaxMinor??null,b2bWholesalePrice:sku.b2bWholesalePriceAfterTax??null,
    taxRateOverride:sku.taxRateOverride??null,length:sku.length??null,width:sku.width??null,height:sku.height??null,
    listPrice: compare && compare > selling ? compare : selling,
    salePrice: compare && compare > selling ? selling : null, onHand: 0,
    isDefault: sku.skuCode === (input.defaultSkuCode ?? input.skus[0]?.skuCode),
    status: sku.status === ProductSkuStatus.INACTIVE ? 'ARCHIVED' : current?.status === ProductSpuStatus.PUBLISHED ? 'PUBLISHED' : 'DRAFT' };
}
function productBody(input: ProductCreateRequestDto, current?: JavaProduct) {
  return { categoryId: Number(input.categoryUuid), code: input.spuCode, name: input.name, description: input.description,
    brandId:input.brandId?Number(input.brandId):null,seasonId:input.seasonUuid?Number(input.seasonUuid):null,
    unitOfMeasure:input.unitOfMeasure,taxRateOverride:input.taxRateOverride??null,weightGram:input.weight??null,
    length:input.length??null,width:input.width??null,height:input.height??null,
    metaTitle:input.metaTitle??null,metaDescription:input.metaDescription??null,metaKeywords:input.metaKeywords??null,
    productInfos:input.productInfos,productMixMatch:input.productMixMatch?.map(Number),
    shortDescription: current?.shortDescription, material: current?.material, occasion: current?.occasion,
    thumbnailUrl: input.skus.find(sku => sku.skuCode === input.defaultSkuCode)?.medias[0] ?? input.skus[0]?.medias[0] ?? current?.thumbnailUrl };
}
async function saveSkuAttributes(productId: string, skuId: string, sku: ProductSkuUpsertRequestDto): Promise<void> {
  const attributes = await javaAttributes({isPagination:false});
  const values = sku.attributeValueUuids.map(id => {
    if(id.includes('~')) return decodeOption(id);
    const attribute = attributes.list.find(entry=>entry.values?.some(value=>value.id===id));
    const value = attribute?.values?.find(entry=>entry.id===id);
    if(!attribute || !value) throw new Error('Không tìm thấy giá trị thuộc tính đã chọn: '+id);
    return {attributeId:Number(attribute.id),value:value.value};
  });
  await backendRequest(path + '/' + productId + '/variants/' + skuId + '/attributes', 'PUT', { values });
}
async function syncSkuMedia(product: JavaProduct, skuId: string, urls: string[]): Promise<void> {
  const existing = product.media.filter(media => String(media.skuId) === skuId);
  for (const media of existing.filter(media => !urls.includes(media.url)))
    await backendRequest<void>(path + '/' + product.id + '/media/' + media.id, 'DELETE');
  for (const [sortOrder, url] of urls.entries()) {
    const media = existing.find(entry => entry.url === url);
    await backendRequest<JavaMedia>(path + '/' + product.id + '/media' + (media ? '/' + media.id : ''), media ? 'PUT' : 'POST',
      { url, skuId: Number(skuId), type: 'IMAGE', sortOrder, primary: sortOrder === 0 });
  }
}
async function saveSkus(product: JavaProduct, input: ProductCreateRequestDto, updating: boolean): Promise<void> {
  const removed = updating ? product.skus.filter(existing => !input.skus.some(sku => ('uuid' in sku && String(existing.id) === sku.uuid) || existing.skuCode === sku.skuCode)) : [];
  for (const sku of removed) await backendRequest(path + '/' + product.id + '/variants/' + sku.id, 'PUT', { ...sku, status: 'ARCHIVED' });
  for (const sku of input.skus) {
    const existing = product.skus.find(entry => ('uuid' in sku && String(entry.id) === sku.uuid) || entry.skuCode === sku.skuCode);
    if (updating) await backendRequest(path + '/' + product.id + '/variants' + (existing ? '/' + existing.id : ''),
      existing ? 'PUT' : 'POST', skuBody(sku, input, product));
    const refreshed = updating ? await javaRawProduct(String(product.id)) : product;
    const saved = refreshed.skus.find(entry => entry.skuCode === sku.skuCode);
    if (!saved) throw new Error('Không tìm thấy SKU vừa lưu.');
    await saveSkuAttributes(String(product.id), String(saved.id), sku);
    await syncSkuMedia(refreshed, String(saved.id), sku.medias);
  }
}
export async function javaSaveProduct(input: ProductCreateRequestDto, id?: string) {
  validateProductInput(input);
  if (!Number.isSafeInteger(Number(input.categoryUuid)) || Number(input.categoryUuid) < 1)
    throw new Error('Chọn danh mục hợp lệ trước khi lưu sản phẩm.');
  const current = id ? await javaRawProduct(id) : undefined;
  if(current && input.spuCode.trim() !== current.code) throw new Error('Java không cho đổi mã sản phẩm. Dữ liệu chưa được thay đổi.');
  const body = { ...productBody(input, current), ...(id ? {} : { variants: input.skus.map(sku => skuBody(sku, input)) }) };
  const saved = await backendRequest<JavaProduct>(path + (id ? '/' + id : ''), id ? 'PUT' : 'POST', body);
  try { await saveSkus(saved, input, Boolean(id)); }
  catch (error) { throw new Error('Sản phẩm ID ' + saved.id + ' đã lưu nhưng SKU/ảnh chưa hoàn tất. Mở Sửa sản phẩm, không tạo lại. ' + (error instanceof Error ? error.message : 'Lỗi lưu SKU.')); }
  return javaProductView(await javaRawProduct(String(saved.id)));
}
export async function javaProductStatus(id: string, status: ProductSpuStatus) {
  const current=await javaRawProduct(id);
  const restoring=[ProductSpuStatus.ARCHIVED,ProductSpuStatus.DISCONTINUED].includes(current.status)
    && status===ProductSpuStatus.UNPUBLISHED;
  const action = restoring?'restore':status === ProductSpuStatus.PUBLISHED ? 'publish' : status === ProductSpuStatus.ARCHIVED ? 'archive'
    : status === ProductSpuStatus.DISCONTINUED?'discontinue':status === ProductSpuStatus.UNPUBLISHED ? 'unpublish' : undefined;
  if (!action) throw new Error('Java chưa hỗ trợ trạng thái này.');
  return javaProductView(await backendRequest<JavaProduct>(path + '/' + id + '/' + action, 'PATCH'));
}
export async function javaGetProductForm(id: string) {
  const [product,attributes]=await Promise.all([javaRawProduct(id),javaAttributes({isPagination:false})]);
  const form=javaProductForm(product);
  const stableId=(key:string)=>{
    const decoded=decodeOption(key);
    const attribute=attributes.list.find(entry=>entry.id===String(decoded.attributeId));
    const value=attribute?.values?.find(entry=>entry.value===decoded.value);
    if(!value) throw new Error('Giá trị SKU không còn trong thuộc tính: '+decoded.value);
    return value.id;
  };
  const skus=form.skus.map(sku=>({...sku,attributeValueUuids:sku.attributeValueUuids.map(stableId)}));
  const selectedAttributes=form.values.attributes?.map(attribute=>({...attribute,valueUuids:attribute.valueUuids.map(stableId)}));
  return {...form,skus,selected:selectedAttributes?.flatMap(attribute=>attribute.valueUuids.map(value=>attribute.attributeUuid+':'+value))??[],
    values:{...form.values,attributes:selectedAttributes,skus}};
}
export async function javaGetProductDetail(id: string) { return javaProductView(await javaRawProduct(id)); }
