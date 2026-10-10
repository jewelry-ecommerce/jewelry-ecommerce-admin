import { DeleteOutlineRounded } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { Plus } from '@untitledui/icons';
import React, { useMemo, useState } from 'react';
import { MediaVisibility } from '../../../../../apis/file/file.enum';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../../common/utils';
import { uploadSingleImage } from '../../../../../common/utils/image-upload.utils';
import { CustomButton } from '../../../../../components/button/custom-button';
import { PermissionIconButton } from '../../../../../components/button/permission-icon-button';

import { SelectInput, TextInput } from '../../../../../components/form';
import { StackRowAlignCenter } from '../../../../../components/styled';
import { TextFieldUploadContent as TextFieldUpload } from '../../../components/text-field-upload-content.component';
import { SnackbarType, useSnackbar } from '../../../../../hooks/use-snackbar.hook';
import type { CmsBlockSchemaDefinition } from '../../../../../apis/cms/cms-schema-definition.interface';
import type { CmsBlockSchemaValidationErrors } from '../../utils/cms-block-schema.utils';
import { IMAGE_GALLERY_MAX_MIX_MATCH_SKUS, normalizeImageGalleryItems, type ImageGalleryItem } from '../../utils/cms-image-gallery-block.utils';
import { CmsMixMatchSkuPicker } from '../cms-mix-match-sku-picker.component';
import { CmsSchemaDefinitionForm } from '../cms-schema-definition-form.component';

interface CmsPageWizardImageGalleryConfigProps {
  schema?: CmsBlockSchemaDefinition | null;
  value: Record<string, unknown>;
  errors?: CmsBlockSchemaValidationErrors;
  onChange: (nextValue: Record<string, unknown>) => void;
  disabled?: boolean;
}

const BANNER_ACTION_OPTIONS = [
  { value: 'LINK_URL', label: 'Gắn đường dẫn' },
  { value: 'MIX_MATCH', label: 'Mix & Match' },
];

const getItemFieldError = (errors: CmsBlockSchemaValidationErrors | undefined, index: number, field: string): string | undefined => errors?.[`items.${index}.${field}`];

const getImageGallerySchemaWithoutItems = (schema?: CmsBlockSchemaDefinition | null): CmsBlockSchemaDefinition | null => {
  if (!schema || schema.type !== 'object') return schema ?? null;
  const next = JSON.parse(JSON.stringify(schema)) as CmsBlockSchemaDefinition & {
    properties?: Record<string, unknown>;
    required?: string[];
  };
  if (next.properties) {
    delete next.properties.items;
  }
  next.required = (next.required ?? []).filter((key) => key !== 'items');
  return next;
};

const updateItems = (value: Record<string, unknown>, onChange: (nextValue: Record<string, unknown>) => void, nextItems: ImageGalleryItem[]) => {
  onChange({
    ...value,
    items: nextItems.map((item) => ({
      imageUrl: item.imageUrl ?? '',
      label: item.label ?? '',
      actionType: item.actionType ?? 'LINK_URL',
      ...(item.actionType === 'MIX_MATCH' ? { mixMatchSkus: item.mixMatchSkus ?? [] } : { actionUrl: item.actionUrl ?? '', mixMatchSkus: [] }),
    })),
  });
};

