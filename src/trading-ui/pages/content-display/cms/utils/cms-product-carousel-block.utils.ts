export const CMS_PRODUCT_CAROUSEL_BLOCK_CODE = 'PRODUCT_CAROUSEL';

export const PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE = 'MANUAL_PRODUCTS' as const;

export const PRODUCT_CAROUSEL_MAX_MANUAL_PRODUCTS = 20;

export const normalizeProductCarouselProductIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)));
};

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export const sanitizeProductCarouselDataSource = (dataSource: unknown): Record<string, unknown> | undefined => {
  if (!isRecordValue(dataSource)) return undefined;

  const filterType = typeof dataSource.filterType === 'string' ? dataSource.filterType.trim() : '';
  if (!filterType) return { filterType: dataSource.filterType };

  switch (filterType) {
    case 'CATEGORY': {
      const categorySlugs = Array.isArray(dataSource.categorySlugs) ? dataSource.categorySlugs.map((slug) => (typeof slug === 'string' ? slug.trim() : '')).filter(Boolean) : [];
      const legacyCategorySlug = typeof dataSource.categoryId === 'string' ? dataSource.categoryId.trim() : '';
      const slugs = Array.from(new Set([...categorySlugs, legacyCategorySlug].filter(Boolean)));
      return slugs.length > 0 ? { filterType, categoryId: slugs[0], categorySlugs: slugs } : { filterType };
    }
    case 'COLLECTION': {
      const collectionId = typeof dataSource.collectionId === 'string' ? dataSource.collectionId.trim() : '';
      const collectionSlug = typeof dataSource.collectionSlug === 'string' ? dataSource.collectionSlug.trim() : '';
      const next: Record<string, unknown> = { filterType };
      if (collectionId) next.collectionId = collectionId;
      if (collectionSlug) next.collectionSlug = collectionSlug;
      return next;
    }
    case 'CAMPAIGN': {
      const campaignId = typeof dataSource.campaignId === 'string' ? dataSource.campaignId.trim() : '';
      return campaignId ? { filterType, campaignId } : { filterType };
    }
    case PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE:
      return {
        filterType,
        productIds: normalizeProductCarouselProductIds(dataSource.productIds),
      };
    default:
      return { filterType };
  }
};

const sanitizeProductCarouselSeeMore = (seeMore: unknown): Record<string, unknown> | undefined => {
  if (!isRecordValue(seeMore)) return undefined;

  const enabled = Boolean(seeMore.enabled);
  const text = typeof seeMore.text === 'string' ? seeMore.text.trim() : '';
  const url = typeof seeMore.url === 'string' ? seeMore.url.trim() : '';
  const next: Record<string, unknown> = { enabled };

  if (enabled) {
    if (text) next.text = text;
    if (url) next.url = url;
  }

  return next;
};

export const sanitizeProductCarouselBlockConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...config };
  const dataSource = sanitizeProductCarouselDataSource(config.dataSource);
  if (dataSource) next.dataSource = dataSource;

  const seeMore = sanitizeProductCarouselSeeMore(config.seeMore);
  if (seeMore) next.seeMore = seeMore;

  return next;
};

export const validateProductCarouselBlockConfig = (config: Record<string, unknown>): Record<string, string> => {
  const errors: Record<string, string> = {};
  const dataSource = config.dataSource;

  if (dataSource && typeof dataSource === 'object' && !Array.isArray(dataSource)) {
    const filterType = typeof (dataSource as Record<string, unknown>).filterType === 'string' ? (dataSource as Record<string, unknown>).filterType : '';
    if (filterType === PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE) {
      const productIds = normalizeProductCarouselProductIds((dataSource as Record<string, unknown>).productIds);
      if (productIds.length === 0) {
        errors['dataSource.productIds'] = 'Vui lòng chọn ít nhất một sản phẩm.';
      }
    }
  }

  const seeMore = config.seeMore;
  if (seeMore && typeof seeMore === 'object' && !Array.isArray(seeMore) && Boolean((seeMore as Record<string, unknown>).enabled)) {
    const text = typeof (seeMore as Record<string, unknown>).text === 'string' ? ((seeMore as Record<string, unknown>).text as string).trim() : '';
    const url = typeof (seeMore as Record<string, unknown>).url === 'string' ? ((seeMore as Record<string, unknown>).url as string).trim() : '';
    if (!text) errors['seeMore.text'] = 'Vui lòng nhập nội dung nút xem thêm.';
    if (!url) errors['seeMore.url'] = 'Vui lòng nhập đường dẫn nút xem thêm.';
  }

  return errors;
};
