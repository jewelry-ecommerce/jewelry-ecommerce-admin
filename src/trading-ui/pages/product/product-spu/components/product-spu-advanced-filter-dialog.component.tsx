import { CloseRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, Stack } from '@mui/material';
import { useState } from 'react';
import { RefreshCcw01 } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../components/button';
import { SelectInput } from '../../../../components/form/select-input';
import { PRICE_RANGE_FILTER_OPTIONS, PRODUCT_SPU_APPROVAL_STATUS_FILTER_OPTIONS, PRODUCT_SPU_STATUS_FILTER_OPTIONS } from '../product-spu.constant';
import { type ProductSpuAdvancedFilters } from '../product-spu.interface';
import { type ProductApprovalStatus, ProductSpuStatus } from '../../../../apis/product/product.enum';

export type ProductSpuAdvancedFilterDialogProps = {
  open: boolean;
  onClose: () => void;
  value?: ProductSpuAdvancedFilters;
  categoryOptions: { value: string; label: string }[];
  onApply?: (filters: ProductSpuAdvancedFilters) => void;
  onReset?: () => void;
};

const emptyFilters: ProductSpuAdvancedFilters = {
  categoryUuid: '',
  priceRangeKey: '',
  status: ProductSpuStatus.ALL,
  approvalStatus: '',
};

export const ProductSpuAdvancedFilterDialog = ({ open, onClose, value = emptyFilters, categoryOptions, onApply, onReset }: ProductSpuAdvancedFilterDialogProps) => {
  const [draft, setDraft] = useState<ProductSpuAdvancedFilters>(value);

  const setField = <K extends keyof ProductSpuAdvancedFilters>(key: K, nextValue: ProductSpuAdvancedFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
  };

  const handleReset = () => {
    setDraft(emptyFilters);
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
            label="Trạng thái yêu cầu"
            placeholder="Chọn trạng thái yêu cầu"
            value={draft.approvalStatus}
            onChange={(event) => setField('approvalStatus', event.target.value as ProductApprovalStatus | '')}
            options={PRODUCT_SPU_APPROVAL_STATUS_FILTER_OPTIONS}
          />
          <SelectInput
            label="Trạng thái sản phẩm"
            placeholder="Chọn trạng thái sản phẩm"
            value={draft.status}
            onChange={(event) => setField('status', event.target.value as ProductSpuStatus)}
            options={PRODUCT_SPU_STATUS_FILTER_OPTIONS}
          />
          <SelectInput
            label="Danh mục"
            placeholder="Chọn danh mục"
            value={draft.categoryUuid}
            onChange={(event) => setField('categoryUuid', event.target.value)}
            options={[{ value: '', label: 'Tất cả' }, ...categoryOptions]}
          />
          <SelectInput
            label="Khoảng giá"
            placeholder="Chọn khoảng giá"
            value={draft.priceRangeKey}
            onChange={(event) => setField('priceRangeKey', event.target.value)}
            options={PRICE_RANGE_FILTER_OPTIONS}
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
