import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, Checkbox, Stack, Typography } from '@mui/material';
import * as React from 'react';
import { type ChangeEvent, memo, useCallback, useState } from 'react';
import type { PromotionVoucherCardDto, PromotionVoucherCheckoutContext } from '../../../../apis/promotion/promotion.interface';
import { validateAdminOrderPromotionVoucherCode, type IAdminOrderV2Context } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';
import { TextInput } from '../../../../components/form';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { validatePromotionVoucherCode } from '../../../../apis/promotion/promotion.api';
import { useAdminOrderVoucherDiscover } from '../../../../hooks/order/use-admin-order-voucher-discover.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS, isVoucherSelected, type SelectedAdminOrderVoucher } from '../voucher/admin-order-voucher.mapper';

const VOUCHER_IMAGE_SX = { width: 56, height: 56, borderRadius: '8px', flexShrink: 0, objectFit: 'cover' } as const;

export interface AdminOrderVoucherSectionProps {
  selectedVouchers: SelectedAdminOrderVoucher[];
  checkoutContext: PromotionVoucherCheckoutContext | null;
  adminOrderContext?: IAdminOrderV2Context | null;
  disabled?: boolean;
  onToggleVoucher: (card: PromotionVoucherCardDto) => void;
  onApplyValidatedVoucher: (card: PromotionVoucherCardDto) => void;
  onDialogClose?: () => void;
}

const VoucherListItem = ({ card, selected, onToggle }: { card: PromotionVoucherCardDto; selected: boolean; onToggle: (card: PromotionVoucherCardDto) => void }) => {
  const disabled = card.disabled || !card.code.trim();
  const reason = card.disabledMessage?.trim() || '';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: selected ? '#12B76A' : '#E5E7EB',
        bgcolor: selected ? '#F6FEF9' : '#FFFFFF',
        borderRadius: '10px',
        p: 1.25,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <StackRowAlignCenter sx={{ gap: 1.25, alignItems: 'flex-start' }}>
        <Checkbox
          size="small"
          checked={selected}
          disabled={disabled}
          sx={{ p: 0.25, mt: 0.25 }}
          onChange={() => {
            if (!disabled) onToggle(card);
          }}
        />
        {card.image ? <Box component="img" src={card.image} alt="" sx={VOUCHER_IMAGE_SX} /> : null}
        <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: disabled ? '#98A2B3' : '#101828' }}>{card.title.trim() || card.codeMask?.trim() || card.code}</Typography>
          {card.subtitle.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{card.subtitle.trim()}</Typography> : null}
          {card.benefitSummary.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{card.benefitSummary.trim()}</Typography> : null}
          {reason && disabled ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>{reason}</Typography> : null}
        </Stack>
      </StackRowAlignCenter>
    </Box>
  );
};

