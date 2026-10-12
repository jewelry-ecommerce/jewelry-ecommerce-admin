import { Box, Stack, Typography } from '@mui/material';
import { XCircle } from '@untitledui/icons';
import type { IOrderCancellationMetadata } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDateTime } from '../../../../common/utils';

export interface OrderDetailCancellationCardProps {
  cancellation: IOrderCancellationMetadata;
}

export function OrderDetailCancellationCard({ cancellation }: OrderDetailCancellationCardProps) {
  const note = cancellation.note?.trim();
  const cancelledAtLabel = cancellation.cancelledAt ? formatDateTime(cancellation.cancelledAt) : '';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: '#FEF3F2',
        border: '1px solid #FEE4E2',
      }}
    >
      <Stack direction="row" alignItems="flex-start" gap={1.25}>
        <XCircle size={20} color="#F04438" style={{ flexShrink: 0, marginTop: 2 }} />
        <Stack gap={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#B42318' }}>Đơn hàng đã hủy{cancelledAtLabel ? ` lúc ${cancelledAtLabel}` : ''}</Typography>
          {note ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#912018', whiteSpace: 'pre-wrap' }}>Ghi chú: {note}</Typography> : null}
        </Stack>
      </Stack>
    </Box>
  );
}
