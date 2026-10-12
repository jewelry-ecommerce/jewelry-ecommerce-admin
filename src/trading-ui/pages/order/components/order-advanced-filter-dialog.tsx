import { CloseRounded, KeyboardArrowDownRounded, RestartAltRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CustomButton, PermissionIconButton } from '../../../components/button';

import { useEffect, useState } from 'react';
import { getProvinceList, type IProvince } from '../../../apis/address';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ORDER_INITIAL_ADVANCED_FILTERS, ORDER_PAYMENT_STATUS_FILTER_OPTIONS, ORDER_SOURCE_FILTER_OPTIONS } from '../../../common/constant/order/order.constants';
import { WarehouseSelector } from '../../warehouse/components/warehouse-selector.component';
import { type OrderAdvancedFilters } from '../order.types';

interface OrderAdvancedFilterDialogProps {
  open: boolean;
  /** Bộ lọc đang áp dụng — dùng làm giá trị khởi tạo mỗi lần mở dialog. */
  value: OrderAdvancedFilters;
  onClose: () => void;
  onApply: (filters: OrderAdvancedFilters) => void;
}

const fieldLabelSx = {
  mb: 0.75,
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 44,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  '& .MuiOutlinedInput-input': {
    fontSize: 14,
  },
};

const renderSelectValue = (selected: unknown, options: ReadonlyArray<{ value: string; label: string }>, placeholder: string) => {
  const selectedValue = typeof selected === 'string' ? selected : '';
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayValue = selectedOption?.label ?? selectedValue;

  return (
    <Box component="span" sx={{ color: displayValue ? '#111827' : '#667085' }}>
      {displayValue || placeholder}
    </Box>
  );
};

const sortProvinces = (provinces: IProvince[]) =>
  [...provinces].sort((leftProvince, rightProvince) => {
    if (rightProvince.priority !== leftProvince.priority) {
      return rightProvince.priority - leftProvince.priority;
    }

    return leftProvince.name.localeCompare(rightProvince.name, 'vi');
  });

export const OrderAdvancedFilterDialog = ({ open, value, onClose, onApply }: OrderAdvancedFilterDialogProps) => {
  if (!open) {
    return null;
  }

  return <OrderAdvancedFilterDialogContent value={value} onClose={onClose} onApply={onApply} />;
};

interface OrderAdvancedFilterDialogContentProps {
  value: OrderAdvancedFilters;
  onClose: () => void;
  onApply: (filters: OrderAdvancedFilters) => void;
}

const OrderAdvancedFilterDialogContent = ({ value, onClose, onApply }: OrderAdvancedFilterDialogContentProps) => {
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState<OrderAdvancedFilters>(value);
  const [provinceOptions, setProvinceOptions] = useState<IProvince[]>([]);
  const [isProvinceLoading, setIsProvinceLoading] = useState(false);

  const updateField = <TKey extends keyof OrderAdvancedFilters>(field: TKey, nextValue: OrderAdvancedFilters[TKey]) => {
    setDraft((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  useEffect(() => {
    if (provinceOptions.length > 0) {
      return;
    }

    let isMounted = true;

    const fetchProvinceOptions = async () => {
      setIsProvinceLoading(true);

      try {
        const response = await getProvinceList();

        if (!isMounted) {
          return;
        }

        setProvinceOptions(sortProvinces(response.list));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể tải danh sách tỉnh/thành phố',
        });
      } finally {
        if (isMounted) {
          setIsProvinceLoading(false);
        }
      }
    };

    void fetchProvinceOptions();

    return () => {
      isMounted = false;
    };
  }, [provinceOptions.length, showSnackbar]);

  const provinceSelectOptions = provinceOptions.map((province) => ({
    value: province.name,
    label: province.name,
  }));

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
            <Typography sx={fieldLabelSx}>Nguồn đơn hàng</Typography>
            <TextField
              select
              fullWidth
              value={draft.source}
              onChange={(event) => updateField('source', event.target.value as OrderAdvancedFilters['source'])}
              sx={fieldSx}
              SelectProps={{
                displayEmpty: true,
                IconComponent: KeyboardArrowDownRounded,
                renderValue: (selected) => renderSelectValue(selected, ORDER_SOURCE_FILTER_OPTIONS, 'Chọn nguồn đơn hàng'),
              }}
            >
              <MenuItem value="">Tất cả nguồn đơn hàng</MenuItem>
              {ORDER_SOURCE_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Trạng thái thanh toán</Typography>
            <TextField
              select
              fullWidth
              value={draft.paymentStatus}
              onChange={(event) => updateField('paymentStatus', event.target.value as OrderAdvancedFilters['paymentStatus'])}
              sx={fieldSx}
              SelectProps={{
                displayEmpty: true,
                IconComponent: KeyboardArrowDownRounded,
                renderValue: (selected) => renderSelectValue(selected, ORDER_PAYMENT_STATUS_FILTER_OPTIONS, 'Chọn trạng thái thanh toán'),
              }}
            >
              <MenuItem value="">Tất cả trạng thái thanh toán</MenuItem>
              {ORDER_PAYMENT_STATUS_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <WarehouseSelector value={draft.warehouseId} onChange={(warehouseId) => updateField('warehouseId', warehouseId)} label="Cửa hàng" placeholder="Tìm cửa hàng" />
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Tỉnh/Thành phố</Typography>
            <TextField
              select
              fullWidth
              value={draft.provinceName}
              onChange={(event) => updateField('provinceName', event.target.value)}
              sx={fieldSx}
              disabled={isProvinceLoading && provinceOptions.length === 0}
              SelectProps={{
                displayEmpty: true,
                IconComponent: KeyboardArrowDownRounded,
                renderValue: (selected) => {
                  if (isProvinceLoading && provinceOptions.length === 0) {
                    return (
                      <Box component="span" sx={{ color: '#98A2B3' }}>
                        Đang tải tỉnh/thành phố
                      </Box>
                    );
                  }

                  return renderSelectValue(selected, provinceSelectOptions, 'Chọn tỉnh/thành phố');
                },
              }}
            >
              <MenuItem value="">Tất cả tỉnh/thành phố</MenuItem>
              {provinceOptions.map((province) => (
                <MenuItem key={province.id} value={province.name}>
                  {province.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <Typography sx={fieldLabelSx}>Mã SKU</Typography>
            <TextField fullWidth value={draft.skuCode} onChange={(event) => updateField('skuCode', event.target.value)} placeholder="Nhập SKU..." sx={fieldSx} />
          </Box>
          <Box>
            <Typography sx={fieldLabelSx}>Thời gian</Typography>
            <TextField
              select
              fullWidth
              value={draft.dateField || 'createdAt'}
              onChange={(event) => updateField('dateField', event.target.value as 'createdAt' | 'deliveredAt')}
              sx={fieldSx}
              SelectProps={{
                displayEmpty: true,
                IconComponent: KeyboardArrowDownRounded,
              }}
            >
              <MenuItem value="createdAt">Ngày tạo đơn</MenuItem>
              <MenuItem value="deliveredAt">Ngày giao hàng</MenuItem>
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
          onClick={() => setDraft({ ...ORDER_INITIAL_ADVANCED_FILTERS })}
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
