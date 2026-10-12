import { Box, Stack, Typography } from '@mui/material';
import { CustomButton } from '../../../../../components/button';
import { contentNavigationButtonPermission } from '../../../content-permission.constants';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { CmsNavigation, CmsNavigationBadge, CmsNavigationBadgeDesignType } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { ColorPaletteField } from '../../../../../components/color-palette-field/color-palette-field.component';
import { SelectInput, TextInput } from '../../../../../components/form';
import { formLabelSx, formInputSx } from '../../../../../components/form/form-field.styles';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import { TextFieldUploadContent as TextFieldUpload } from '../../../components/text-field-upload-content.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { MediaVisibility } from '../../../../../apis/file/file.enum';
import { uploadSingleImage } from '../../../../../common/utils/image-upload.utils';
import { getErrorMessage } from '../../../../../common/utils';
import { BADGE_IMAGE_ACCEPT, BADGE_TYPE_OPTIONS } from '../site-navigation.constant';
import type { NavigationFormState } from '../site-navigation.interface';
import type { Dispatch, SetStateAction } from 'react';
import { formatBadgeLabel } from '../site-navigation.utils';

export type NavigationBadgeSectionProps = {
  fieldsDisabled?: boolean;
  form: NavigationFormState;
  formErrors: Record<string, string>;
  selectedDetail?: CmsNavigation;
  updateForm: <K extends keyof NavigationFormState>(key: K, value: NavigationFormState[K]) => void;
  setForm: Dispatch<SetStateAction<NavigationFormState>>;
  onSelectBadge: (badge: CmsNavigationBadge) => void;
};

export const NavigationBadgeSection = ({ fieldsDisabled = false, form, formErrors, selectedDetail, updateForm, setForm, onSelectBadge }: NavigationBadgeSectionProps) => {
  const { showSnackbar } = useSnackbar();

  return (
    <Stack gap={2} sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', p: 2, bgcolor: '#FFFFFF' }}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Cấu hình nhãn dán</Typography>
        <SwitchContentElement
          content={form.badgeEnabled ? 'Bật nhãn' : 'Không chỉnh nhãn'}
          value={form.badgeEnabled}
          disabled={fieldsDisabled}
          onChange={(event) => updateForm('badgeEnabled', Boolean(event?.target?.value))}
        />
      </StackRowAlignCenterJustBetween>

      {selectedDetail?.badges?.length && !fieldsDisabled ? (
        <StackRowAlignCenter gap={1} sx={{ flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <CustomButton
            type="button"
            fullWidth={false}
            size="small"
            variant={!form.badgeId && form.badgeEnabled ? 'primary' : 'outline'}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                badgeEnabled: true,
                badgeId: '',
                badgeStartTime: null,
                badgeEndTime: null,
              }))
            }
            sx={{ flexShrink: 0, py: 0.75, px: 1.5, minHeight: 32 }}
          >
            Tạo nhãn mới
          </CustomButton>
          {selectedDetail.badges.map((badge) => (
            <CustomButton
              key={badge.id}
              type="button"
              fullWidth={false}
              size="small"
              variant={form.badgeId === badge.id ? 'primary' : 'outline'}
              onClick={() => onSelectBadge(badge)}
              sx={{ flexShrink: 0, py: 0.75, px: 1.5, minHeight: 32 }}
              {...contentNavigationButtonPermission('navigation_select_badge', `Chọn nhãn ${formatBadgeLabel(badge)}`, 'api_cms_navigation_update')}
            >
              {formatBadgeLabel(badge)}
            </CustomButton>
          ))}
          {form.badgeEnabled && form.badgeDesignType === 'TEXT' ? (
            <Box
              sx={{
                ml: 'auto',
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: form.badgeBackgroundColor || '#E53935',
                color: form.badgeTextColor || '#FFFFFF',
                minWidth: 56,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: 'inherit' }}>{form.badgeDisplayText.trim() || '—'}</Typography>
            </Box>
          ) : null}
        </StackRowAlignCenter>
      ) : null}

      {form.badgeEnabled ? (
        <Stack gap={2}>
          <SelectInput
            label="Loại nhãn"
            requiredMark
            disabled={fieldsDisabled}
            value={form.badgeDesignType}
            options={BADGE_TYPE_OPTIONS}
            onChange={(event) => updateForm('badgeDesignType', event.target.value as CmsNavigationBadgeDesignType)}
          />

          {form.badgeDesignType === 'TEXT' ? (
            <>
              <TextInput
                label="Văn bản nhãn"
                requiredMark
                disabled={fieldsDisabled}
                value={form.badgeDisplayText}
                placeholder="HOT"
                inputProps={{ maxLength: 5 }}
                error={Boolean(formErrors.badgeDisplayText)}
                errorMessage={formErrors.badgeDisplayText}
                onChange={(event) => updateForm('badgeDisplayText', event.target.value.toUpperCase())}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ColorPaletteField label="Màu nền" disabled={fieldsDisabled} value={form.badgeBackgroundColor} onChange={(next) => updateForm('badgeBackgroundColor', next)} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ColorPaletteField label="Màu chữ" disabled={fieldsDisabled} value={form.badgeTextColor} onChange={(next) => updateForm('badgeTextColor', next)} />
                </Box>
              </Stack>
            </>
          ) : (
            <TextFieldUpload
              label="Tải ảnh nhãn"
              requiredMark
              disabled={fieldsDisabled}
              value={form.badgeImageUrl}
              onChange={(next) => updateForm('badgeImageUrl', next)}
              accept={BADGE_IMAGE_ACCEPT}
              previewMode="image"
              error={Boolean(formErrors.badgeImageUrl)}
              errorMessage={formErrors.badgeImageUrl}
              onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
              onPickFile={async (file) => {
                try {
                  const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                  updateForm('badgeImageUrl', asset.publicUrl ?? '');
                } catch (err) {
                  showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
                }
              }}
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={formLabelSx}>Thời gian bắt đầu</Typography>
              <DateTimePicker
                value={form.badgeStartTime}
                onChange={(value) => updateForm('badgeStartTime', value)}
                disabled={fieldsDisabled}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    disabled: fieldsDisabled,
                    sx: formInputSx,
                    error: Boolean(formErrors.badgeStartTime),
                    helperText: formErrors.badgeStartTime,
                    placeholder: 'dd/mm/yyyy hh:mm',
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={formLabelSx}>Thời gian kết thúc</Typography>
              <DateTimePicker
                value={form.badgeEndTime}
                onChange={(value) => updateForm('badgeEndTime', value)}
                disabled={fieldsDisabled}
                format="DD/MM/YYYY HH:mm"
                minDateTime={form.badgeStartTime ?? undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    disabled: fieldsDisabled,
                    sx: formInputSx,
                    error: Boolean(formErrors.badgeEndTime),
                    helperText: formErrors.badgeEndTime,
                    placeholder: 'Không giới hạn',
                  },
                }}
              />
            </Box>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};
