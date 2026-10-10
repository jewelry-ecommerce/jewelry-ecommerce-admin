import type { CmsBlockSchemaValidationErrors } from './cms-block-schema.utils';
import { normalizeMixMatchSkus, PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS } from './cms-product-list-block.utils';

export const CMS_IMAGE_GALLERY_BLOCK_CODE = 'IMAGE_GALLERY';
export const IMAGE_GALLERY_MAX_MIX_MATCH_SKUS = PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS;

export type ImageGalleryItemActionType = 'LINK_URL' | 'MIX_MATCH';

export interface ImageGalleryMixMatchSku {
  variationId: string;
  sortOrder?: number;
}

export interface ImageGalleryItem {
  imageUrl?: string;
  label?: string;
  actionType?: ImageGalleryItemActionType;
  actionUrl?: string;
  mixMatchSkus?: ImageGalleryMixMatchSku[];
}

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeImageGalleryItems = (items: unknown): ImageGalleryItem[] => {
  if (!Array.isArray(items)) return [];

  return items.filter(isRecordValue).map((item) => {
    const hasLegacyUrl = typeof item.actionUrl === 'string' && item.actionUrl.trim().length > 0;
    const actionType: ImageGalleryItemActionType = item.actionType === 'MIX_MATCH' ? 'MIX_MATCH' : hasLegacyUrl || item.actionType === 'LINK_URL' ? 'LINK_URL' : 'LINK_URL';

    return {
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
      label: typeof item.label === 'string' ? item.label : '',
      actionType,
      actionUrl: typeof item.actionUrl === 'string' ? item.actionUrl : '',
      mixMatchSkus: normalizeMixMatchSkus(item.mixMatchSkus),
    };
  });
};

export const validateImageGalleryBlockConfig = (config: Record<string, unknown>): CmsBlockSchemaValidationErrors => {
  const errors: CmsBlockSchemaValidationErrors = {};
  const items = normalizeImageGalleryItems(config.items);

  items.forEach((item, index) => {
    if (!item.imageUrl?.trim()) {
      errors[`items.${index}.imageUrl`] = 'Vui lòng tải lên hình ảnh';
    }

    if (item.actionType === 'LINK_URL' && !item.actionUrl?.trim()) {
      errors[`items.${index}.actionUrl`] = 'Vui lòng nhập đường dẫn khi chọn Gắn đường dẫn';
    }

    if (item.actionType === 'MIX_MATCH' && !item.mixMatchSkus?.length) {
      errors[`items.${index}.mixMatchSkus`] = 'Vui lòng chọn ít nhất 1 sản phẩm cho Mix & Match';
    }

    if (item.actionType === 'MIX_MATCH' && (item.mixMatchSkus?.length ?? 0) > IMAGE_GALLERY_MAX_MIX_MATCH_SKUS) {
      errors[`items.${index}.mixMatchSkus`] = `Tối đa ${IMAGE_GALLERY_MAX_MIX_MATCH_SKUS} sản phẩm cho Mix & Match`;
    }
  });

  return errors;
};
