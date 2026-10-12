import { CloseRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, Stack } from '@mui/material';
import { useState } from 'react';
import { RefreshCcw01 } from '@untitledui/icons';
import { PromotionDraftSchemaType } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../components/button';
import { SelectInput } from '../../../components/form';
import { PROMOTION_CAMPAIGN_LIFECYCLE_FILTER_OPTIONS, PROMOTION_SCHEMA_TYPE_SHORT_LABEL, type PromotionCampaignLifecycleFilter } from '../promotion.constant';

export interface PromotionListAdvancedFilters {
  status: PromotionCampaignLifecycleFilter;
  schemaType: PromotionDraftSchemaType | '';
}

export const emptyPromotionListAdvancedFilters: PromotionListAdvancedFilters = {
  status: '',
  schemaType: '',
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...PROMOTION_CAMPAIGN_LIFECYCLE_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

const SCHEMA_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả loại khuyến mãi' },
  ...Object.values(PromotionDraftSchemaType).map((schemaType) => ({
    value: schemaType,
    label: PROMOTION_SCHEMA_TYPE_SHORT_LABEL[schemaType],
  })),
];

export type PromotionListAdvancedFilterDialogProps = {
  open: boolean;
  onClose: () => void;
  value?: PromotionListAdvancedFilters;
  onApply?: (filters: PromotionListAdvancedFilters) => void;
  onReset?: () => void;
};

export const PromotionListAdvancedFilterDialog = ({ open, onClose, value = emptyPromotionListAdvancedFilters, onApply, onReset }: PromotionListAdvancedFilterDialogProps) => {
  const [draft, setDraft] = useState<PromotionListAdvancedFilters>(value);

  const setField = <K extends keyof PromotionListAdvancedFilters>(key: K, nextValue: PromotionListAdvancedFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
  };

  const handleReset = () => {
    setDraft(emptyPromotionListAdvancedFilters);
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
        <PermissionIconButton onClick={onClose} sx={{ color: '#667085' }} aria-label="Đóng bộ lọc">
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
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={draft.status}
            onChange={(event) => setField('status', event.target.value as PromotionCampaignLifecycleFilter)}
            options={STATUS_FILTER_OPTIONS}
          />
          <SelectInput
            label="Loại khuyến mãi"
            placeholder="Chọn loại khuyến mãi"
            value={draft.schemaType}
            onChange={(event) => setField('schemaType', event.target.value as PromotionDraftSchemaType | '')}
            options={SCHEMA_TYPE_FILTER_OPTIONS}
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
