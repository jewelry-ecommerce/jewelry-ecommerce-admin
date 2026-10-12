import { CloseRounded, KeyboardArrowDownRounded, RestartAltRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { RefundProposalPaymentChannel, RefundProposalSourceType } from '../../../../apis/refund-proposal';
import { fieldLabelSx, fieldSx } from '../../../../common/constant/order/order.constants';
import { REFUND_PROPOSAL_PAYMENT_LABELS, REFUND_PROPOSAL_SOURCE_LABELS } from '../../../../common/constant/refund-proposal/refund-proposal.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { REFUND_PROPOSAL_INITIAL_ADVANCED_FILTERS, type RefundProposalAdvancedFilters } from '../../../../hooks/refund-proposal/use-refund-proposal-list.hook';

const PAYMENT_OPTIONS: Array<{ value: RefundProposalPaymentChannel | ''; label: string }> = [
  { value: '', label: 'Tất cả phương thức' },
  ...Object.values(RefundProposalPaymentChannel).map((value) => ({
    value,
    label: REFUND_PROPOSAL_PAYMENT_LABELS[value],
  })),
];

const SOURCE_OPTIONS: Array<{ value: RefundProposalSourceType | ''; label: string }> = [
  { value: '', label: 'Tất cả nguồn' },
  ...Object.values(RefundProposalSourceType).map((value) => ({
    value,
    label: REFUND_PROPOSAL_SOURCE_LABELS[value],
  })),
];

interface RefundProposalAdvancedFilterDialogProps {
  open: boolean;
  value: RefundProposalAdvancedFilters;
  onClose: () => void;
  onApply: (filters: RefundProposalAdvancedFilters) => void;
}

export const RefundProposalAdvancedFilterDialogPart = ({ open, value, onClose, onApply }: RefundProposalAdvancedFilterDialogProps) => {
  const [draft, setDraft] = useState<RefundProposalAdvancedFilters>(value);

  const updateDraft = <T extends keyof RefundProposalAdvancedFilters>(key: T, next: RefundProposalAdvancedFilters[T]) => {
    setDraft((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{ onEnter: () => setDraft(value) }}
      PaperProps={{
        sx: {
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)',
          bgcolor: 'white',
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: '16px 24px' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold }}>Bộ lọc nâng cao</Typography>
        <PermissionIconButton onClick={onClose} sx={{ color: '#667085' }}>
          <CloseRounded />
        </PermissionIconButton>
      </Stack>

      <DialogContent sx={{ px: 3, py: 3, borderTop: '1px solid #EAECF0', borderBottom: '1px solid #EAECF0' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2,
            rowGap: 2,
          }}
        >
          <Box>
            <Typography sx={fieldLabelSx}>Phương thức hoàn</Typography>
            <TextField
              select
              fullWidth
              value={draft.paymentChannel}
              onChange={(event) => updateDraft('paymentChannel', event.target.value as RefundProposalPaymentChannel | '')}
              sx={fieldSx}
              SelectProps={{ IconComponent: KeyboardArrowDownRounded }}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Nguồn đề xuất</Typography>
            <TextField
              select
              fullWidth
              value={draft.sourceType}
              onChange={(event) => updateDraft('sourceType', event.target.value as RefundProposalSourceType | '')}
              sx={fieldSx}
              SelectProps={{ IconComponent: KeyboardArrowDownRounded }}
            >
              {SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <Typography sx={fieldLabelSx}>Thương hiệu (Brand)</Typography>
            <TextField fullWidth value={draft.brand} onChange={(event) => updateDraft('brand', event.target.value)} placeholder="VD: SevaJewelry, SevaGold..." sx={fieldSx} />
          </Box> */}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: '16px 24px',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
          bgcolor: '#F9FAFB',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <CustomButton
          fullWidth={false}
          variant="outline"
          startIcon={<RestartAltRounded sx={{ fontSize: 18 }} />}
          onClick={() => setDraft({ ...REFUND_PROPOSAL_INITIAL_ADVANCED_FILTERS })}
          sx={{
            height: 40,
            borderRadius: 2,
            borderColor: '#D0D5DD',
            color: '#111827',
            textTransform: 'none',
            width: 'fit-content',
            ...TYPOGRAPHY_STYLES.md.regular,
            fontWeight: 500,
          }}
        >
          Đặt lại
        </CustomButton>

        <Stack direction="row" spacing={1.5}>
          <CustomButton
            fullWidth={false}
            variant="outline"
            onClick={onClose}
            sx={{
              minWidth: 92,
              height: 40,
              borderRadius: 2,
              borderColor: '#D0D5DD',
              textTransform: 'none',
              ...TYPOGRAPHY_STYLES.md.regular,
              fontWeight: 500,
              color: '#101828',
            }}
          >
            Hủy
          </CustomButton>

          <CustomButton
            fullWidth={false}
            variant="primary"
            onClick={() => onApply(draft)}
            sx={{
              minWidth: 152,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#111827',
              boxShadow: 'none',
              ...TYPOGRAPHY_STYLES.md.regular,
              '&:hover': { backgroundColor: '#0B1220', boxShadow: 'none' },
            }}
          >
            Áp dụng bộ lọc
          </CustomButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
