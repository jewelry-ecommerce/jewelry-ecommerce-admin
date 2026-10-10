import type { CmsBlockObjectSchemaDefinition, CmsBlockSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';
import type { CmsBlockSchemaValidationErrors } from './cms-block-schema.utils';

export const CMS_PRODUCT_LIST_BLOCK_CODE = 'PRODUCT_LIST';
export const PRODUCT_LIST_BANNER_PRODUCT_INTERVAL = 4;
export const PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS = 6;

export type ProductListBannerActionType = 'LINK_URL' | 'MIX_MATCH';

export interface ProductListMixMatchSku {
  variationId: string;
  sortOrder?: number;
}

export interface ProductListInterleavedBanner {
  id?: string;
  enabled?: boolean;
  bannerType?: 'CAROUSEL';
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  actionType?: ProductListBannerActionType;
  actionUrl?: string;
  openInNewTab?: boolean;
  mixMatchSkus?: ProductListMixMatchSku[];
}

export interface ProductListInterleavedBannerRule {
  inheritFromParent?: boolean;
  items?: ProductListInterleavedBanner[];
}

export interface ProductListInterleavedBannerCategoryRule extends ProductListInterleavedBannerRule {
  id?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  categoryPathSlugs?: string[];
}

export interface ProductListInterleavedBannersConfig {
  inheritFromParent?: boolean;
  items?: ProductListInterleavedBanner[];
  defaultRule?: ProductListInterleavedBannerRule;
  categoryRules?: ProductListInterleavedBannerCategoryRule[];
}

export interface ProductListBlockConfig extends Record<string, unknown> {
  interleavedBanners?: ProductListInterleavedBannersConfig;
}

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const cloneSchema = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const newBannerId = (): string => {
  const cryptoValue = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoValue && typeof cryptoValue.randomUUID === 'function') return cryptoValue.randomUUID();
  return `plb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const newCategoryRuleId = (): string => `plb_rule_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const getProductListSchemaWithoutInterleavedBanners = (schema?: CmsBlockSchemaDefinition | null): CmsBlockSchemaDefinition | null => {
  if (!schema || schema.type !== 'object') return schema ?? null;

  const next = cloneSchema(schema) as CmsBlockObjectSchemaDefinition;
  if (next.properties) delete next.properties.interleavedBanners;
  next.required = (next.required ?? []).filter((key) => key !== 'interleavedBanners');
  return next;
};

export const getProductListInterleavedBannersConfig = (config: Record<string, unknown>): ProductListInterleavedBannersConfig => {
  const value = config.interleavedBanners;
  if (!isRecordValue(value)) return { defaultRule: { inheritFromParent: false, items: [] }, categoryRules: [] };

  const defaultRule = normalizeProductListBannerRule(value.defaultRule, value);
  return {
    inheritFromParent: defaultRule.inheritFromParent,
    items: defaultRule.items,
    defaultRule,
    categoryRules: normalizeProductListCategoryRules(value.categoryRules),
  };
};

export const setProductListInterleavedBannersConfig = (config: Record<string, unknown>, interleavedBanners: ProductListInterleavedBannersConfig): ProductListBlockConfig => ({
  ...config,
  interleavedBanners: {
    defaultRule: normalizeProductListBannerRule(interleavedBanners.defaultRule, {
      inheritFromParent: interleavedBanners.inheritFromParent,
      items: interleavedBanners.items,
    }),
    categoryRules: normalizeProductListCategoryRules(interleavedBanners.categoryRules),
  },
});

export const createProductListCategoryRuleDraft = (): ProductListInterleavedBannerCategoryRule => ({
  id: newCategoryRuleId(),
  categoryId: '',
  categorySlug: '',
  categoryName: '',
  categoryPathSlugs: [],
  inheritFromParent: true,
  items: [],
});

export const createProductListBannerDraft = (): ProductListInterleavedBanner => ({
  id: newBannerId(),
  enabled: true,
  bannerType: 'CAROUSEL',
  imageUrl: '',
  startTime: '',
  endTime: '',
  actionType: 'LINK_URL',
  actionUrl: '',
  openInNewTab: false,
  mixMatchSkus: [],
});

export const normalizeProductListBannerItems = (items: unknown): ProductListInterleavedBanner[] => {
  if (!Array.isArray(items)) return [];

  return items.filter(isRecordValue).map((item, index) => ({
    id: typeof item.id === 'string' && item.id.trim() ? item.id : `banner_${index}`,
    enabled: item.enabled !== false,
    bannerType: 'CAROUSEL',
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    startTime: typeof item.startTime === 'string' ? item.startTime : '',
    endTime: typeof item.endTime === 'string' ? item.endTime : '',
    actionType: item.actionType === 'MIX_MATCH' ? 'MIX_MATCH' : 'LINK_URL',
    actionUrl: typeof item.actionUrl === 'string' ? item.actionUrl : '',
    openInNewTab: Boolean(item.openInNewTab),
    mixMatchSkus: normalizeMixMatchSkus(item.mixMatchSkus),
  }));
};

export const normalizeProductListBannerRule = (value: unknown, legacyValue?: unknown): ProductListInterleavedBannerRule => {
  const source = isRecordValue(value) ? value : isRecordValue(legacyValue) ? legacyValue : {};

  return {
    inheritFromParent: Boolean(source.inheritFromParent),
    items: normalizeProductListBannerItems(source.items),
  };
};

export const normalizeProductListCategoryRules = (items: unknown): ProductListInterleavedBannerCategoryRule[] => {
  if (!Array.isArray(items)) return [];

  return items.filter(isRecordValue).map((item, index) => {
    const categoryPathSlugs = normalizeStringList(item.categoryPathSlugs);
    const categorySlug = normalizeStringValue(item.categorySlug) || categoryPathSlugs.at(-1) || '';

    return {
      id: normalizeStringValue(item.id) || `category_rule_${index}`,
      categoryId: normalizeStringValue(item.categoryId),
      categorySlug,
      categoryName: normalizeStringValue(item.categoryName),
      categoryPathSlugs,
      inheritFromParent: item.inheritFromParent !== false,
      items: normalizeProductListBannerItems(item.items),
    };
  });
};

export const normalizeMixMatchSkus = (items: unknown): ProductListMixMatchSku[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();

  return items
    .filter(isRecordValue)
    .map((item, index) => ({
      variationId: normalizeStringValue(item.variationId),
      sortOrder: typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : index,
    }))
    .filter((item) => {
      if (!item.variationId || seen.has(item.variationId)) return false;
      seen.add(item.variationId);
      return true;
    })
    .slice(0, PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS);
};

const normalizeStringList = (value: unknown): string[] => (Array.isArray(value) ? value.map(normalizeStringValue).filter(Boolean) : []);

const normalizeStringValue = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const getProductListCollectionSlugs = (dataSource: Record<string, unknown>): string[] => {
  const values = Array.isArray(dataSource.collectionSlugs) ? normalizeStringList(dataSource.collectionSlugs) : [normalizeStringValue(dataSource.collectionSlug)].filter(Boolean);
  return Array.from(new Set(values));
};

export const normalizeProductListCollectionSelection = (value: unknown): string[] => {
  const values = typeof value === 'string' ? value.split(',') : value;
  return Array.from(new Set(normalizeStringList(values)));
};

const appendProductListDataSourceErrors = (dataSource: Record<string, unknown>, pathPrefix: 'dataSource' | 'productDataSource', errors: CmsBlockSchemaValidationErrors): void => {
  if (pathPrefix === 'dataSource') return;

  const filterType = normalizeStringValue(dataSource.filterType);

  if (filterType === 'COLLECTION') {
    const collectionSlugs = getProductListCollectionSlugs(dataSource);
    if (!collectionSlugs.length) {
      errors[`${pathPrefix}.collectionSlugs`] = 'Bộ sưu tập là bắt buộc';
    }
  }
};

export const validateProductListBlockConfig = (config: Record<string, unknown>): CmsBlockSchemaValidationErrors => {
  const errors: CmsBlockSchemaValidationErrors = {};

  if (isRecordValue(config.dataSource)) {
    appendProductListDataSourceErrors(config.dataSource, 'dataSource', errors);
  }

  if (isRecordValue(config.productDataSource)) {
    appendProductListDataSourceErrors(config.productDataSource, 'productDataSource', errors);
  }

  return errors;
};
