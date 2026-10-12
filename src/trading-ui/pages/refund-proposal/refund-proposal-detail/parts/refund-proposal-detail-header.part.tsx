import { ArrowBack, MoreVert } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { CheckCircleBroken, XCircle } from '@untitledui/icons';
import { type RefundProposalStatus, type IRefundProposalDetail } from '../../../../apis/refund-proposal';
import { REFUND_PROPOSAL_STATUS_LABELS, REFUND_PROPOSAL_STATUS_PILL_SX } from '../../../../common/constant/refund-proposal/refund-proposal.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { formatRefundCreatedAt, getRefundProposalHeaderStatus, showQuickActionBar } from '../refund-proposal-detail.helpers';

const PAGE_PADDING_X = { xs: 2, md: 3 } as const;

const QUICK_BTN_SX = {
  height: 32,
  px: 1.5,
  borderRadius: '10px',
  ...TYPOGRAPHY_STYLES.base.medium,
  textTransform: 'none' as const,
  boxShadow: 'none',
};

interface Props {
  detail: IRefundProposalDetail;
  approveSubmitting: boolean;
  rejectSubmitting: boolean;
  onBack: () => void;
  onApprove: () => void;
  onOpenReject: () => void;
  onOpenMore?: (anchor: HTMLElement) => void;
}

export function RefundProposalDetailHeader({ detail, approveSubmitting, rejectSubmitting, onBack, onApprove, onOpenReject, onOpenMore }: Props) {
  const status = getRefundProposalHeaderStatus(detail);
  const showActions = showQuickActionBar(status);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box
        sx={{
          overflow: 'hidden',
          border: '1px solid #EAECF0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        }}
      >
        <Box sx={{ px: PAGE_PADDING_X, pt: { xs: 1.75, md: 1.5 }, pb: { xs: 2, md: 1.75 } }}>
          <Stack spacing={{ xs: 2, md: 2.25 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1.25} columnGap={2}>
              <CustomButton
                fullWidth={false}
                variant="outline"
                onClick={onBack}
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  border: 'none',
                  boxShadow: 'none',
                  borderRadius: 0,
                  bgcolor: 'transparent',
                  color: '#4A5565',
                  ...TYPOGRAPHY_STYLES.base.regular,
                  '&:hover': { bgcolor: 'transparent', color: '#4A5565' },
                }}
              >
                Quay lại danh sách
              </CustomButton>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
                <PermissionIconButton
                  size="small"
                  onClick={(e) => onOpenMore?.(e.currentTarget)}
                  aria-label="Thao tác khác"
                  sx={{
                    width: 36,
                    height: 36,
                    border: '1px solid #D0D5DD',
                    borderRadius: '10px',
                    color: '#344054',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F9FAFB', borderColor: '#98A2B3' },
                  }}
                >
                  <MoreVert sx={{ fontSize: 20 }} />
                </PermissionIconButton>
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="h1" sx={{ color: '#101828', ...TYPOGRAPHY_STYLES['2xl'].bold, lineHeight: 1.25 }}>
                  {detail.proposalCode}
                </Typography>
                <Typography sx={{ mt: 0.5, color: '#6B7280', ...TYPOGRAPHY_STYLES.base.regular }}>Tạo lúc {formatRefundCreatedAt(detail.createdAt)}</Typography>
              </Box>
              <Chip
                label={REFUND_PROPOSAL_STATUS_LABELS[status] ?? status}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '999px',
                  ...REFUND_PROPOSAL_STATUS_PILL_SX[status as RefundProposalStatus],
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {showActions ? (
          <Box sx={{ px: PAGE_PADDING_X, py: 1.5, bgcolor: '#EEF4FF', borderTop: '1px solid #EAECF0' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.25}>
              <Typography sx={{ color: '#1C398E', ...TYPOGRAPHY_STYLES.base.medium, whiteSpace: 'nowrap' }}>Thao tác nhanh:</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <CustomButton
                  fullWidth={false}
                  variant="primary"
                  onClick={onApprove}
                  disabled={approveSubmitting}
                  startIcon={<CheckCircleBroken size={18} />}
                  sx={{
                    ...QUICK_BTN_SX,
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
                  }}
                >
                  Duyệt hoàn tiền
                </CustomButton>
                <CustomButton
                  fullWidth={false}
                  variant="primary"
                  onClick={onOpenReject}
                  disabled={rejectSubmitting}
                  startIcon={<XCircle size={18} />}
                  sx={{
                    ...QUICK_BTN_SX,
                    bgcolor: '#DC2626',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
                  }}
                >
                  Từ chối
                </CustomButton>
              </Stack>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
