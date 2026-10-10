import * as yup from "yup";
import type { CmsPageFormValues } from "./cms-source-form.interface";
export const CMS_PAGE_LOCALE_OPTIONS = [{ value: "vi-VN", label: "Tiếng Việt (vi-VN)" }] as const;
export const CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH = 1600;
export const CMS_PAGE_WIZARD_STEPS = ["Thông tin trang", "Khối nội dung", "Xuất bản"];
export const cmsPageFormSchema: yup.ObjectSchema<CmsPageFormValues> = yup
  .object({
    name: yup.string().trim().required("Vui lòng nhập tên trang"),
    slug: yup
      .string()
      .trim()
      .required("Vui lòng nhập đường dẫn trang")
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ dùng chữ thường, số và dấu gạch ngang"),
    locale: yup.string().required(),
    isActive: yup.boolean().required(),
    seoTitle: yup.string().trim().required("Vui lòng nhập tiêu đề SEO"),
    seoDescription: yup.string().trim().required("Vui lòng nhập mô tả SEO"),
    seoKeywords: yup.string().optional(),
    canonicalUrl: yup.string().optional(),
    seoImageUrl: yup.string().optional(),
  })
  .required();
