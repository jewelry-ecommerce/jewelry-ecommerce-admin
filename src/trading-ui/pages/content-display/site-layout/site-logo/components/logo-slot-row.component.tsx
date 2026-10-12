import { Box, Stack, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import type { LogoType } from '../../../../../apis';
import { MediaVisibility } from '../../../../../apis/file/file.enum';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { uploadSingleImage } from '../../../../../common/utils/image-upload.utils';
import { TextInput } from '../../../../../components/form';
import { StackRowAlignCenter } from '../../../../../components/styled';
import { TextFieldUploadContent as TextFieldUpload } from '../../../components/text-field-upload-content.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../../common/utils';
import { LOGO_NAME_MAX_LENGTH, LOGO_SLOT_META } from '../site-logo.constants';
import type { LogoSlotFormValues } from '../site-logo.interface';

type LogoSlotRowProps = {
  slot: LogoSlotFormValues;
  disabled?: boolean;
  nameError?: string;
  logoError?: string;
  onChange: (patch: Partial<LogoSlotFormValues>) => void;
};

export const LogoSlotRow = ({ slot, disabled = false, nameError, logoError, onChange }: LogoSlotRowProps) => {
  const { showSnackbar } = useSnackbar();
  const meta = LOGO_SLOT_META[slot.type as LogoType];

  return (
    <Stack
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        p: 2,
        gap: 2,
      }}
    >
      <StackRowAlignCenter gap={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: meta.tagBackground,
            color: meta.tagColor,
            ...TYPOGRAPHY_STYLES.xs.semibold,
            flexShrink: 0,
          }}
        >
          {meta.tag}
        </Box>
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{meta.title}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280' }}>{meta.subtitle}</Typography>
        </Stack>
      </StackRowAlignCenter>

      <Stack gap={1.5}>
        {meta.showNameField ? (
          <Box>
            <TextInput
              label="Tên bản cấu hình"
              requiredMark
              disabled={disabled}
              value={slot.name}
              onChange={(event) => onChange({ name: event.target.value.slice(0, LOGO_NAME_MAX_LENGTH) })}
              error={Boolean(nameError)}
              errorMessage={nameError}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>
              {slot.name.length}/{LOGO_NAME_MAX_LENGTH} ký tự
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: 1,
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              p: 1.5,
            }}
          >
            <StackRowAlignCenter gap={1} sx={{ alignItems: 'flex-start' }}>
              <InfoOutlined sx={{ fontSize: 18, color: '#2563EB', mt: 0.25 }} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#1E40AF' }}>Để tối ưu hiển thị trên tab trình duyệt, dùng favicon hình vuông (dưới 100KB, tối thiểu 32x32px).</Typography>
            </StackRowAlignCenter>
          </Box>
        )}

        <TextFieldUpload
          label="File logo"
          requiredMark
          disabled={disabled}
          value={slot.logoUrl}
          onChange={(next) => onChange({ logoUrl: next })}
          onFileReject={(reason) => {
            showSnackbar({
              type: SnackbarType.ERROR,
              message: reason,
            });
          }}
          onPickFile={async (file) => {
            try {
              const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
              onChange({ logoUrl: asset?.publicUrl ?? '' });
            } catch (error) {
              showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
            }
          }}
          error={Boolean(logoError)}
          errorMessage={logoError}
          accept="image/*"
          previewMode="image"
        />
      </Stack>
    </Stack>
  );
};
