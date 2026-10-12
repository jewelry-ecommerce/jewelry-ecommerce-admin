import { PackagingType, ProductKind, ProductSkuStatus, ProductVariationSkuKind, type ProductSkuUpsertRequestDto, type ProductVariationDetail } from '../../../../apis';

export const packagingVariationToSkuUpsert = (variation: ProductVariationDetail): ProductSkuUpsertRequestDto => {
  const profile = variation.packagingProfile;
  const sellingPrice = Number(variation.sellingPriceAfterTaxMinor ?? profile?.basePriceAfterTax ?? 0);
  const compareAtPrice = Number(variation.compareAtPriceAfterTaxMinor ?? 0);

  return {
    clientKey: variation.id,
    uuid: variation.id,
    skuCode: variation.skuCode,
    status: variation.status ?? ProductSkuStatus.ACTIVE,
    skuKind: ProductVariationSkuKind.PACKAGING,
    compareAtPriceAfterTaxMinor: compareAtPrice > sellingPrice ? compareAtPrice : null,
    sellingPriceAfterTaxMinor: sellingPrice,
    costPriceAfterTaxMinor: Number(variation.costPriceAfterTaxMinor ?? 0),
    attributeValueUuids: [],
    medias: (variation.medias ?? []).map((item) => item.url).filter(Boolean),
    weight: variation.weight ?? undefined,
    length: variation.length ?? undefined,
    width: variation.width ?? undefined,
    height: variation.height ?? undefined,
    packagingBasePriceAfterTax: Number(profile?.basePriceAfterTax ?? sellingPrice),
    packagingIncludedPriceAfterTax: Number(profile?.includedPriceAfterTax ?? 0),
    packagingIsVisible: profile?.isVisible ?? false,
    packagingCanBeSold: profile?.canBeSold ?? false,
    packagingType: (profile?.packagingType as PackagingType | undefined) ?? PackagingType.BOX,
  };
};

export const normalizeShippingPackagingSkuUpsert = (sku: ProductSkuUpsertRequestDto): ProductSkuUpsertRequestDto => {
  const costPrice = Number(sku.costPriceAfterTaxMinor ?? 0);
  const packagingType = sku.packagingType === PackagingType.BAG || sku.packagingType === PackagingType.CARTON_BOX ? sku.packagingType : PackagingType.CARTON_BOX;

  return {
    ...sku,
    skuKind: ProductVariationSkuKind.PACKAGING,
    compareAtPriceAfterTaxMinor: null,
    sellingPriceAfterTaxMinor: 0,
    costPriceAfterTaxMinor: costPrice,
    attributeValueUuids: [],
    medias: sku.medias ?? [],
    packagingBasePriceAfterTax: 0,
    packagingIncludedPriceAfterTax: 0,
    packagingIsVisible: false,
    packagingCanBeSold: false,
    packagingType,
  };
};

export const normalizePackagingSkuUpsert = (sku: ProductSkuUpsertRequestDto, productKind?: ProductKind): ProductSkuUpsertRequestDto => {
  if (productKind === ProductKind.SHIPPING_PACKAGING) {
    return normalizeShippingPackagingSkuUpsert(sku);
  }
  const retailPrice = Number(sku.sellingPriceAfterTaxMinor ?? sku.packagingBasePriceAfterTax ?? 0);
  const compareAtPrice = Number(sku.compareAtPriceAfterTaxMinor ?? 0);

  return {
    ...sku,
    skuKind: ProductVariationSkuKind.PACKAGING,
    compareAtPriceAfterTaxMinor: compareAtPrice > retailPrice ? compareAtPrice : null,
    sellingPriceAfterTaxMinor: retailPrice,
    costPriceAfterTaxMinor: Number(sku.costPriceAfterTaxMinor ?? 0),
    attributeValueUuids: [],
    medias: sku.medias ?? [],
    packagingBasePriceAfterTax: retailPrice,
    packagingIncludedPriceAfterTax: Number(sku.packagingIncludedPriceAfterTax ?? 0),
    packagingIsVisible: Boolean(sku.packagingIsVisible),
    packagingCanBeSold: Boolean(sku.packagingCanBeSold),
    packagingType: sku.packagingType ?? PackagingType.BOX,
  };
};
