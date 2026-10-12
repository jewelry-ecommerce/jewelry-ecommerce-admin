import type { CreateProductListBannerConfigDto } from '../../../../apis';
import { ProductListBannerConditionType } from '../../../../apis/banner/banner.enum';

type ProductListBannerDraft = CreateProductListBannerConfigDto & { id?: string };

export const slugifyBannerConfigName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

export const buildProductListBannerSavePayload = (draft: ProductListBannerDraft): Omit<ProductListBannerDraft, 'id'> => {
  if (draft.conditionType !== ProductListBannerConditionType.CMS_STOREFRONT) {
    return {
      conditionType: draft.conditionType,
      targetId: draft.targetId,
      targetSlug: draft.targetSlug,
      targetName: draft.targetName,
      categoryPathSlugs: draft.categoryPathSlugs,
      isActive: draft.isActive,
      banners: draft.banners,
    };
  }

  const targetName = draft.targetName?.trim() ?? '';
  const targetSlug = slugifyBannerConfigName(targetName);

  return {
    conditionType: draft.conditionType,
    targetId: undefined,
    targetSlug,
    targetName,
    categoryPathSlugs: [],
    isActive: draft.isActive,
    banners: draft.banners,
  };
};
