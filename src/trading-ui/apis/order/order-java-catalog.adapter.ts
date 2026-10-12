import { backendRequest } from '@/apis/backend-request';
import { javaRawProduct } from '@/apis/java/java-product.api';
import { JAVA_CATALOG_PATH, type JavaProduct, type JavaPage, type JavaSku } from '@/apis/java/java-catalog.types';
import type { IOrderCatalogProduct, IOrderProductCatalogQuery, IOrderProductCatalogResponse, IOrderProductDetail, IOrderProductVariationListItem } from './order.interface';

function image(product: JavaProduct, sku?: JavaSku): string {
  return product.media.find(media => sku && String(media.skuId) === String(sku.id))?.url
    ?? product.thumbnailUrl ?? product.media.find(media => media.skuId === null)?.url ?? '';
}
function catalogProduct(product: JavaProduct): IOrderCatalogProduct {
  const skus = product.skus.filter(sku => sku.status === 'PUBLISHED');
  const cheapest = skus.reduce((selected, sku) => (sku.salePrice ?? sku.listPrice) < (selected.salePrice ?? selected.listPrice) ? sku : selected);
  return { id: String(product.id), name: product.name, slug: product.slug, image: image(product, cheapest),
    categoryName: product.categoryName, skuCode: cheapest.skuCode, cheapestVariationId: String(cheapest.id),
    totalVariations: skus.length, totalSellableStock: skus.reduce((stock, sku) => stock + sku.availableStock, 0),
    minSellingPriceAfterTaxMinor: cheapest.salePrice ?? cheapest.listPrice, minCompareAtPriceAfterTaxMinor: cheapest.listPrice };
}
export async function getJavaOrderProducts(query: IOrderProductCatalogQuery): Promise<IOrderProductCatalogResponse> {
  const params = new URLSearchParams({ page: String(query.page), take: String(query.take), status: 'PUBLISHED' });
  if (query.search?.trim()) params.set('search', query.search.trim());
  const response = await backendRequest<JavaPage<JavaProduct>>(JAVA_CATALOG_PATH + '/products?' + params);
  return { total: response.total, list: response.list.filter(product => product.skus.some(sku => sku.status === 'PUBLISHED')).map(catalogProduct) };
}
export async function getJavaOrderProductVariations(id: string): Promise<IOrderProductVariationListItem[]> {
  const product = await javaRawProduct(id);
  return product.skus.map(sku => ({ id: String(sku.id), skuCode: sku.skuCode, slug: product.slug, name: sku.name,
    price: String(sku.salePrice ?? sku.listPrice), unitPrice: sku.listPrice, salePrice: sku.salePrice ?? sku.listPrice,
    compareAtPriceAfterTaxMinor: sku.listPrice, sellingPriceAfterTaxMinor: sku.salePrice ?? sku.listPrice,
    stock: sku.availableStock, status: sku.status, weightGram: sku.weightGram,
    medias: product.media.filter(media => String(media.skuId) === String(sku.id)).map(media => ({ url: media.url, sortOrder: media.sortOrder })),
    attributes: sku.attributeBindings.map(binding => ({ attributeCode: binding.code, attributeName: binding.name,
      displayType: binding.type, value: binding.value, code: binding.value })) }));
}
export async function getJavaOrderProductDetail(id: string): Promise<IOrderProductDetail> {
  const product = await javaRawProduct(id);
  return { id: String(product.id), name: product.name, image: image(product), subtitle: product.categoryName,
    variations: product.skus.map(sku => ({ id: String(sku.id), skuCode: sku.skuCode, unitPrice: sku.listPrice,
      salePrice: sku.salePrice ?? sku.listPrice, stockQuantity: sku.availableStock, weightGram: sku.weightGram,
      variationValue: sku.attributeBindings.map(binding => binding.value), imageUrl: image(product, sku) })) };
}
