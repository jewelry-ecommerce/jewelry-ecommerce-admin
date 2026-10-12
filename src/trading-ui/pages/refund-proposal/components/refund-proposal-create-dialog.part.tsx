import CloseRounded from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { RefundProposalPaymentChannel, RefundProposalReason, RefundProposalSourceType } from '../../../apis/refund-proposal';
import { REFUND_PROPOSAL_PAYMENT_LABELS, REFUND_PROPOSAL_REASON_LABELS, REFUND_PROPOSAL_SOURCE_LABELS } from '../../../common/constant/refund-proposal/refund-proposal.constants';
import { formatCurrency, parseAmount } from '../../../common/utils/number.utils';
import { CustomButton, PermissionIconButton } from '../../../components/button';
import { orderRefundsButtonPermission } from '../../order/order-permission.constants';

export interface RefundProposalCustomerSnapshotPayload {
  firstName?: string;
  contactEmail?: string;
  shippingAddressLine?: string;
  shippingWardName?: string;
  shippingProvinceName?: string;
  shippingProvinceCode?: number;
  shippingWardCode?: string;
  customerAddress?: string;
  receiverPhone?: string;
}

export interface RefundProposalCreatePayload {
  reason: RefundProposalReason;
  detailNote?: string;
  firstName?: string;
  contactEmail?: string;
  shippingAddressLine?: string;
  shippingWardName?: string;
  shippingProvinceName?: string;
  shippingProvinceCode?: number;
  shippingWardCode?: string;
  customerAddress?: string;
  receiverPhone?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
}

export interface RefundProposalCreateDialogProps {
  open: boolean;
  submitting?: boolean;
  /** Mã hiển thị: orderCode hoặc RMA code. */
  sourceCode: string;
  sourceType: RefundProposalSourceType;
  totalRefundAmount: number;
  paymentChannel: RefundProposalPaymentChannel;
  customerSnapshot?: RefundProposalCustomerSnapshotPayload;
  onClose: () => void;
  onConfirm: (payload: RefundProposalCreatePayload) => void;
}

const READ_ONLY_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    height: 44,
    borderRadius: '10px',
    backgroundColor: '#F3F4F6',
  },
  '& .MuiOutlinedInput-input': { fontSize: 14, color: '#101828' },
  '& fieldset': { borderColor: '#E5E7EB' },
} as const;

const FIELD_SX = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#FFFFFF' },
  '& .MuiOutlinedInput-input': { fontSize: 14 },
} as const;

const FIELD_LABEL_SX = { fontSize: 14, fontWeight: 500, color: '#101828', mb: 0.75 };

const REASON_OPTIONS = Object.values(RefundProposalReason).map((value) => ({
  value,
  label: REFUND_PROPOSAL_REASON_LABELS[value],
}));

const formatRefundAmount = (value: number) => `${formatCurrency(parseAmount(value))} đ`;

const omitEmpty = <T extends Record<string, unknown>>(obj: T): Partial<T> => Object.fromEntries(Object.entries(obj).filter(([, value]) => value != null && value !== '')) as Partial<T>;

