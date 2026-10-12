import * as yup from 'yup';
import { type CategoryRequestDto } from '../../../../apis';
import { type CategoryStatus } from '../../../../apis/category/category.enum';

export const toggleExpandedId = (prev: Set<string>, id: string): Set<string> => {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

export const categoryFormSchema: yup.ObjectSchema<CategoryRequestDto> = yup
  .object({
    name: yup.string().trim().required('Vui lòng nhập Tên Danh mục'),
    code: yup.string().trim().required('Vui lòng nhập Mã Danh mục'),
    isDisplay: yup.boolean().optional(),
    taxRate: yup.number().required('Vui lòng nhập Thuế suất'),
    logo: yup.string().optional(),
    image: yup.string().optional(),
    parentId: yup.string().optional(),
    metaTitle: yup.string().optional(),
    metaDescription: yup.string().optional(),
    metaKeywords: yup.string().optional(),
    // tui mún directAttributeIds là optional
    directAttributeIds: yup.array().of(yup.string().trim().required()).optional(),
    status: yup.mixed<CategoryStatus>().required('Trạng thái không được để trống'),
  })
  .required();
