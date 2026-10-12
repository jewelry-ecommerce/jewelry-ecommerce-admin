import { CircularProgress, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { SyncOutlined } from '@mui/icons-material';
import type { ReactNode } from 'react';
// import { formatCurrency } from '../../common/utils/number.utils';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { CustomButton } from '../button';
import { TextInput } from '../form';

export interface ShippingCarrierServiceOption {
  value: string;
  label: string;
  fee?: number;
  feeLabel?: string;
  estimatedDateLabel?: string;
}

export interface ShippingCarrierServiceSelectorProps {
  carrierLabel: string;
  carrierDisplayName: string;
  carrierIcon?: ReactNode;
  selectedServiceValue: string;
  serviceOptions: ShippingCarrierServiceOption[];
  onChangeService: (value: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  errorMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  fetchFailed?: boolean;
  fetchFailedMessage?: string;
  onRetryFetch?: () => void;
  retryButtonLabel?: string;
  retryApiCode?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  noteValue?: string;
  onChangeNote?: (value: string) => void;
}

export const ShippingCarrierServiceSelector = ({
  carrierLabel,
  carrierDisplayName,
  carrierIcon,
  selectedServiceValue,
  serviceOptions,
  onChangeService,
  disabled = false,
  disabledMessage,
  errorMessage,
  isLoading = false,
  loadingMessage = 'Đang tải dịch vụ vận chuyển...',
  fetchFailed = false,
  fetchFailedMessage = 'Không thể tải dịch vụ giao hàng. Vui lòng thử lại.',
  onRetryFetch,
  retryButtonLabel = 'Đồng bộ',
  retryApiCode,
  noteLabel = 'Ghi chú cho shipper',
  notePlaceholder = 'Ghi chú',
  noteValue,
  onChangeNote,
}: ShippingCarrierServiceSelectorProps) => {
  const showNoteInput = typeof noteValue === 'string' && typeof onChangeNote === 'function';

  return (
    <Stack gap={1.5}>
      <Stack gap={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{carrierLabel}</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          {carrierIcon}
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{carrierDisplayName}</Typography>
        </Stack>
      </Stack>

      {isLoading ? (
        <Stack direction="row" alignItems="center" gap={1}>
          <CircularProgress size={16} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>{loadingMessage}</Typography>
        </Stack>
      ) : null}

      {fetchFailed && !isLoading && !disabled && onRetryFetch ? (
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography sx={{ color: '#DC2626', ...TYPOGRAPHY_STYLES.sm.medium }}>{fetchFailedMessage}</Typography>
          <CustomButton
            variant="outline"
            size="small"
            startIcon={<SyncOutlined sx={{ fontSize: 16 }} />}
            onClick={onRetryFetch}
            disabled={isLoading}
            apiCode={retryApiCode}
            sx={{ textTransform: 'none', ...TYPOGRAPHY_STYLES.sm.medium, minWidth: 0, px: 1.5, py: 0.5 }}
          >
            {retryButtonLabel}
          </CustomButton>
        </Stack>
      ) : null}

      <RadioGroup value={selectedServiceValue} onChange={(event) => onChangeService(event.target.value)}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={4}>
          {serviceOptions.map((option) => {
            // const resolvedFeeLabel =
            //   option.feeLabel ?? (typeof option.fee === 'number' ? `${formatCurrency(option.fee)}đ` : '');

            return (
              <FormControlLabel
                key={option.value}
                value={option.value}
                disabled={disabled || isLoading}
                control={<Radio size="small" />}
                label={
                  <Stack spacing={0.15} gap={0}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#F59E0B' }}>{option.label}</Typography>
                    {/* {resolvedFeeLabel ? (
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#2563EB' }}>
                        {resolvedFeeLabel}
                      </Typography>
                    ) : null} */}
                    {option.estimatedDateLabel ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Ngày giao dự kiến {option.estimatedDateLabel}</Typography> : null}
                  </Stack>
                }
                sx={{ alignItems: 'flex-start', m: 0 }}
              />
            );
          })}
        </Stack>
      </RadioGroup>

      {disabled && disabledMessage ? <Typography sx={{ color: '#6B7280', ...TYPOGRAPHY_STYLES.sm.medium }}>{disabledMessage}</Typography> : null}
      {!disabled && errorMessage ? <Typography sx={{ color: '#DC2626', ...TYPOGRAPHY_STYLES.sm.medium }}>{errorMessage}</Typography> : null}

      {showNoteInput ? <TextInput fullWidth multiline minRows={2} label={noteLabel} placeholder={notePlaceholder} value={noteValue} onChange={(event) => onChangeNote(event.target.value)} /> : null}
    </Stack>
  );
};
