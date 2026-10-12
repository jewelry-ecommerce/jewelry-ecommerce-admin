import { ErrorOutline, InboxOutlined } from '@mui/icons-material';
import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

export type PageStateVariant = 'empty' | 'error';

export interface PageStateComponentProps {
  variant?: PageStateVariant;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
}

export const PageStateComponent = ({ variant = 'empty', title, description, sx }: PageStateComponentProps) => {
  const isError = variant === 'error';
  const Icon = isError ? ErrorOutline : InboxOutlined;

  return (
    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 280, textAlign: 'center', color: '#667085', ...sx }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: isError ? '#FEF3F2' : '#F2F4F7',
          color: isError ? '#D92D20' : '#475467',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon fontSize="medium" />
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1D2939' }}>{title || (isError ? 'Có lỗi xảy ra' : 'Không có dữ liệu')}</Typography>
      {description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>{description}</Typography> : null}
    </Stack>
  );
};
