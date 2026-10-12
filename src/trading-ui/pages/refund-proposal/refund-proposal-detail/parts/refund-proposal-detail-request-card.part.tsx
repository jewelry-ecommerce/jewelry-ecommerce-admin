import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { type IRefundProposalDetail } from '../../../../apis/refund-proposal';
import { REFUND_PROPOSAL_REASON_LABELS } from '../../../../common/constant/refund-proposal/refund-proposal.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getRelatedOrderCode } from '../refund-proposal-detail.helpers';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const labelSx = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 };
const valueSx = { ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' };

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <Box>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value?.trim() || '—'}</Typography>
  </Box>
);

interface Props {
  detail: IRefundProposalDetail;
  onOpenRelatedOrder?: () => void;
}

export function RefundProposalDetailRequestCard({ detail, onOpenRelatedOrder }: Props) {
  const relatedCode = getRelatedOrderCode(detail);
  const reasonLabel = detail.reason ? REFUND_PROPOSAL_REASON_LABELS[detail.reason] : undefined;
  const showBankBlock = detail.bankAccountHolder || detail.bankAccountNumber || detail.bankName || detail.bankBranch;

  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 2 }}>Yêu cầu hoàn tiền</Typography>

      <Stack gap={2}>
        <Box>
          <Typography sx={labelSx}>Mã yêu cầu hoàn tiền</Typography>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <Typography sx={valueSx}>{relatedCode}</Typography>
            {onOpenRelatedOrder ? (
              <Link component="button" type="button" underline="none" onClick={onOpenRelatedOrder} sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#155DFC', cursor: 'pointer' }}>
                Xem đơn hàng liên quan
              </Link>
            ) : null}
          </Stack>
        </Box>

        <Field label="Lý do hoàn tiền" value={reasonLabel || detail.detailNote || undefined} />

        {showBankBlock ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              columnGap: 2,
              rowGap: 2,
            }}
          >
            <Field label="Tên chủ tài khoản" value={detail.bankAccountHolder} />
            <Field label="Số tài khoản ngân hàng" value={detail.bankAccountNumber} />
            <Field label="Tên ngân hàng" value={detail.bankName} />
            <Field label="Chi nhánh ngân hàng" value={detail.bankBranch} />
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
