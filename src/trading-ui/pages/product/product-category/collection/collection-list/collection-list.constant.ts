import { CollectionStatus } from '../../../../../apis/collection/collection.enum';
import type { ProductCollectionCreateFormValues, ProductCollectionDialogFormValues } from './collection-list.interface';
import * as yup from 'yup';

export const PRODUCT_COLLECTION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type ProductCollectionOption = Readonly<{
  value: string;
  label: string;
}>;

export const getProductCollectionStatusLabelVi = (status: CollectionStatus): string => {
  switch (status) {
    case CollectionStatus.ACTIVE:
      return 'Kích hoạt';
    case CollectionStatus.INACTIVE:
      return 'Vô hiệu hóa';

    default:
      return 'Không xác định';
  }
};

export const COLLECTION_STATUS_FILTER_ALL = 'ALL';

export type CollectionStatusFilterValue = typeof COLLECTION_STATUS_FILTER_ALL | CollectionStatus;

export const COLLECTION_STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: CollectionStatusFilterValue; label: string }> = [
  { value: COLLECTION_STATUS_FILTER_ALL, label: 'Tất cả' },
  { value: CollectionStatus.ACTIVE, label: getProductCollectionStatusLabelVi(CollectionStatus.ACTIVE) },
  { value: CollectionStatus.INACTIVE, label: getProductCollectionStatusLabelVi(CollectionStatus.INACTIVE) },
];

export const collectionCreateFormSchema: yup.ObjectSchema<ProductCollectionCreateFormValues> = yup
  .object({
    name: yup.string().trim().required('Vui lòng nhập tên bộ sưu tập').max(255, 'Tên bộ sưu tập không được quá 255 ký tự'),
    description: yup.string().trim().max(255, 'Mô tả không được quá 255 ký tự'),
    status: yup.string().oneOf(Object.values(CollectionStatus)).required(),
  })
  .required();

export const collectionFormSchema: yup.ObjectSchema<ProductCollectionDialogFormValues> = yup
  .object({
    name: yup.string().trim().required('Vui lòng nhập tên bộ sưu tập').max(255, 'Tên bộ sưu tập không được quá 255 ký tự'),
    brandId: yup.string().required('Vui lòng chọn thương hiệu'),
    // categoryId: yup.string().required('Vui lòng chọn danh mục'),
    // type: yup.string().required('Vui lòng chọn loại'),
    status: yup.string().oneOf(Object.values(CollectionStatus)).required(),
    description: yup.string().trim().max(255, 'Mô tả không được quá 255 ký tự'),
  })
  .required();
