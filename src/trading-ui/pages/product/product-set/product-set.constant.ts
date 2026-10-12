import { PRODUCT_SET_IMPORT_ROUTING_KEY, ProductSetStatus } from '../../../apis';

export { PRODUCT_SET_IMPORT_ROUTING_KEY };

export const PRODUCT_SET_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const STATUS_FILTER_ALL = 'ALL';

export const getProductSetStatusLabelVi = (status: ProductSetStatus): string => {
  switch (status) {
    case ProductSetStatus.PUBLISHED:
      return 'Đang mở bán';
    case ProductSetStatus.UNPUBLISHED:
      return 'Ngừng mở bán';
    default:
      return status;
  }
};

export const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: STATUS_FILTER_ALL },
  { label: getProductSetStatusLabelVi(ProductSetStatus.PUBLISHED), value: ProductSetStatus.PUBLISHED },
  { label: getProductSetStatusLabelVi(ProductSetStatus.UNPUBLISHED), value: ProductSetStatus.UNPUBLISHED },
];