export const AdminOrderVoucherSection = memo(function AdminOrderVoucherSection({
  selectedVouchers,
  checkoutContext,
  adminOrderContext = null,
  disabled = false,
  onToggleVoucher,
  onApplyValidatedVoucher,
  onDialogClose,
}: AdminOrderVoucherSectionProps) {
  const { showSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const { sections, isLoading, isRefreshing, error } = useAdminOrderVoucherDiscover(isOpen, checkoutContext, adminOrderContext);

  const totalSelected = selectedVouchers.length;
  const showInitialLoading = isLoading && sections.length === 0;
  const showEmptyState = !showInitialLoading && !error && sections.length === 0;

  const handleCloseDialog = useCallback(() => {
    onDialogClose?.();
    setIsOpen(false);
  }, [onDialogClose]);

  const handleApplyCode = useCallback(async () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    if (totalSelected >= DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS) {
      showSnackbar({ type: SnackbarType.WARNING, message: `Bạn chỉ được chọn tối đa ${DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS} voucher` });
      return;
    }

    setIsValidating(true);
    try {
      const response = adminOrderContext
        ? await validateAdminOrderPromotionVoucherCode({ ...adminOrderContext, code: trimmed })
        : await validatePromotionVoucherCode({ code: trimmed, checkoutContext });
      if (response.valid && response.card) {
        onApplyValidatedVoucher(response.card);
        setManualCode('');
      } else {
        showSnackbar({ type: SnackbarType.ERROR, message: response.message || 'Mã voucher không hợp lệ' });
      }
    } catch {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Không thể kiểm tra mã voucher. Vui lòng thử lại.' });
    } finally {
      setIsValidating(false);
    }
  }, [adminOrderContext, checkoutContext, manualCode, onApplyValidatedVoucher, showSnackbar, totalSelected]);

  return (
    <React.Fragment>
      <StackRowAlignCenterJustBetween
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
        sx={{
          mb: 2,
          px: 1.5,
          py: 1.25,
          borderRadius: '10px',
          border: '1px solid #DEDEDE',
          bgcolor: disabled ? '#F5F5F5' : '#FFFFFF',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>{totalSelected > 0 ? `Đã chọn ${totalSelected} voucher` : 'Chọn mã voucher'}</Typography>
        <ChevronRightRounded sx={{ color: '#667085' }} />
      </StackRowAlignCenterJustBetween>

      {totalSelected > 0 ? (
        <Stack gap={1} sx={{ mb: 2 }}>
          {selectedVouchers.map((voucher) => (
            <Box
              key={voucher.voucherCodeId}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                px: 1.25,
                py: 1,
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                bgcolor: '#F9FAFB',
              }}
            >
              <LocalOfferOutlined sx={{ fontSize: 18, color: '#667085', mt: 0.25 }} />
              <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>{voucher.codeMask || voucher.code}</Typography>
                {voucher.benefitSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{voucher.benefitSummary}</Typography> : null}
              </Stack>
              <CloseRounded
                sx={{ fontSize: 18, color: '#667085', cursor: 'pointer', flexShrink: 0 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleVoucher({
                    voucherCodeId: voucher.voucherCodeId,
                    code: voucher.code,
                    codeMask: voucher.codeMask,
                    title: voucher.title,
                    benefitSummary: voucher.benefitSummary,
                  } as PromotionVoucherCardDto);
                }}
              />
            </Box>
          ))}
        </Stack>
      ) : null}

      <DialogComponent open={isOpen} onClose={handleCloseDialog} title="MÃ VOUCHER / THẺ QUÀ TẶNG" maxWidth="sm" fullWidth>
        <Stack sx={{ gap: 2, maxHeight: 'min(72vh, 640px)' }}>
          <StackRowAlignCenter sx={{ gap: 1 }}>
            <TextInput placeholder="Nhập mã voucher" value={manualCode} onChange={(event: ChangeEvent<HTMLInputElement>) => setManualCode(event.target.value.toUpperCase())} size="small" fullWidth />
            <CustomButton
              fullWidth={false}
              variant="outline"
              disabled={isValidating || !manualCode.trim()}
              onClick={() => void handleApplyCode()}
              sx={{ flexShrink: 0, textTransform: 'none', borderColor: '#D0D5DD', color: '#101828', whiteSpace: 'nowrap' }}
            >
              {isValidating ? 'Đang kiểm tra...' : 'Áp dụng'}
            </CustomButton>
          </StackRowAlignCenter>

          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Được áp dụng tối đa {DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS} voucher</Typography>

          <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', gap: 1.5, pr: 0.25, opacity: isRefreshing ? 0.72 : 1 }}>
            {showInitialLoading ? <LoadingComponent size="small" sx={{ py: 3 }} /> : null}

            {error && sections.length === 0 ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318', textAlign: 'center', py: 2 }}>{error}</Typography> : null}

            {showEmptyState ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', textAlign: 'center', py: 2 }}>Không có voucher khả dụng</Typography> : null}

            {sections.map((section, sectionIndex) => (
              <Stack key={`${section.groupKey}-${sectionIndex}`} sx={{ gap: 0.75 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#101828', textTransform: 'uppercase' }}>{section.title.trim() || `Nhóm voucher ${sectionIndex + 1}`}</Typography>
                {section.subtitle?.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{section.subtitle.trim()}</Typography> : null}
                {section.items.map((item) => (
                  <VoucherListItem key={`${item.voucherCodeId}-${item.code}`} card={item} selected={isVoucherSelected(selectedVouchers, item.voucherCodeId)} onToggle={onToggleVoucher} />
                ))}
              </Stack>
            ))}
          </Stack>

          <CustomButton fullWidth variant="primary" onClick={handleCloseDialog} sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none' }}>
            Hoàn thành
          </CustomButton>
        </Stack>
      </DialogComponent>
    </React.Fragment>
  );
});
