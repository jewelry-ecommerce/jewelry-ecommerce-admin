import type { ProductSpu, ProductSpuCreateFormValues } from '../product-spu.interface';
import type { ProductCreateRequestDto } from '../../../../apis/product/product.interface';
import { ProductKind, ProductUnitOfMeasure } from '../../../../apis/product/product.enum';
export type ProductSpuGeneralFormValues = Pick<ProductSpuCreateFormValues, 'spuCode' | 'name' | 'productKind' | 'categoryUuid' | 'brandId' | 'taxRateOverride'> & {
  seasonUuid: string;
  unitOfMeasure: ProductUnitOfMeasure;
};

export const emptyProductSpuGeneralForm = (): ProductSpuGeneralFormValues => ({
  spuCode: '',
  name: '',
  productKind: ProductKind.MERCHANDISE,
  unitOfMeasure: ProductUnitOfMeasure.EACH,
  categoryUuid: '',
  seasonUuid: '',
  brandId: '',
  taxRateOverride: undefined,
});

export const emptyProductSpuCreateForm = (): ProductCreateRequestDto => ({
  ...emptyProductSpuGeneralForm(),
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  attributes: [],
  skus: [],
  productInfos: [],
});

export const productSpuToGeneralFormValues = (product: ProductSpu): ProductSpuGeneralFormValues => ({
  spuCode: product.code,
  name: product.name,
  productKind: ProductKind.MERCHANDISE,
  unitOfMeasure: ProductUnitOfMeasure.EACH,
  categoryUuid: '',
  seasonUuid: '',
  brandId: '',
  taxRateOverride: undefined,
});
