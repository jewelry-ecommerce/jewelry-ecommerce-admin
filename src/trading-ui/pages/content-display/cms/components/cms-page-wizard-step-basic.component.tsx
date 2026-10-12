import { Box, Card, CardContent, InputAdornment, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { Controller, type Control, useWatch, type UseFormSetValue } from 'react-hook-form';
import { File05, Settings01 } from '@untitledui/icons';
import { SelectInput, TextInput } from '../../../../components/form';
import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled';
import type { CmsPageFormValues } from '../cms-page.interface';
import { CMS_PAGE_LOCALE_OPTIONS } from '../cms-page.constants';
import { CmsPageWizardStepActions } from './cms-page-wizard-step-actions.component';
import { TextFieldUploadContent as TextFieldUpload } from '../../components/text-field-upload-content.component';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { MediaVisibility } from '../../../../apis/file/file.enum';
import { getErrorMessage } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';

const slugifyFromDisplayName = (name: string): string => {
  const s = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return s;
};

export interface CmsPageWizardStepBasicProps {
  control: Control<CmsPageFormValues>;
  setValue: UseFormSetValue<CmsPageFormValues>;
  onCancel: () => void;
  onSave: () => void;
  onContinue: () => void;
  loadingSave: boolean;
  loadingContinue: boolean;
  autoSyncSlugFromName?: boolean;
  cancelLabel?: string;
  viewMode?: boolean;
}

const localeSelectOptions = CMS_PAGE_LOCALE_OPTIONS.map((o) => ({ value: o.value, label: o.label }));

export const CmsPageWizardStepBasic: React.FC<CmsPageWizardStepBasicProps> = ({
  control,
  setValue,
  onCancel,
  onSave,
  onContinue,
  loadingSave,
  loadingContinue,
  autoSyncSlugFromName = true,
  cancelLabel = 'Hủy',
  viewMode = false,
}) => {
  const { showSnackbar } = useSnackbar();
  const nameWatch = useWatch({ control, name: 'name' });
  const slugDirtyRef = useRef(false);
  const fieldsDisabled = viewMode;

  useEffect(() => {
    if (viewMode || !autoSyncSlugFromName || slugDirtyRef.current) return;
    const next = slugifyFromDisplayName(String(nameWatch ?? ''));
    setValue('slug', next, { shouldValidate: false, shouldDirty: false });
  }, [autoSyncSlugFromName, nameWatch, setValue, viewMode]);

  return (
    <React.Fragment>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: '#E5E7EB',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <StackRowAlignCenter sx={{ mb: 2 }}>
            <File05 size={22} color="#6B7280" />
            <Box sx={{ pl: 1 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Thông tin cơ bản</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Tên, đường dẫn và trạng thái trang</Typography>
            </Box>
          </StackRowAlignCenter>
          <Stack gap={0}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Tên trang"
                  name={field.name}
                  value={field.value}
                  requiredMark
                  placeholder="VD: Sản phẩm"
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  onChange={field.onChange}
                  disabled={fieldsDisabled}
                />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Tên hiển thị nội bộ, có thể dùng tiếng Việt</Typography>
            <Controller
              name="slug"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Đường dẫn trang"
                  name={field.name}
                  value={field.value}
                  requiredMark
                  placeholder="san-pham"
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  onChange={field.onChange}
                  onFocus={() => {
                    slugDirtyRef.current = true;
                  }}
                  disabled={fieldsDisabled}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">/</InputAdornment>,
                    },
                  }}
                />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Chữ thường, không dấu, dùng dấu gạch ngang. VD: san-pham</Typography>
            <Controller
              name="locale"
              control={control}
              render={({ field, fieldState }) => (
                <SelectInput
                  label="Ngôn ngữ"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  options={localeSelectOptions}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  disabled={fieldsDisabled}
                />
              )}
            />
            <Box sx={{ height: 16 }} />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <HighlightStatusToggle label="Kích hoạt" checked={Boolean(field.value)} name={field.name} disabled={fieldsDisabled} readOnly={fieldsDisabled} onCheckedChange={field.onChange} />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>Cho phép hiển thị trên giao diện cửa hàng</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: 2,
          borderColor: '#E5E7EB',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <StackRowAlignCenter sx={{ mb: 2 }}>
            <Settings01 size={22} color="#6B7280" />
            <Box sx={{ pl: 1 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Cài đặt SEO</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Tối ưu hóa cho công cụ tìm kiếm</Typography>
            </Box>
          </StackRowAlignCenter>
          <Stack gap={0}>
            <Controller
              name="seoTitle"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Tiêu đề SEO"
                  name={field.name}
                  value={field.value ?? ''}
                  placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm"
                  onChange={field.onChange}
                  requiredMark
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  disabled={fieldsDisabled}
                />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Nên từ 50-60 ký tự</Typography>
            <Controller
              name="seoDescription"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Mô tả SEO"
                  name={field.name}
                  value={field.value ?? ''}
                  placeholder="Mô tả ngắn về trang..."
                  multiline
                  minRows={3}
                  onChange={field.onChange}
                  requiredMark
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  disabled={fieldsDisabled}
                />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Nên từ 150-160 ký tự</Typography>
            <Controller
              name="seoKeywords"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Từ khóa"
                  name={field.name}
                  value={field.value ?? ''}
                  placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                  onChange={field.onChange}
                  requiredMark
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  disabled={fieldsDisabled}
                />
              )}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Phân cách bằng dấu phẩy</Typography>
            {/* <Controller
              name="canonicalUrl"
              control={control}
              render={({ field }) => <TextInput label="Đường dẫn chuẩn SEO" name={field.name} value={field.value ?? ''} placeholder="https://example.com/san-pham" onChange={field.onChange} />}
            /> */}
            <Box sx={{ height: 16 }} />
            <Controller
              name="seoImageUrl"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldUpload
                  label="Ảnh chia sẻ (OG Image)"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                  accept="image/*"
                  hintText="Khuyến nghị 1200×630 (tỷ lệ ~1.91:1). Hỗ trợ mọi định dạng ảnh (tối đa 5MB)."
                  previewMode="image"
                  disabled={fieldsDisabled}
                  onPickFile={
                    fieldsDisabled
                      ? undefined
                      : async (file) => {
                          try {
                            const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                            field.onChange(asset?.publicUrl ?? '');
                          } catch (err) {
                            showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
                          }
                        }
                  }
                />
              )}
            />
          </Stack>
        </CardContent>
      </Card>

      <CmsPageWizardStepActions leftLabel={cancelLabel} onLeft={onCancel} onSave={onSave} onContinue={onContinue} loadingSave={loadingSave} loadingContinue={loadingContinue} viewMode={viewMode} />
    </React.Fragment>
  );
};
