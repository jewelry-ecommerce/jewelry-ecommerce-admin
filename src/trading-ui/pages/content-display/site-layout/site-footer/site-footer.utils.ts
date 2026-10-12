import type { SaveFooterDto } from '../../../../apis';

export type FooterFormErrors = Record<string, string>;

const hasText = (value?: string | null) => typeof value === 'string' && value.trim().length > 0;

export const getMenuItemFieldError = (errors: FooterFormErrors, colIndex: number, itemIndex: number, field: 'label' | 'url'): string | undefined =>
  errors[`menuColumns.${colIndex}.items.${itemIndex}.${field}`];

export const getMenuColumnTitleError = (errors: FooterFormErrors, colIndex: number): string | undefined => errors[`menuColumns.${colIndex}.title`];

export const getSocialFieldError = (errors: FooterFormErrors, index: number, field: 'displayName' | 'url' | 'image'): string | undefined => errors[`socialLinks.${index}.${field}`];

export const validateFooterForm = (form: SaveFooterDto): FooterFormErrors => {
  const errors: FooterFormErrors = {};

  form.menuColumns.forEach((column, colIndex) => {
    if (!hasText(column.title)) {
      errors[`menuColumns.${colIndex}.title`] = 'Vui lòng nhập tiêu đề cột';
    }

    column.items.forEach((item, itemIndex) => {
      if (!hasText(item.label)) {
        errors[`menuColumns.${colIndex}.items.${itemIndex}.label`] = 'Vui lòng nhập nhãn';
      }
      if (!hasText(item.url)) {
        errors[`menuColumns.${colIndex}.items.${itemIndex}.url`] = 'Vui lòng nhập đường dẫn';
      }
    });
  });

  form.socialLinks.forEach((link, index) => {
    if (!hasText(link.displayName)) {
      errors[`socialLinks.${index}.displayName`] = 'Vui lòng nhập tên hiển thị';
    }
    if (!hasText(link.url)) {
      errors[`socialLinks.${index}.url`] = 'Vui lòng nhập đường dẫn';
    }
    if (!hasText(link.image)) {
      errors[`socialLinks.${index}.image`] = 'Vui lòng tải icon nền tảng';
    }
  });

  return errors;
};
