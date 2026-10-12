import * as yup from 'yup';
import type { AttributeRequestDto, CreateAttributeValueDto } from '../../../apis/attribute/attribute.interface';
import { type AttributeDisplayType, type AttributeStatus } from '../../../apis/attribute/attribute.enum';

export type ProductAttributeFormValues = Omit<AttributeRequestDto, 'values' | 'isVariantAxis'> & {
  values: (Omit<CreateAttributeValueDto, 'image'> & { image?: string | File; _valueId?: string })[];
};

export const PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS = [
  { value: 'TEXT', label: 'Văn bản' },
  { value: 'IMAGE', label: 'Hình ảnh' },
] as const;

export const createEmptyProductAttributeValueRow = (): CreateAttributeValueDto => ({
  code: '',
  value: '',
  image: '',
});

const valueRowShape = {
  code: yup.string().default(''),
  value: yup.string().default(''),
  image: yup.mixed<string | File>().optional().default(''),
  _valueId: yup.string().optional(),
};

export const productAttributeCreateFormSchema: yup.ObjectSchema<ProductAttributeFormValues> = yup
  .object({
    code: yup.string().required('Mã thuộc tính không được để trống'),
    name: yup.string().required('Tên thuộc tính không được để trống'),
    displayType: yup.mixed<AttributeDisplayType>().required('Loại thuộc tính không được để trống'),
    status: yup.mixed<AttributeStatus>().required('Trạng thái không được để trống'),
    isVariantAxis: yup.boolean().optional(),
    values: yup.array().of(yup.object(valueRowShape)).default([]),
  })
  .required();

export const productAttributeUpdateFormSchema: yup.ObjectSchema<Partial<ProductAttributeFormValues>> = yup
  .object({
    code: yup.string().optional(),
    name: yup.string().required('Tên thuộc tính không được để trống'),
    displayType: yup.mixed<AttributeDisplayType>().required('Loại thuộc tính không được để trống'),
    status: yup.mixed<AttributeStatus>().required('Trạng thái không được để trống'),
    isVariantAxis: yup.boolean().optional(),
    values: yup.array().of(yup.object(valueRowShape)).default([]).optional(),
  })
  .required();
