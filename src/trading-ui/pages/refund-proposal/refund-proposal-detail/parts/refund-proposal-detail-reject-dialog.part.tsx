import CloseRounded from '@mui/icons-material/CloseRounded';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

interface Props {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 14, '& fieldset': { borderColor: '#D0D5DD' } },
} as const;

export function RefundProposalRejectDialog({ open, submitting, onClose, onConfirm }: Props) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) setNote('');
  }, [open]);

  const confirmDisabled = !note.trim() || submitting;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#101828' }}>
          Từ chối yêu cầu hoàn tiền
        </Typography>
        <PermissionIconButton size="small" onClick={onClose} disabled={submitting} sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 20 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack gap={0.5}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>
            Lý do từ chối{' '}
            <Typography component="span" sx={{ color: '#DC2626' }}>
              *
            </Typography>
          </Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Nhập lý do từ chối yêu cầu hoàn tiền..."
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            disabled={submitting}
            sx={fieldSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
        <CustomButton fullWidth={false} variant="outline" onClick={onClose} disabled={submitting} sx={{ height: 40, px: 2, borderColor: '#D0D5DD', borderRadius: '10px', color: '#101828' }}>
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={() => onConfirm(note)}
          disabled={confirmDisabled}
          sx={{
            height: 40,
            px: 2,
            minWidth: 150,
            borderRadius: '10px',
            bgcolor: '#DC2626',
            color: '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
            '&:disabled': { bgcolor: '#FECACA', color: '#9CA3AF' },
          }}
        >
          {submitting ? (
            <Stack direction="row" spacing={1} alignItems="center" component="span">
              <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              Đang xử lý…
            </Stack>
          ) : (
            'Xác nhận từ chối'
          )}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
