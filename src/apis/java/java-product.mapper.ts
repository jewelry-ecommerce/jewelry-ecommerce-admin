
import type { Product, ProductVariation } from '@/trading-ui/apis/product/product.entities';
import { ProductSkuStatus } from '@/trading-ui/apis/product/product.enum';
import type { ProductFormSnapshot } from '@/trading-ui/apis/product/product-form.mapper';
import { optionKey, type JavaProduct, type JavaSku } from './java-catalog.types';
function javaSkuView(product: JavaProduct, sku: JavaSku): ProductVariation {
  return { id: String(sku.id), productId: String(product.id), skuCode: sku.skuCode, name: sku.name || product.name,
    slug: product.slug, price: String(sku.listPrice), salePrice: sku.salePrice == null ? null : String(sku.salePrice),
    sellingPriceAfterTaxMinor: sku.salePrice ?? sku.listPrice, compareAtPriceAfterTaxMinor: sku.salePrice == null ? null : sku.listPrice,
    stock: sku.availableStock, weight: sku.weightGram, status: sku.status === 'ARCHIVED' ? ProductSkuStatus.INACTIVE : ProductSkuStatus.ACTIVE,
    medias: (product.media ?? []).filter(media => String(media.skuId) === String(sku.id)).map(media => ({
      id: String(media.id), url: media.url, sortOrder: media.sortOrder, productVariationId: String(sku.id) })) };
}
export function javaProductView(product: JavaProduct): Product {
  return { id: String(product.id), spuCode: product.code, name: product.name, slug: product.slug, status: product.status,
    approval:product.approval,hasPendingApproval:product.hasPendingApproval,
    categoryId: String(product.categoryId), brandId: product.brandId==null?null:String(product.brandId), image: product.thumbnailUrl, description: product.description,
    createdAt: new Date(product.createdAt), updatedAt: new Date(product.updatedAt),
    defaultVariationId: String(product.skus.find(sku => sku.isDefault)?.id ?? product.skus[0]?.id ?? ''),
    skuCount: product.skus.length, variations: product.skus.map(sku => javaSkuView(product, sku)),
    category: { id: String(product.categoryId), name: product.categoryName, slug: product.categorySlug,
      code: product.categorySlug, level: 0, status: 'ACTIVE', taxRate: '0' } };
}
export function javaProductForm(product: JavaProduct): ProductFormSnapshot {
  const skus = product.skus.map(sku => {
    const view = javaSkuView(product, sku);
    return { uuid: view.id, skuCode: view.skuCode, status: view.status, medias: view.medias?.map(media => media.url) ?? [],
      sellingPriceAfterTaxMinor: view.sellingPriceAfterTaxMinor ?? undefined, compareAtPriceAfterTaxMinor: view.compareAtPriceAfterTaxMinor,
      weight: sku.weightGram,costPriceAfterTaxMinor:sku.costPrice,b2bWholesalePriceAfterTax:sku.b2bWholesalePrice,
      taxRateOverride:sku.taxRateOverride,length:sku.length,width:sku.width,height:sku.height,
      attributeValueUuids: (sku.attributeBindings ?? []).map(binding => optionKey(binding.id, binding.value)) };
  });
  const attributes = new Map<string, Set<string>>();
  for (const sku of product.skus) for (const binding of sku.attributeBindings ?? []) {
    const key = String(binding.id), values = attributes.get(key) ?? new Set<string>();
    values.add(optionKey(binding.id, binding.value)); attributes.set(key, values);
  }
  return { id: String(product.id), status: product.status, skus,
    selected: [...attributes].flatMap(([id, values]) => [...values].map(value => id + ':' + value)),
    values: { spuCode: product.code, name: product.name, categoryUuid: String(product.categoryId),
      brandId:product.brandId==null?null:String(product.brandId),seasonUuid:product.seasonId==null?undefined:String(product.seasonId),
      description: product.description, defaultSkuCode: product.skus.find(sku => sku.isDefault)?.skuCode,
      unitOfMeasure:product.unitOfMeasure,taxRateOverride:product.taxRateOverride,weight:product.weightGram,
      length:product.length,width:product.width,height:product.height,
      metaTitle:product.metaTitle??'',metaDescription:product.metaDescription??'',metaKeywords:product.metaKeywords??'',
      productInfos:product.productInfos?.map(info=>({title:info.title,description:info.description,sortOrder:info.sortOrder})),
      productMixMatch:product.productMixMatch?.map(product=>String(product.id)),
      attributes: [...attributes].map(([attributeUuid, values]) => ({ attributeUuid, valueUuids: [...values] })), skus } };
}
