import { Box, Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import { InfoCircle } from '@untitledui/icons';

interface ReturnExchangeOrderSummaryValue {
  orderCode: string;
  customerName: string;
}

export interface ReturnExchangeOrderSummaryPartProps {
  orderSummary: ReturnExchangeOrderSummaryValue | null;
}

export const ReturnExchangeOrderSummaryPart = ({ orderSummary }: ReturnExchangeOrderSummaryPartProps) => {
  return (
    <Box sx={{ border: '1px solid #EAECF0', borderRadius: 2, p: '17px' }}>
      <StackRowAlignCenter sx={{ mb: 1.25 }} gap={1}>
        <InfoCircle color="#6A7282" size={16} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Thông tin đơn hàng</Typography>
      </StackRowAlignCenter>
      <Stack direction="row" justifyContent="space-between">
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Mã đơn:</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Khách hàng:</Typography>
        </Stack>
        <Stack gap={1} alignItems="flex-end">
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{orderSummary?.orderCode || '—'}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{orderSummary?.customerName || '—'}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
