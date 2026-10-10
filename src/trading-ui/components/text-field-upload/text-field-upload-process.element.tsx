import { Box, LinearProgress, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { StackAlignCenter } from '../styled';

export interface TextFieldUploadProcessProps {
  progress: number;
  title?: string;
  subtitle?: string;
  sx?: SxProps<Theme>;
}

const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export const TextFieldUploadProcess = ({ progress, title = 'Đang xử lý file', subtitle = 'Hệ thống đang đọc và mapping dữ liệu từ Excel...', sx }: TextFieldUploadProcessProps) => {
  const pct = clampPct(progress);

  return (
    <StackAlignCenter
      sx={{
        width: '100%',
        py: 3,
        px: 2,
        gap: 2,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#111827' }}>{title}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', maxWidth: 360 }}>{subtitle}</Typography>
      <Box sx={{ width: '100%', maxWidth: 360, mt: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 12,
            borderRadius: 999,
            bgcolor: '#E5E7EB',
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              bgcolor: '#101828',
              transition: 'transform 0.2s linear',
            },
          }}
        />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 1 }}>{pct}%</Typography>
      </Box>
    </StackAlignCenter>
  );
};
