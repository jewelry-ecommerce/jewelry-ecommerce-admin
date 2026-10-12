import { CloseRounded, KeyboardArrowDownRounded, RestartAltRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { type OrderReturnReason, type OrderReturnStatus, type OrderReturnType } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { fieldLabelSx, fieldSx, REASON_OPTIONS, RETURN_EXCHANGE_INITIAL_ADVANCED_FILTERS, STATUS_OPTIONS, TYPE_OPTIONS } from '../../../../common/constant/order/order.constants';

export type ReturnExchangeAdvancedFilterStatus =
  | ''
  | OrderReturnStatus.PENDING
  | OrderReturnStatus.AWAITING_PICKUP
  | OrderReturnStatus.COLLECTION_FAILED
  | OrderReturnStatus.COLLECTED
  | OrderReturnStatus.INSPECTION
  | OrderReturnStatus.REJECTED
  | OrderReturnStatus.STORED
  | OrderReturnStatus.AWAITING_EXCHANGE
  | OrderReturnStatus.EXCHANGE_RELEASED;

export interface ReturnExchangeAdvancedFilters {
  orderCode: string;
  orderId: string;
  type: OrderReturnType | '';
  reason: OrderReturnReason | '';
  status: ReturnExchangeAdvancedFilterStatus;
}

interface ReturnExchangeAdvancedFilterDialogProps {
  open: boolean;
  value: ReturnExchangeAdvancedFilters;
  onClose: () => void;
  onApply: (filters: ReturnExchangeAdvancedFilters) => void;
}

export const ReturnExchangeAdvancedFilterDialogPart = ({ open, value, onClose, onApply }: ReturnExchangeAdvancedFilterDialogProps) => {
  const [draft, setDraft] = useState<ReturnExchangeAdvancedFilters>(value);

  const updateDraft = <T extends keyof ReturnExchangeAdvancedFilters>(key: T, next: ReturnExchangeAdvancedFilters[T]) => {
    setDraft((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{
        onEnter: () => setDraft(value),
      }}
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
            <Typography sx={fieldLabelSx}>Mã đơn gốc</Typography>
            <TextField fullWidth value={draft.orderCode} onChange={(event) => updateDraft('orderCode', event.target.value)} placeholder="Nhập order codes..." sx={fieldSx} />
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Trạng thái yêu cầu</Typography>
            <TextField
              select
              fullWidth
              value={draft.status}
              onChange={(event) => updateDraft('status', event.target.value as ReturnExchangeAdvancedFilterStatus)}
              sx={fieldSx}
              SelectProps={{ IconComponent: KeyboardArrowDownRounded }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Loại yêu cầu</Typography>
            <TextField
              select
              fullWidth
              value={draft.type}
              onChange={(event) => updateDraft('type', event.target.value as OrderReturnType | '')}
              sx={fieldSx}
              SelectProps={{ IconComponent: KeyboardArrowDownRounded }}
            >
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Lý do</Typography>
            <TextField
              select
              fullWidth
              value={draft.reason}
              onChange={(event) => updateDraft('reason', event.target.value as OrderReturnReason | '')}
              sx={fieldSx}
              SelectProps={{ IconComponent: KeyboardArrowDownRounded }}
            >
              {REASON_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
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
          onClick={() => setDraft({ ...RETURN_EXCHANGE_INITIAL_ADVANCED_FILTERS })}
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
              '&:hover': {
                backgroundColor: '#0B1220',
                boxShadow: 'none',
              },
            }}
          >
            Áp dụng bộ lọc
          </CustomButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
