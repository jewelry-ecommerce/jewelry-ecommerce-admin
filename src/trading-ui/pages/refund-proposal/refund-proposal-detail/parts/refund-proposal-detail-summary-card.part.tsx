import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { Star01 } from '@untitledui/icons';
import type { IRefundProposalDetail } from '../../../../apis/refund-proposal';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { parseAmount } from '../../../../common/utils/number.utils';
import { REFUND_PROPOSAL_TYPE_PILL, formatRefundVnd } from '../refund-proposal-detail.helpers';
import { getRefundProposalPaymentLabel } from '../../refund-proposal-list/refund-proposal-list.helpers';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const rowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 };
const labelSx = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' };
const valueSx = { ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' };

interface Props {
  detail: IRefundProposalDetail;
}

export function RefundProposalDetailSummaryCard({ detail }: Props) {
  const financial = detail.financialSummary;
  const netRevenue = parseAmount(financial?.netRevenue ?? detail.netPaidAmount ?? detail.totalRefundAmount);
  const otherNoRefund = parseAmount(financial?.otherRevenueNoRefund ?? 0);
  const loyalty = financial?.loyaltyPoints ?? 0;
  const totalRefund = parseAmount(detail.totalRefundAmount);
  const paymentLabel = getRefundProposalPaymentLabel(detail);

  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 2 }}>Thông tin hoàn tiền</Typography>

      <Stack gap={1.5}>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Loại yêu cầu</Typography>
          <Chip
            label={REFUND_PROPOSAL_TYPE_PILL.label}
            size="small"
            sx={{
              height: 24,
              borderRadius: '999px',
              color: REFUND_PROPOSAL_TYPE_PILL.color,
              backgroundColor: REFUND_PROPOSAL_TYPE_PILL.backgroundColor,
              ...TYPOGRAPHY_STYLES.sm.medium,
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        </Box>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', mt: 0.5 }}>Chi tiết tài chính</Typography>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Giá trị thực thu gốc</Typography>
          <Typography sx={valueSx}>{formatRefundVnd(netRevenue)}</Typography>
        </Box>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', mt: 0.5 }}>Doanh thu khác</Typography>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Doanh thu khác (No Refund)</Typography>
          <Typography sx={valueSx}>{formatRefundVnd(otherNoRefund)}</Typography>
        </Box>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Điểm Loyalty nhận được</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Star01 size={14} color="#F59E0B" />
            <Typography sx={valueSx}>{loyalty}</Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#EAECF0', my: 0.5 }} />

        <Box sx={rowSx}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Tổng tiền hoàn</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#101828' }}>{formatRefundVnd(totalRefund)}</Typography>
        </Box>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Phương thức hoàn tiền</Typography>
          <Typography sx={valueSx}>{paymentLabel}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