export function RefundProposalCreateDialog({
  open,
  submitting = false,
  sourceCode,
  sourceType,
  totalRefundAmount,
  paymentChannel,
  customerSnapshot,
  onClose,
  onConfirm,
}: RefundProposalCreateDialogProps) {
  const [reason, setReason] = useState<RefundProposalReason | ''>('');
  const [detailNote, setDetailNote] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setDetailNote('');
      setBankAccountHolder('');
      setBankAccountNumber('');
      setBankName('');
      setBankBranch('');
    }
  }, [open]);

  const isCod = paymentChannel === RefundProposalPaymentChannel.COD;
  const sourceLabel = sourceType === RefundProposalSourceType.RMA ? REFUND_PROPOSAL_SOURCE_LABELS[RefundProposalSourceType.RMA] : REFUND_PROPOSAL_SOURCE_LABELS[RefundProposalSourceType.CANCEL];
  const sourceFieldLabel = sourceType === RefundProposalSourceType.RMA ? 'Mã đơn RMA' : 'Mã đơn gốc';

  const codBankInvalid = isCod && (!bankAccountHolder.trim() || !bankAccountNumber.trim() || !bankName.trim());
  const detailNoteRequired = reason === RefundProposalReason.OTHER && !detailNote.trim();
  const confirmDisabled = !reason || submitting || codBankInvalid || detailNoteRequired;

  const handleSubmit = () => {
    if (confirmDisabled || !reason) return;

    const shippingProvinceCode = customerSnapshot?.shippingProvinceCode;

    onConfirm({
      reason,
      ...omitEmpty({
        detailNote: detailNote.trim(),
        firstName: customerSnapshot?.firstName?.trim(),
        contactEmail: customerSnapshot?.contactEmail?.trim(),
        shippingAddressLine: customerSnapshot?.shippingAddressLine?.trim(),
        shippingWardName: customerSnapshot?.shippingWardName?.trim(),
        shippingProvinceName: customerSnapshot?.shippingProvinceName?.trim(),
        shippingProvinceCode: typeof shippingProvinceCode === 'number' && Number.isFinite(shippingProvinceCode) ? shippingProvinceCode : undefined,
        shippingWardCode: customerSnapshot?.shippingWardCode?.trim(),
        customerAddress: customerSnapshot?.customerAddress?.trim(),
        receiverPhone: customerSnapshot?.receiverPhone?.trim(),
        ...(isCod
          ? {
              bankAccountHolder: bankAccountHolder.trim().toUpperCase(),
              bankAccountNumber: bankAccountNumber.trim(),
              bankName: bankName.trim(),
              bankBranch: bankBranch.trim(),
            }
          : {}),
      }),
    });
  };

  const handleRequestClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleRequestClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px', maxWidth: 720 } } }}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>
          Yêu cầu hoàn tiền
        </Typography>
        <PermissionIconButton size="small" onClick={handleRequestClose} disabled={submitting} sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 22 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2,
            rowGap: 2.25,
          }}
        >
          <Box>
            <Typography sx={FIELD_LABEL_SX}>{sourceFieldLabel}</Typography>
            <TextField fullWidth value={sourceCode} InputProps={{ readOnly: true }} sx={READ_ONLY_FIELD_SX} />
          </Box>
          <Box>
            <Typography sx={FIELD_LABEL_SX}>Nguồn</Typography>
            <TextField fullWidth value={sourceLabel} InputProps={{ readOnly: true }} sx={READ_ONLY_FIELD_SX} />
          </Box>

          <Box>
            <Typography sx={FIELD_LABEL_SX}>Tổng tiền hoàn dự kiến</Typography>
            <TextField fullWidth value={formatRefundAmount(totalRefundAmount)} InputProps={{ readOnly: true }} sx={READ_ONLY_FIELD_SX} />
          </Box>
          <Box>
            <Typography sx={FIELD_LABEL_SX}>Phương thức thanh toán gốc</Typography>
            <TextField fullWidth value={REFUND_PROPOSAL_PAYMENT_LABELS[paymentChannel]} InputProps={{ readOnly: true }} sx={READ_ONLY_FIELD_SX} />
          </Box>

          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <Typography sx={FIELD_LABEL_SX}>
              Lý do hoàn tiền{' '}
              <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                *
              </Typography>
            </Typography>
            <TextField
              select
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value as RefundProposalReason)}
              SelectProps={{
                IconComponent: KeyboardArrowDownRounded,
                displayEmpty: true,
                renderValue: (selected) =>
                  selected ? REFUND_PROPOSAL_REASON_LABELS[selected as RefundProposalReason] : <Typography sx={{ fontSize: 14, color: '#9CA3AF' }}>Chọn lý do hoàn tiền</Typography>,
              }}
              disabled={submitting}
              sx={FIELD_SX}
            >
              {REASON_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <Typography sx={FIELD_LABEL_SX}>
              Ghi chú chi tiết
              {reason === RefundProposalReason.OTHER ? (
                <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                  {' '}
                  *
                </Typography>
              ) : null}
            </Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="Vui lòng nhập..."
              value={detailNote}
              onChange={(e) => setDetailNote(e.target.value.slice(0, 500))}
              disabled={submitting}
              error={detailNoteRequired}
              sx={FIELD_SX}
            />
          </Box>

          {isCod ? (
            <>
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828', mt: 0.5 }}>Thông tin tài khoản nhận tiền</Typography>
              </Box>
              <Box>
                <Typography sx={FIELD_LABEL_SX}>
                  Tên chủ tài khoản{' '}
                  <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    *
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="VD: NGUYEN VAN A"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value.replace(/[^A-Za-zÀ-ỹ\s]/g, '').toUpperCase())}
                  disabled={submitting}
                  sx={FIELD_SX}
                />
              </Box>
              <Box>
                <Typography sx={FIELD_LABEL_SX}>
                  Số tài khoản{' '}
                  <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    *
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="VD: 0123456789"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 25))}
                  disabled={submitting}
                  sx={FIELD_SX}
                />
              </Box>
              <Box>
                <Typography sx={FIELD_LABEL_SX}>
                  Tên ngân hàng{' '}
                  <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    *
                  </Typography>
                </Typography>
                <TextField fullWidth placeholder="VD: Vietcombank" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={submitting} sx={FIELD_SX} />
              </Box>
              <Box>
                <Typography sx={FIELD_LABEL_SX}>Chi nhánh ngân hàng</Typography>
                <TextField fullWidth placeholder="VD: Chi nhánh Chợ Lớn" value={bankBranch} onChange={(e) => setBankBranch(e.target.value.slice(0, 100))} disabled={submitting} sx={FIELD_SX} />
              </Box>
            </>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: '1px solid #E5E7EB',
          justifyContent: 'flex-end',
        }}
      >
        <CustomButton
          fullWidth={false}
          variant="outline"
          onClick={handleRequestClose}
          disabled={submitting}
          sx={{
            height: 40,
            px: 2,
            minWidth: 92,
            borderColor: '#D0D5DD',
            color: '#101828',
            bgcolor: '#FFFFFF',
            borderRadius: '10px',
          }}
        >
          Hủy
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={handleSubmit}
          disabled={confirmDisabled}
          {...orderRefundsButtonPermission('create', 'Gửi yêu cầu hoàn tiền', 'api_refund_proposal_create')}
          sx={{
            height: 40,
            px: 2,
            minWidth: 132,
            bgcolor: '#111827',
            color: '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0B1220', boxShadow: 'none' },
            '&:disabled': { bgcolor: '#9CA3AF', color: '#FFFFFF' },
            borderRadius: '10px',
          }}
        >
          {submitting ? (
            <Stack direction="row" alignItems="center" gap={1} component="span">
              <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              Đang xử lý…
            </Stack>
          ) : (
            'Gửi yêu cầu'
          )}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
