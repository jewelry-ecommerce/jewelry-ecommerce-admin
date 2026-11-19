import { AttributeStatus } from '@/trading-ui/apis/attribute/attribute.enum';
import { buildSkuMatrixPreviewRequestDto } from '@/trading-ui/pages/product/product-spu/utils/product-spu-attribute-tree.utils';
import type { ProductFormSnapshot } from './product-form.mapper';
import { hydrateProductMatrix } from './product-form.mapper';
import type { Product, ProductInfoItem, ProductVariationAttributeValueLink, ProductVariationDetail } from './product.entities';
import type {
  AdminProductDetailDto,
  ProductInfoFormItem,
  ProductSkuUpsertRequestDto,
  SkuMatrixPreviewRequestDto,
  SkuMatrixPreviewResponseDto,
} from './product.interface';

function toProductInfos(items: ProductInfoFormItem[] | undefined, fallback: ProductInfoItem[] | undefined): ProductInfoItem[] | undefined {
  if (!items?.length) return fallback;
  return items.map((item, index) => ({
    title: item.title?.trim() || `Thông tin ${index + 1}`,
    description: item.description,
    sortOrder: item.sortOrder,
  }));
}

function attributeLinks(
  sku: ProductSkuUpsertRequestDto,
  matrix: SkuMatrixPreviewResponseDto | undefined,
): ProductVariationAttributeValueLink[] {
  const variationId = sku.uuid ?? sku.skuCode;
  return (sku.attributeValueUuids ?? []).map((valueId) => {
    const value = matrix?.values[valueId];
    const attributeId = value?.attributeId ?? '';
    const attribute = attributeId ? matrix?.attributes[attributeId] : undefined;
    return {
      id: `${variationId}:${valueId}`,
      productVariationId: variationId,
      attributeValueId: valueId,
      attributeValue: {
        id: valueId,
        attributeId,
        value: value?.name ?? valueId,
        code: value?.code ?? valueId,
        attribute: attribute
          ? { id: attribute.uuid, name: attribute.name, code: attribute.code, status: AttributeStatus.ACTIVE }
          : undefined,
      },
    };
  });
}

function detailVariation(
  sku: ProductSkuUpsertRequestDto,
  product: Product,
  matrix: SkuMatrixPreviewResponseDto | undefined,
): ProductVariationDetail {
  const base = product.variations?.find((row) => row.id === sku.uuid || row.skuCode === sku.skuCode);
  return {
    id: sku.uuid ?? base?.id ?? sku.skuCode,
    productId: product.id,
    skuCode: sku.skuCode,
    name: base?.name ?? product.name,
    slug: base?.slug ?? product.slug,
    price: base?.price ?? String(sku.sellingPriceAfterTaxMinor ?? 0),
    salePrice: base?.salePrice ?? null,
    sellingPriceAfterTaxMinor: sku.sellingPriceAfterTaxMinor ?? base?.sellingPriceAfterTaxMinor,
    compareAtPriceAfterTaxMinor: sku.compareAtPriceAfterTaxMinor ?? base?.compareAtPriceAfterTaxMinor,
    stock: base?.stock ?? 0,
    weight: sku.weight ?? base?.weight,
    status: sku.status,
    medias: base?.medias ?? sku.medias?.map((url, index) => ({
      id: `${sku.uuid ?? sku.skuCode}-media-${index}`,
      url,
      sortOrder: index,
      productVariationId: sku.uuid ?? sku.skuCode,
    })),
    variationAttributeValues: attributeLinks(sku, matrix),
  };
}

export async function assembleJavaAdminProductDetail(input: {
  product: Product;
  form: ProductFormSnapshot;
  preview: (body: SkuMatrixPreviewRequestDto) => Promise<SkuMatrixPreviewResponseDto>;
  mixMatch: AdminProductDetailDto['productMixMatch'];
}): Promise<AdminProductDetailDto> {
  const { product, form, preview, mixMatch } = input;
  const orderedIds = form.values.attributes?.map((row) => row.attributeUuid) ?? [];
  const request = buildSkuMatrixPreviewRequestDto(orderedIds, form.values.attributes ?? []);
  const matrix = request ? hydrateProductMatrix(await preview(request), form) : undefined;
  const { productMixMatch: _mix, variations: _variations, ...detail } = product;
  return {
    ...detail,
    unitOfMeasure: form.values.unitOfMeasure ?? product.unitOfMeasure,
    taxRateOverride: form.values.taxRateOverride ?? product.taxRateOverride,
    weight: form.values.weight ?? product.weight,
    length: form.values.length ?? product.length,
    width: form.values.width ?? product.width,
    height: form.values.height ?? product.height,
    metaTitle: form.values.metaTitle ?? product.metaTitle,
    metaDescription: form.values.metaDescription ?? product.metaDescription,
    metaKeywords: form.values.metaKeywords ?? product.metaKeywords,
    productInfos: toProductInfos(form.values.productInfos, product.productInfos),
    variantAttributeOrder: matrix?.attributeOrder,
    variantMatrix: matrix,
    variations: form.skus.map((sku) => detailVariation(sku, product, matrix)),
    productMixMatch: mixMatch,
  };
}
