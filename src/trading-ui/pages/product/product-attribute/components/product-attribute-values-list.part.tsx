import CloseRounded from '@mui/icons-material/CloseRounded';
import DragIndicatorOutlined from '@mui/icons-material/DragIndicatorOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';
import { productAttributesButtonPermission } from '../../product-permission.constants';
import { useEffect, useState, type Ref } from 'react';
import { Controller, useFieldArray, useWatch, type Control, type UseFormGetValues } from 'react-hook-form';
import { StackRowAlignCenter, StackRowAlignJustCenter } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TextInput } from '../../../../components/form';
import { createEmptyProductAttributeValueRow, type ProductAttributeFormValues } from '../product-attribute.constant';
import { Upload01 } from '@untitledui/icons';
import { AttributeDisplayType } from '../../../../apis/attribute/attribute.enum';

const restoreInputFocus = (el: Element | null, selectionStart: number | null, selectionEnd: number | null): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!(el instanceof HTMLElement) || !document.body.contains(el)) return;
      el.focus({ preventScroll: true });
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        if (selectionStart !== null && selectionEnd !== null && el.type !== 'number') {
          try {
            el.setSelectionRange(selectionStart, selectionEnd);
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  });
};

interface SwatchImageUploadFieldProps {
  value: string | File | null | undefined;
  onChange: (v: string | File) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
}

const SwatchImageUploadField = ({ value, onChange, onBlur, inputRef }: SwatchImageUploadFieldProps) => {
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      setFilePreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(value);
    setFilePreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);

  const previewSrc = value instanceof File ? filePreviewUrl : typeof value === 'string' && value.trim() ? value.trim() : null;
  const hasImage = Boolean(previewSrc);

  return (
    <Box
      component="label"
      sx={{
        position: 'relative',
        width: 30,
        height: 30,
        flexShrink: 0,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {hasImage ? (
        <Box component="img" src={previewSrc ?? ''} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <StackRowAlignJustCenter
          sx={{
            width: 30,
            height: 30,
            border: '1px dashed #CBD5E1',
          }}
        >
          <Upload01 color="#6B7280" size={16} />
        </StackRowAlignJustCenter>
      )}
      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Tải ảnh giá trị màu"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file || !file.type.startsWith('image/')) return;
          onChange(file);
        }}
        onBlur={onBlur}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
      />
    </Box>
  );
};

interface ProductAttributeValuesListProps {
  control: Control<ProductAttributeFormValues>;
  getValues: UseFormGetValues<ProductAttributeFormValues>;
  dataType: AttributeDisplayType;
  isValueCodeDisabled?: (rowCode: string) => boolean;
}

export const ProductAttributeValuesList = ({ control, getValues, dataType, isValueCodeDisabled }: ProductAttributeValuesListProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'values' });
  const rows = useWatch({ control, name: 'values' });

  const showSwatchImage = dataType === AttributeDisplayType.IMAGE;

  const tryAppendTrailingEmptyRow = () => {
    requestAnimationFrame(() => {
      const list = getValues('values');
      if (!list?.length) return;
      const last = list[list.length - 1];
      if (!last.code.trim() || !last.value.trim()) return;

      const active = document.activeElement;
      const selectionStart = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? active.selectionStart : null;
      const selectionEnd = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? active.selectionEnd : null;

      append(createEmptyProductAttributeValueRow());
      restoreInputFocus(active, selectionStart, selectionEnd);
    });
  };

  const removeRow = (index: number) => {
    remove(index);
    if ((getValues('values') ?? []).length === 0) {
      append(createEmptyProductAttributeValueRow());
    }
  };

  return (
    <Stack sx={{ gap: 1.5, mt: 1 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Danh sách giá trị</Typography>

      <Stack sx={{ gap: 1.5, maxHeight: 400, overflowY: 'auto' }}>
        {fields.map((field, index) => {
          const row = rows?.[index];
          const showRemove = Boolean(row?.code?.trim() && row?.value?.trim());
          const codeLocked = Boolean(isValueCodeDisabled?.(String(row?.code ?? '')));

          return (
            <StackRowAlignCenter key={field.id} sx={{ gap: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
              <DragIndicatorOutlined sx={{ fontSize: 22, color: '#9CA3AF', flexShrink: 0 }} />

              {showSwatchImage ? (
                <Controller
                  name={`values.${index}.image`}
                  control={control}
                  render={({ field }) => <SwatchImageUploadField value={field.value ?? null} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} />}
                />
              ) : null}

              <Box sx={{ flexShrink: 0 }}>
                <Controller
                  name={`values.${index}.code`}
                  control={control}
                  render={({ field: codeField, fieldState }) => (
                    <TextInput
                      placeholder="Mã giá trị"
                      value={codeField.value}
                      onChange={(e) => {
                        codeField.onChange(e.target.value);
                        tryAppendTrailingEmptyRow();
                      }}
                      onBlur={codeField.onBlur}
                      inputRef={codeField.ref}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                      size="small"
                      disabled={codeLocked}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Controller
                  name={`values.${index}.value`}
                  control={control}
                  render={({ field: valueField, fieldState }) => (
                    <TextInput
                      placeholder="Tên giá trị"
                      type="text"
                      value={valueField.value}
                      onChange={(e) => {
                        valueField.onChange(e.target.value);
                        tryAppendTrailingEmptyRow();
                      }}
                      onBlur={valueField.onBlur}
                      inputRef={valueField.ref}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                      size="small"
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: 40, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {showRemove ? (
                  <PermissionIconButton
                    type="button"
                    size="small"
                    aria-label="Xoá dòng"
                    onClick={() => removeRow(index)}
                    {...productAttributesButtonPermission('edit', 'Xoá giá trị thuộc tính', 'api_attribute_update')}
                  >
                    <CloseRounded sx={{ fontSize: 20, color: '#6B7280' }} />
                  </PermissionIconButton>
                ) : null}
              </Box>
            </StackRowAlignCenter>
          );
        })}
      </Stack>
    </Stack>
  );
};
