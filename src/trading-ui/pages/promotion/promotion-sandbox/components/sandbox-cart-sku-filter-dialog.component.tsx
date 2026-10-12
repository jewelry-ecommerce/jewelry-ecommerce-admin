import { CloseRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, Stack } from '@mui/material';
import { useState } from 'react';
import { RefreshCcw01 } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';
import { SelectInput } from '../../../../components/form';

export interface SandboxCartSkuFilters {
  categoryUuid: string;
  collectionUuid: string;
}

export const emptySandboxCartSkuFilters: SandboxCartSkuFilters = {
  categoryUuid: '',
  collectionUuid: '',
};

export const countActiveSandboxCartSkuFilters = (filters: SandboxCartSkuFilters): number => Number(Boolean(filters.categoryUuid)) + Number(Boolean(filters.collectionUuid));

export type SandboxCartSkuFilterDialogProps = {
  open: boolean;
  onClose: () => void;
  value?: SandboxCartSkuFilters;
  categoryOptions: { value: string; label: string }[];
  collectionOptions: { value: string; label: string }[];
  onApply?: (filters: SandboxCartSkuFilters) => void;
  onReset?: () => void;
};

export const SandboxCartSkuFilterDialog = ({ open, onClose, value = emptySandboxCartSkuFilters, categoryOptions, collectionOptions, onApply, onReset }: SandboxCartSkuFilterDialogProps) => {
  const [draft, setDraft] = useState<SandboxCartSkuFilters>(value);

  const setField = <K extends keyof SandboxCartSkuFilters>(key: K, nextValue: SandboxCartSkuFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
  };

  const handleReset = () => {
    setDraft(emptySandboxCartSkuFilters);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.(draft);
    onClose();
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
        <Box component="span" sx={{ ...TYPOGRAPHY_STYLES.lg.bold }}>
          Bộ lọc nâng cao
        </Box>
        <PermissionIconButton onClick={onClose} sx={{ color: '#667085' }}>
          <CloseRounded />
        </PermissionIconButton>
      </Stack>

      <DialogContent sx={{ px: 3, py: 3, borderTop: '1px solid #EAECF0', borderBottom: '1px solid #EAECF0' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: '16px',
          }}
        >
          <SelectInput
            label="Danh mục"
            placeholder="Chọn danh mục"
            value={draft.categoryUuid}
            onChange={(event) => setField('categoryUuid', event.target.value)}
            options={[{ value: '', label: 'Tất cả danh mục' }, ...categoryOptions]}
          />
          <SelectInput
            label="Bộ sưu tập"
            placeholder="Chọn bộ sưu tập"
            value={draft.collectionUuid}
            onChange={(event) => setField('collectionUuid', event.target.value)}
            options={[{ value: '', label: 'Tất cả bộ sưu tập' }, ...collectionOptions]}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, justifyContent: 'space-between' }}>
        <CustomButton
          fullWidth={false}
          variant="outline"
          startIcon={<RefreshCcw01 size={20} color="#101828" />}
          onClick={handleReset}
          sx={{ textTransform: 'none', borderColor: '#D0D5DD', color: '#101828' }}
        >
          Đặt lại
        </CustomButton>

        <Stack direction="row" spacing={1.5}>
          <CustomButton fullWidth={false} variant="outline" onClick={onClose} sx={{ textTransform: 'none', borderColor: '#D0D5DD', color: '#101828' }}>
            Hủy
          </CustomButton>
          <CustomButton fullWidth={false} variant="primary" onClick={handleApply} sx={{ textTransform: 'none', bgcolor: '#111827', boxShadow: 'none' }}>
            Áp dụng bộ lọc
          </CustomButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
