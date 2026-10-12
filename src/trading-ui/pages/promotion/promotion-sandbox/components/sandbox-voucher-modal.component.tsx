import { type ChangeEvent, useCallback, useEffect } from 'react';
import { Box, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import { Ticket01 } from '@untitledui/icons';
import type { PromotionSimulationVoucherItemDto } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';
import { TextInput } from '../../../../components/form';
import { StackAlignJustCenter, StackRowAlignCenter } from '../../../../components/styled';
import { useSandboxSimulation } from '../../components/promotion-runtime-evaluate-panel/sandbox-simulation.context';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { SANDBOX_INNER_CARD_SX } from '../sandbox-panel.shared';

const MAX_SELECTABLE_VOUCHERS = 3;
const VOUCHER_IMAGE_SX = { width: 56, height: 56, borderRadius: '8px', flexShrink: 0, objectFit: 'cover' } as const;
const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const normalizeVoucherCode = (code: string): string => code.trim();

const isSelectableVoucher = (voucher: PromotionSimulationVoucherItemDto): boolean => Boolean(normalizeVoucherCode(voucher.code)) && !voucher.disabled;

const VoucherModalItem = ({ voucher, selected, onToggle }: { voucher: PromotionSimulationVoucherItemDto; selected: boolean; onToggle: (voucher: PromotionSimulationVoucherItemDto) => void }) => {
  const disabled = voucher.disabled || !normalizeVoucherCode(voucher.code);
  const reason = voucher.disabledMessage ? voucher.disabledMessage : '';

  return (
    <Box
      sx={{
        ...SANDBOX_INNER_CARD_SX,
        opacity: disabled ? 0.55 : 1,
        borderColor: selected ? '#12B76A' : '#E5E7EB',
        bgcolor: selected ? '#F6FEF9' : '#FFFFFF',
      }}
    >
      <StackRowAlignCenter sx={{ gap: 1.25, alignItems: 'flex-start' }}>
        <Checkbox
          size="small"
          checked={selected}
          disabled={disabled}
          sx={{ p: 0.25, mt: 0.25 }}
          onChange={() => {
            if (!disabled) onToggle(voucher);
          }}
        />
        <Box component="img" src={voucher?.image || productDefaultImageSrc} alt={voucher?.title} sx={VOUCHER_IMAGE_SX} />
        <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: disabled ? '#98A2B3' : '#101828' }}>{voucher.title.trim() || voucher.codeMask?.trim() || voucher.code}</Typography>
          {voucher.subtitle.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{voucher.subtitle.trim()}</Typography> : null}
          {voucher.conditionSummary.trim() ? (
            <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#175CD3', textDecoration: 'underline', width: 'fit-content' }}>
              Điều kiện
            </Typography>
          ) : null}
          {reason && disabled ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>{reason}</Typography> : null}
        </Stack>
      </StackRowAlignCenter>
    </Box>
  );
};

type SandboxVoucherModalProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export const SandboxVoucherModal = ({ open, onClose }: SandboxVoucherModalProps) => {
  const { selectedVoucherCodes, voucherDiscovery, voucherDiscoveryLoading, handleLoadSimulationVouchers, handleToggleVoucherCode, voucher, setVoucherInput, handleApplyVoucher } =
    useSandboxSimulation();

  useEffect(() => {
    if (!open) return;
    void handleLoadSimulationVouchers({ silent: true });
  }, [handleLoadSimulationVouchers, open]);

  const sections = voucherDiscovery?.sections ?? [];

  const handleToggleWithLimit = useCallback(
    (item: PromotionSimulationVoucherItemDto) => {
      if (!isSelectableVoucher(item)) return;
      const code = normalizeVoucherCode(item.code);
      if (selectedVoucherCodes.includes(code)) {
        handleToggleVoucherCode(item);
        return;
      }
      if (selectedVoucherCodes.length >= MAX_SELECTABLE_VOUCHERS) return;
      handleToggleVoucherCode(item);
    },
    [handleToggleVoucherCode, selectedVoucherCodes],
  );

  const handleApplyCode = useCallback(() => {
    void handleApplyVoucher();
  }, [handleApplyVoucher]);

  if (!open) return null;

  return (
    <DialogComponent open onClose={onClose} title="MÃ VOUCHER / THẺ QUÀ TẶNG" maxWidth="sm" fullWidth>
      <Stack sx={{ gap: 2, maxHeight: 'min(72vh, 640px)' }}>
        <StackRowAlignCenter sx={{ gap: 1 }}>
          <TextInput placeholder="Nhập mã voucher" value={voucher.input} onChange={(event: ChangeEvent<HTMLInputElement>) => setVoucherInput(event.target.value)} size="small" fullWidth />
          <CustomButton
            fullWidth={false}
            variant="outline"
            disabled={voucher.status === 'validating' || !voucher.input.trim()}
            onClick={handleApplyCode}
            sx={{ flexShrink: 0, textTransform: 'none', borderColor: '#D0D5DD', color: '#101828', whiteSpace: 'nowrap' }}
          >
            {voucher.status === 'validating' ? 'Đang kiểm tra...' : 'Áp dụng'}
          </CustomButton>
        </StackRowAlignCenter>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Được áp dụng tối đa {MAX_SELECTABLE_VOUCHERS} voucher</Typography>

        <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', gap: 1.5, pr: 0.25 }}>
          {voucherDiscoveryLoading && !voucherDiscovery ? (
            <StackAlignJustCenter sx={{ py: 3 }}>
              <CircularProgress size={22} />
            </StackAlignJustCenter>
          ) : null}

          {!voucherDiscoveryLoading && sections.every((section) => section.items.length === 0) ? (
            <StackAlignJustCenter sx={{ py: 3, gap: 1 }}>
              <Ticket01 size={22} color="#98A2B3" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', textAlign: 'center' }}>Không có voucher phù hợp với cấu hình hiện tại.</Typography>
            </StackAlignJustCenter>
          ) : null}

          {sections.map((section, sectionIndex) => (
            <Stack key={`${section.groupType}-${section.groupKey}-${sectionIndex}`} sx={{ gap: 0.75 }}>
              <Stack sx={{ gap: 0.25 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#101828', textTransform: 'uppercase' }}>{section.title.trim() || `Nhóm voucher ${sectionIndex + 1}`}</Typography>
                {section.subtitle?.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{section.subtitle.trim()}</Typography> : null}
              </Stack>
              {section.items.map((item) => {
                const code = normalizeVoucherCode(item.code);
                return <VoucherModalItem key={`${item.sourceType}-${item.voucherCodeId}-${code}`} voucher={item} selected={selectedVoucherCodes.includes(code)} onToggle={handleToggleWithLimit} />;
              })}
            </Stack>
          ))}
        </Stack>

        <CustomButton fullWidth variant="primary" onClick={onClose} sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', '&:hover': { bgcolor: '#101828', opacity: 0.92 } }}>
          Hoàn Thành
        </CustomButton>
      </Stack>
    </DialogComponent>
  );
};
