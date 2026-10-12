import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export interface OrderImportStepProcessingPartProps {
  percent: number;
  title?: string;
  description?: string;
}

export const OrderImportStepProcessingPart = ({ percent, title = 'Đang xử lý file', description = 'Hệ thống đang đọc và mapping dữ liệu từ Excel...' }: OrderImportStepProcessingPartProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: { xs: 6, md: 10 }, px: 2, minHeight: 280 }} gap={2.5}>
      <CircularProgress size={52} thickness={4} sx={{ color: '#344054' }} />
      <Stack alignItems="center" gap={0.75}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.semibold, color: '#101828' }}>{title}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', textAlign: 'center' }}>{description}</Typography>
      </Stack>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <LinearProgress
          variant="determinate"
          value={clamped}
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: '#EAECF0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              bgcolor: '#0F172A',
            },
          }}
        />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#667085', textAlign: 'center', mt: 1 }}>{clamped}%</Typography>
      </Box>
    </Stack>
  );
};