export const CmsPageWizardImageGalleryConfig: React.FC<CmsPageWizardImageGalleryConfigProps> = ({ schema, value, errors, onChange, disabled = false }) => {
  const { showSnackbar } = useSnackbar();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const headerSchema = useMemo(() => getImageGallerySchemaWithoutItems(schema), [schema]);
  const items = useMemo(() => normalizeImageGalleryItems(value.items), [value.items]);

  const handleHeaderChange = (nextValue: Record<string, unknown>) => {
    onChange({ ...nextValue, items: value.items ?? items });
  };

  const handleItemUpdate = (index: number, patch: Partial<ImageGalleryItem>) => {
    const nextItems = items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    updateItems(value, onChange, nextItems);
  };

  const handleAddItem = () => {
    updateItems(value, onChange, [
      ...items,
      {
        imageUrl: '',
        label: '',
        actionType: 'LINK_URL',
        actionUrl: '',
        mixMatchSkus: [],
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    updateItems(
      value,
      onChange,
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handlePickImage = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
      handleItemUpdate(index, { imageUrl: asset.publicUrl });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <Stack gap={2}>
      <CmsSchemaDefinitionForm schema={headerSchema} value={value} errors={errors} onChange={handleHeaderChange} disabled={disabled} />

      <Stack gap={1.5}>
        <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Danh sách hình ảnh</Typography>
          {!disabled ? (
            <CustomButton type="button" variant="outline" fullWidth={false} onClick={handleAddItem} sx={{ flexShrink: 0 }}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Thêm hình ảnh
            </CustomButton>
          ) : null}
        </StackRowAlignCenter>

        <Stack gap={1.5}>
          {items.map((item, index) => (
            <Box key={`gallery-item-${index}`} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#FFF', p: 1.5 }}>
              <Stack gap={1.5}>
                <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Danh sách hình ảnh #{index + 1}</Typography>
                  {!disabled ? (
                    <PermissionIconButton size="small" aria-label="Xóa hình ảnh" onClick={() => handleRemoveItem(index)}>
                      <DeleteOutlineRounded fontSize="small" />
                    </PermissionIconButton>
                  ) : null}
                </StackRowAlignCenter>

                <Divider />

                <TextInput
                  label="Văn bản hiển thị trên ảnh"
                  disabled={disabled}
                  value={item.label ?? ''}
                  placeholder="@POSTHUMAN.LAB"
                  onChange={(event) => handleItemUpdate(index, { label: event.target.value })}
                />

                <TextFieldUpload
                  label="Hình ảnh"
                  requiredMark
                  disabled={disabled}
                  value={item.imageUrl ?? ''}
                  onChange={(imageUrl) => handleItemUpdate(index, { imageUrl })}
                  onPickFile={(file) => handlePickImage(index, file)}
                  accept="image/*"
                  previewMode="image"
                  processing={uploadingIndex === index}
                  hintText="Hỗ trợ mọi định dạng ảnh (tối đa 5MB)"
                  error={Boolean(getItemFieldError(errors, index, 'imageUrl'))}
                  errorMessage={getItemFieldError(errors, index, 'imageUrl')}
                />

                <SelectInput
                  label="Luồng điều hướng"
                  disabled={disabled}
                  value={item.actionType ?? 'LINK_URL'}
                  options={BANNER_ACTION_OPTIONS}
                  onChange={(event) => {
                    const nextActionType = event.target.value === 'MIX_MATCH' ? 'MIX_MATCH' : 'LINK_URL';
                    handleItemUpdate(index, {
                      actionType: nextActionType,
                      ...(nextActionType === 'MIX_MATCH' ? { mixMatchSkus: item.mixMatchSkus ?? [], actionUrl: '' } : { actionUrl: item.actionUrl ?? '', mixMatchSkus: [] }),
                    });
                  }}
                />

                {item.actionType === 'MIX_MATCH' ? (
                  <CmsMixMatchSkuPicker
                    value={item.mixMatchSkus ?? []}
                    maxItems={IMAGE_GALLERY_MAX_MIX_MATCH_SKUS}
                    disabled={disabled}
                    error={getItemFieldError(errors, index, 'mixMatchSkus')}
                    onChange={(mixMatchSkus) => handleItemUpdate(index, { mixMatchSkus })}
                  />
                ) : (
                  <TextInput
                    label="Đường dẫn khi nhấn vào ảnh"
                    disabled={disabled}
                    value={item.actionUrl ?? ''}
                    placeholder="https://..."
                    onChange={(event) => handleItemUpdate(index, { actionUrl: event.target.value })}
                    error={Boolean(getItemFieldError(errors, index, 'actionUrl'))}
                    errorMessage={getItemFieldError(errors, index, 'actionUrl')}
                  />
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
