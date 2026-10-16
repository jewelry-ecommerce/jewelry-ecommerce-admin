import { PRODUCT_SPU_PRICE_RANGE_1_5M, PRODUCT_SPU_PRICE_RANGE_OVER_5M, PRODUCT_SPU_PRICE_RANGE_UNDER_1M } from '../product-spu.constant';
import { OrderTimeFilter } from '../../../../apis/order';
import { AdminProductTimeFilter, ProductSpuStatus } from '../../../../apis/product/product.enum';
import type { QueryAdminProductDto } from '../../../../apis/product/product.interface';
import type { SharedTimeRange } from '../../../../components/time-filter/shared-time-filter';
import type { ProductExportFiltersDto } from '../../../../apis/import-export/import-export.interface';
import type { ProductSpuAdvancedFilters } from '../product-spu.interface';

export type ProductListExportScope = 'all' | 'current-page' | 'selected';

const ORDER_TIME_TO_ADMIN_PRODUCT_TIME: Record<OrderTimeFilter, AdminProductTimeFilter> = {
  [OrderTimeFilter.TODAY]: AdminProductTimeFilter.TODAY,
  [OrderTimeFilter.YESTERDAY]: AdminProductTimeFilter.YESTERDAY,
  [OrderTimeFilter.LAST_7_DAYS]: AdminProductTimeFilter.LAST_7_DAYS,
  [OrderTimeFilter.LAST_30_DAYS]: AdminProductTimeFilter.LAST_30_DAYS,
  [OrderTimeFilter.LAST_90_DAYS]: AdminProductTimeFilter.LAST_90_DAYS,
  [OrderTimeFilter.THIS_MONTH]: AdminProductTimeFilter.THIS_MONTH,
  [OrderTimeFilter.LAST_MONTH]: AdminProductTimeFilter.LAST_MONTH,
  [OrderTimeFilter.CUSTOM]: AdminProductTimeFilter.CUSTOM,
};

export const mapOrderTimeFilterToAdminProductTimeFilter = (v: OrderTimeFilter): AdminProductTimeFilter => ORDER_TIME_TO_ADMIN_PRODUCT_TIME[v];

export const findProductSpuPriceRangeKeyFromMinMax = (minPrice?: number, maxPrice?: number): string => {
  if (minPrice == null && maxPrice == null) {
    return '';
  }
  if (minPrice === undefined && maxPrice === 1_000_000) {
    return PRODUCT_SPU_PRICE_RANGE_UNDER_1M;
  }
  if (minPrice === 1_000_000 && maxPrice === 5_000_000) {
    return PRODUCT_SPU_PRICE_RANGE_1_5M;
  }
  if (minPrice === 5_000_000 && maxPrice === undefined) {
    return PRODUCT_SPU_PRICE_RANGE_OVER_5M;
  }
  return '';
};

export const countActiveProductSpuAdvancedFilters = (filters: ProductSpuAdvancedFilters): number =>
  [Boolean(filters.approvalStatus), Boolean(filters.categoryUuid), Boolean(filters.priceRangeKey), filters.status !== ProductSpuStatus.ALL].filter(Boolean).length;

export const productSpuPriceRangeKeyToMinMax = (key: string): Pick<QueryAdminProductDto, 'minPrice' | 'maxPrice'> => {
  const trimmed = key.trim();
  if (!trimmed) {
    return { minPrice: undefined, maxPrice: undefined };
  }
  switch (trimmed) {
    case PRODUCT_SPU_PRICE_RANGE_UNDER_1M:
      return { minPrice: undefined, maxPrice: 1_000_000 };
    case PRODUCT_SPU_PRICE_RANGE_1_5M:
      return { minPrice: 1_000_000, maxPrice: 5_000_000 };
    case PRODUCT_SPU_PRICE_RANGE_OVER_5M:
      return { minPrice: 5_000_000, maxPrice: undefined };
    default:
      return { minPrice: undefined, maxPrice: undefined };
  }
};

export const buildAdminProductListTimeParams = (selectedTimeOption: OrderTimeFilter | null, customDateRange: SharedTimeRange): Pick<QueryAdminProductDto, 'timeFilter' | 'timeFrom' | 'timeTo'> => {
  if (!selectedTimeOption) {
    return {};
  }

  if (selectedTimeOption === OrderTimeFilter.CUSTOM) {
    if (!customDateRange) {
      return {};
    }
    return {
      timeFilter: AdminProductTimeFilter.CUSTOM,
      timeFrom: customDateRange.from.startOf('day').toISOString(),
      timeTo: customDateRange.to.endOf('day').toISOString(),
    };
  }

  return {
    timeFilter: mapOrderTimeFilterToAdminProductTimeFilter(selectedTimeOption),
  };
};

/** Body `filters` export — cùng bộ lọc đang dùng trên danh sách sản phẩm. */
export const buildProductExportFiltersFromListQuery = (
  listQuery: QueryAdminProductDto & {
    status?: ProductSpuStatus;
    minPrice?: number;
    maxPrice?: number;
    timeFilter?: AdminProductTimeFilter;
    timeFrom?: string;
    timeTo?: string;
  },
  scope: ProductListExportScope,
  selectedProductIds: string[] = [],
): ProductExportFiltersDto => {
  const filters: ProductExportFiltersDto = {
    orderBy: listQuery.orderBy,
    orderType: listQuery.orderType,
    brandId: listQuery.brandId,
    seasonUuid: listQuery.seasonUuid,
    stockStatus: listQuery.stockStatus,
    hasPendingApproval: listQuery.hasPendingApproval,
  };

  if (listQuery.categoryUuid) filters.categoryUuid = listQuery.categoryUuid;
  if (listQuery.status && listQuery.status !== ProductSpuStatus.ALL) filters.status = listQuery.status;
  if (listQuery.timeFilter) filters.timeFilter = listQuery.timeFilter;
  if (listQuery.timeFrom) filters.timeFrom = listQuery.timeFrom;
  if (listQuery.timeTo) filters.timeTo = listQuery.timeTo;
  if (listQuery.minPrice != null) filters.minPrice = listQuery.minPrice;
  if (listQuery.maxPrice != null) filters.maxPrice = listQuery.maxPrice;
  if (listQuery.search?.trim()) filters.search = listQuery.search.trim();

  if (scope === 'selected') {
    filters.productIds = [...selectedProductIds];
    filters.isPagination = false;
    return filters;
  }

  if (scope === 'all') {
    filters.isPagination = false;
    return filters;
  }

  filters.isPagination = true;
  filters.page = Number(listQuery.page) || 1;
  filters.take = Number(listQuery.take) || 10;
  return filters;
};
