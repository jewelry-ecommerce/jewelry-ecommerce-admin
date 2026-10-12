import { Box, CircularProgress, List, ListItemButton, ListItemText, Popover, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { promotionApi, type PromotionCustomerAudienceItemDto } from '../../../apis';
import { normalizeVnPhone } from '../../../common/utils/order/create-order.utils';
import { SearchInput } from '../../../components/form';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';

const PHONE_LOOKUP_DEBOUNCE_MS = 420;

type PromotionCustomerPhoneLookupProps = {
  disabled?: boolean;
  selectedCustomerIds: string[];
  onAdd: (customer: PromotionCustomerAudienceItemDto) => void;
};

/**
 * UI theo Create Order (SearchInput + debounce + popover).
 * API: promotion by-phone → loyalty internal (không dùng order customers/by-phone).
 */
export const PromotionCustomerPhoneLookup = ({ disabled = false, selectedCustomerIds, onAdd }: PromotionCustomerPhoneLookupProps) => {
  const { showSnackbar } = useSnackbar();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const skipLookupOnceRef = useRef(false);
  const lookupRequestIdRef = useRef(0);

  const [phone, setPhone] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItems, setMenuItems] = useState<PromotionCustomerAudienceItemDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuItems([]);
    setMenuLoading(false);
  }, []);

  const runLookup = useCallback(
    async (normalized: string, anchor: HTMLElement | null) => {
      if (!anchor || disabled) return;
      const requestId = ++lookupRequestIdRef.current;
      setMenuLoading(true);
      setMenuAnchor(anchor);
      try {
        const customer = await promotionApi.getPromotionCustomerAudienceByPhone(normalized);
        if (requestId !== lookupRequestIdRef.current) return;
        setMenuItems([customer]);
        setMenuAnchor(anchor);
      } catch {
        if (requestId !== lookupRequestIdRef.current) return;
        closeMenu();
      } finally {
        if (requestId === lookupRequestIdRef.current) setMenuLoading(false);
      }
    },
    [closeMenu, disabled],
  );

  useEffect(() => {
    if (skipLookupOnceRef.current) {
      skipLookupOnceRef.current = false;
      return;
    }
    if (disabled) {
      closeMenu();
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const normalized = normalizeVnPhone(phone);
      if (!normalized || !anchorRef.current) {
        if (!cancelled) closeMenu();
        return;
      }
      if (!cancelled) void runLookup(normalized, anchorRef.current);
    }, PHONE_LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phone, disabled, closeMenu, runLookup]);

  const handlePick = (customer: PromotionCustomerAudienceItemDto) => {
    if (selectedCustomerIds.includes(customer.customerId)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Khách hàng này đã có trong danh sách áp dụng.',
      });
      return;
    }
    skipLookupOnceRef.current = true;
    onAdd(customer);
    setPhone('');
    closeMenu();
    showSnackbar({
      type: SnackbarType.SUCCESS,
      message: 'Đã thêm khách hàng vào danh sách áp dụng.',
    });
  };

  const popoverOpen = Boolean(menuAnchor) && (menuLoading || menuItems.length > 0);

  return (
    <>
      <Box ref={anchorRef}>
        <SearchInput
          label="Tìm khách theo SĐT"
          placeholder="Nhập SĐT 10 số — danh sách hiện ngay bên dưới"
          value={phone}
          disabled={disabled}
          onChange={(event) => setPhone(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            const normalized = normalizeVnPhone(phone);
            if (!normalized) return;
            event.preventDefault();
            void runLookup(normalized, anchorRef.current);
          }}
        />
      </Box>

      <Popover
        open={popoverOpen}
        anchorEl={menuAnchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 0.5,
              minWidth: menuAnchor ? Math.min(menuAnchor.offsetWidth, 400) : 280,
              maxWidth: 440,
              maxHeight: 280,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
            },
          },
        }}
        disableRestoreFocus
      >
        {menuLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <List disablePadding sx={{ overflow: 'auto', maxHeight: 260 }}>
            {menuItems.map((customer) => (
              <ListItemButton key={customer.customerId} onClick={() => handlePick(customer)} sx={{ alignItems: 'flex-start', py: 1.25 }}>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{customer.fullName?.trim() || customer.memberCode || customer.customerId}</Typography>}
                  secondary={
                    <Typography component="span" sx={{ fontSize: 12, color: '#6B7280', display: 'block', mt: 0.25 }}>
                      {[customer.phone, customer.memberCode].filter(Boolean).join(' · ')}
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};
