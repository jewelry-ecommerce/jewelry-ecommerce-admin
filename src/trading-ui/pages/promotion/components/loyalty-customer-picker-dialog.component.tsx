import { Box, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { listLoyaltyCustomers } from '../../../apis/loyalty/loyalty.api';
import type { LoyaltyCustomer } from '../../../apis/loyalty/loyalty.entities';
import { getTenantCodeHeader } from '../../../common/config/tenant.config';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { DialogComponent } from '../../../components/dialog';
import { SearchInput } from '../../../components/form';
import { StackRowAlignCenter } from '../../../components/styled';
import { formatLoyaltyCustomerStatusLabel } from '../../loyalty/loyalty-customer/constants/loyalty-status.constants';
import { promotionListButtonPermission } from '../promotion-permission.constants';

export type PromotionSelectedCustomer = {
  memberId: string;
  customerCode: string;
  phone: string;
  status: string;
};

export interface LoyaltyCustomerPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initialSelected: PromotionSelectedCustomer[];
  onApply: (next: PromotionSelectedCustomer[]) => void;
}

/** Chỉ lấy memberId của tenant đang chọn — không fallback sang tenant khác. */
const resolveMemberIdForCurrentTenant = (customer: LoyaltyCustomer): string | null => {
  const tenantCode = getTenantCodeHeader().trim();
  if (!tenantCode) return null;
  const profile = (customer.tenantProfiles ?? []).find((item) => item.tenantCode === tenantCode);
  const memberId = profile?.memberId?.trim();
  return memberId || null;
};

const mapCustomerToSelected = (customer: LoyaltyCustomer): PromotionSelectedCustomer | null => {
  const memberId = resolveMemberIdForCurrentTenant(customer);
  if (!memberId) return null;
  return {
    memberId,
    customerCode: customer.customerCode,
    phone: customer.phone?.trim() || '-',
    status: customer.status,
  };
};

export const LoyaltyCustomerPickerDialog = ({ open, onClose, initialSelected, onApply }: LoyaltyCustomerPickerDialogProps) => {
  if (!open) return null;
  return <LoyaltyCustomerPickerDialogContent onClose={onClose} initialSelected={initialSelected} onApply={onApply} />;
};

const LoyaltyCustomerPickerDialogContent = ({
  onClose,
  initialSelected,
  onApply,
}: {
  onClose: () => void;
  initialSelected: PromotionSelectedCustomer[];
  onApply: (next: PromotionSelectedCustomer[]) => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState<Map<string, PromotionSelectedCustomer>>(() => new Map(initialSelected.map((item) => [item.memberId, item])));

  useEffect(() => {
    setSelectedMap(new Map(initialSelected.map((item) => [item.memberId, item])));
  }, [initialSelected]);

  const listQuery = useMemo(() => {
    const tenantCode = getTenantCodeHeader();
    return {
      page: 1,
      take: 50,
      keyword: search.trim() || undefined,
      tenantCodes: tenantCode || undefined,
    };
  }, [search]);

  const { data, isLoading } = useSWR(['promotion-audience-loyalty-customers', listQuery] as const, () => listLoyaltyCustomers(listQuery), { revalidateOnFocus: false });

  const rows = useMemo(() => data?.list ?? [], [data?.list]);

  const toggleCustomer = useCallback((customer: LoyaltyCustomer, checked: boolean) => {
    const mapped = mapCustomerToSelected(customer);
    if (!mapped) return;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (checked) next.set(mapped.memberId, mapped);
      else next.delete(mapped.memberId);
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    onApply(Array.from(selectedMap.values()));
    onClose();
  }, [onApply, onClose, selectedMap]);

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm khách hàng"
      maxWidth="sm"
      buttonLeft={{
        content: 'Huỷ',
        variant: 'outlined',
        onClick: onClose,
        ...promotionListButtonPermission('edit', 'Hủy chọn khách hàng', 'api_promotion_draft_update'),
      }}
      buttonRight={{
        content: 'Áp dụng',
        variant: 'contained',
        onClick: handleApply,
        ...promotionListButtonPermission('edit', 'Áp dụng chọn khách hàng', 'api_promotion_draft_update'),
      }}
    >
      <Stack spacing={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)', display: 'flex', flexDirection: 'column' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo mã khách hàng, số điện thoại..." onDebouncedChange={setSearch} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flexShrink: 0 }} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', flexShrink: 0 }}>Đã chọn: {selectedMap.size} khách hàng</Typography>
        <Stack
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={20} />
            </Stack>
          ) : rows.length === 0 ? (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không tìm thấy khách hàng phù hợp.</Typography>
            </Stack>
          ) : (
            rows.map((customer) => {
              const mapped = mapCustomerToSelected(customer);
              const selectable = Boolean(mapped);
              const checked = mapped ? selectedMap.has(mapped.memberId) : false;
              return (
                <StackRowAlignCenter
                  key={customer.loyaltyCustomerId}
                  gap={1.5}
                  onClick={() => {
                    if (!selectable) return;
                    toggleCustomer(customer, !checked);
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F3F4F6',
                    cursor: selectable ? 'pointer' : 'default',
                    opacity: selectable ? 1 : 0.55,
                    '&:last-of-type': { borderBottom: 'none' },
                    '&:hover': selectable ? { bgcolor: '#F9FAFB' } : undefined,
                  }}
                >
                  <Checkbox size="small" checked={checked} disabled={!selectable} tabIndex={-1} disableRipple sx={{ pointerEvents: 'none' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 600 }}>{customer.customerCode}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>
                      SĐT: {customer.phone?.trim() || '-'} · {formatLoyaltyCustomerStatusLabel(customer.status)}
                    </Typography>
                    {!selectable ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>Không có memberId cho tenant hiện tại</Typography> : null}
                  </Box>
                </StackRowAlignCenter>
              );
            })
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};
