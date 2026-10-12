import dayjs from 'dayjs';
import { OrderTimeFilter } from '../../../../apis/order';
import { type ProductApprovalStatus, ProductSpuStatus } from '../../../../apis/product/product.enum';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import type { ProductSpuAdvancedFilters } from '../product-spu.interface';
import { productSpuPriceRangeKeyToMinMax } from './product-spu-list-query.utils';

export type ProductSpuListUrlState = {
  page: number;
  take: number;
  search: string;
  activeTab: string;
  selectedTimeOption: OrderTimeFilter | null;
  customDateRange: { from: string; to: string } | null;
  advancedFilters: ProductSpuAdvancedFilters;
};

const parsePositiveInt = (raw: string | null, fallback: number): number => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export function parseProductSpuListUrlState(searchParams: URLSearchParams): ProductSpuListUrlState {
  const timeRaw = searchParams.get('time')?.trim() ?? '';
  const selectedTimeOption = Object.values(OrderTimeFilter).includes(timeRaw as OrderTimeFilter) ? (timeRaw as OrderTimeFilter) : null;
  const timeFrom = searchParams.get('timeFrom');
  const timeTo = searchParams.get('timeTo');

  return {
    page: parsePositiveInt(searchParams.get('page'), PAGE_TAKE_DEFAULT.page),
    take: parsePositiveInt(searchParams.get('take'), PAGE_TAKE_DEFAULT.take),
    search: searchParams.get('q')?.trim() ?? '',
    activeTab: searchParams.get('tab')?.trim() ?? '',
    selectedTimeOption,
    customDateRange: selectedTimeOption === OrderTimeFilter.CUSTOM && timeFrom && timeTo ? { from: timeFrom, to: timeTo } : null,
    advancedFilters: {
      categoryUuid: searchParams.get('categoryUuid')?.trim() ?? '',
      priceRangeKey: searchParams.get('priceRange')?.trim() ?? '',
      status: (searchParams.get('advStatus')?.trim() as ProductSpuStatus) || ProductSpuStatus.ALL,
      approvalStatus: (searchParams.get('advApproval')?.trim() as ProductApprovalStatus) || '',
    },
  };
}

export function buildProductSpuListSearchParams(input: {
  page: number;
  take: number;
  search: string;
  activeTab: string;
  selectedTimeOption: OrderTimeFilter | null;
  customDateRange: { from: dayjs.Dayjs; to: dayjs.Dayjs } | null;
  advancedFilters: ProductSpuAdvancedFilters;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (input.page !== PAGE_TAKE_DEFAULT.page) params.set('page', String(input.page));
  if (input.take !== PAGE_TAKE_DEFAULT.take) params.set('take', String(input.take));
  if (input.search.trim()) params.set('q', input.search.trim());
  if (input.activeTab) params.set('tab', input.activeTab);
  if (input.selectedTimeOption) params.set('time', input.selectedTimeOption);
  if (input.selectedTimeOption === OrderTimeFilter.CUSTOM && input.customDateRange) {
    params.set('timeFrom', input.customDateRange.from.toISOString());
    params.set('timeTo', input.customDateRange.to.toISOString());
  }
  if (input.advancedFilters.categoryUuid) params.set('categoryUuid', input.advancedFilters.categoryUuid);
  if (input.advancedFilters.priceRangeKey) params.set('priceRange', input.advancedFilters.priceRangeKey);
  if (input.advancedFilters.status && input.advancedFilters.status !== ProductSpuStatus.ALL) {
    params.set('advStatus', input.advancedFilters.status);
  }
  if (input.advancedFilters.approvalStatus) params.set('advApproval', input.advancedFilters.approvalStatus);

  return params;
}

export function buildProductSpuListReturnPath(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${ROUTE_PATH.PRODUCT_SPU_LIST}?${query}` : ROUTE_PATH.PRODUCT_SPU_LIST;
}

export function applyProductSpuListUrlStateToScreen(input: ProductSpuListUrlState) {
  const priceRange = productSpuPriceRangeKeyToMinMax(input.advancedFilters.priceRangeKey);
  return {
    screenState: {
      ...PAGE_TAKE_DEFAULT,
      page: input.page,
      take: input.take,
      search: input.search,
      categoryUuid: input.advancedFilters.categoryUuid || undefined,
      status: input.advancedFilters.status,
      approvalStatus: input.advancedFilters.approvalStatus || undefined,
      ...priceRange,
    },
    activeTab: input.activeTab,
    selectedTimeOption: input.selectedTimeOption,
    customDateRange:
      input.customDateRange && input.selectedTimeOption === OrderTimeFilter.CUSTOM
        ? {
            from: dayjs(input.customDateRange.from),
            to: dayjs(input.customDateRange.to),
          }
        : null,
  };
}

export function productSpuListUrlHasFilters(searchParams: URLSearchParams): boolean {
  return [...searchParams.keys()].length > 0;
}
