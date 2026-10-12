import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import { Box, CircularProgress, List, ListItemButton, ListItemText, Paper, Popover, Stack, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { getOrderCustomersByPhone } from '../../../../apis/order';
import type { IOrderCustomerByPhoneItem } from '../../../../apis/order';
import { SelectInput, SearchInput, TextInput } from '../../../../components/form';
import type { CreateOrderFormValues, FieldOption } from '../create-order.interface';
import { isValidVnMobile10, normalizeVnPhone } from '../../../../common/utils/order/create-order.utils';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from './create-order-form.shared';

const PHONE_LOOKUP_DEBOUNCE_MS = 420;

const displayCustomerLine = (c: IOrderCustomerByPhoneItem) => {
  const fn = c.firstName?.trim() ?? '';
  const name = fn || '—';
  return { name, sub: [c.phone, c.email].filter(Boolean).join(' · ') };
};

export interface CreateOrderFormCustomerPartProps {
  control: Control<CreateOrderFormValues>;
  errors: FieldErrors<CreateOrderFormValues>;
  pickCustomerFromPhoneLookup: (item: IOrderCustomerByPhoneItem, normalized: string) => void;
  manualOrderOptions: FieldOption[];
  orderSourceOptions: FieldOption[];
}

export const CreateOrderFormCustomerPart = memo(function CreateOrderFormCustomerPart({
  control,
  errors,
  pickCustomerFromPhoneLookup,
  manualOrderOptions,
  orderSourceOptions,
}: CreateOrderFormCustomerPartProps) {
  const crmSearch = useWatch({ control, name: 'crmSearch' });
  // const receiverPhone = useWatch({ control, name: 'receiverPhone' });

  const crmAnchorRef = useRef<HTMLDivElement | null>(null);
  const phoneAnchorRef = useRef<HTMLDivElement | null>(null);
  /** Popover đang mở do ô CRM hay ô SĐT — tránh effect này đóng menu của effect kia khi ô còn lại rỗng. */
  const phoneMenuSourceRef = useRef<'crm' | 'phone' | null>(null);
  /** Sau khi chọn khách, form cập nhật crmSearch/receiverPhone — bỏ qua 1 lần auto-lookup để popover không mở lại. */
  const skipCrmLookupOnceRef = useRef(false);
  const skipPhoneLookupOnceRef = useRef(false);

  const [phoneMenuAnchor, setPhoneMenuAnchor] = useState<HTMLElement | null>(null);
  const [phoneMenuItems, setPhoneMenuItems] = useState<IOrderCustomerByPhoneItem[]>([]);
  const [phoneMenuNormalized, setPhoneMenuNormalized] = useState('');
  const [phoneMenuLoading, setPhoneMenuLoading] = useState(false);

  const closePhoneMenu = useCallback(() => {
    phoneMenuSourceRef.current = null;
    setPhoneMenuAnchor(null);
    setPhoneMenuItems([]);
    setPhoneMenuNormalized('');
    setPhoneMenuLoading(false);
  }, []);

  const runPhoneLookup = useCallback(
    async (normalized: string, anchor: HTMLElement | null, source: 'crm' | 'phone') => {
      if (!anchor) return;
      setPhoneMenuLoading(true);
      setPhoneMenuAnchor(anchor);
      try {
        const list = await getOrderCustomersByPhone(normalized);
        if (list.length === 0) {
          closePhoneMenu();
          return;
        }
        phoneMenuSourceRef.current = source;
        setPhoneMenuNormalized(normalized);
        setPhoneMenuItems(list);
        setPhoneMenuAnchor(anchor);
      } catch {
        closePhoneMenu();
      } finally {
        setPhoneMenuLoading(false);
      }
    },
    [closePhoneMenu],
  );

  /** Chỉ re-fetch theo ô CRM: không fallback sang receiverPhone (tránh gõ tên/chữ mà vẫn gọi API bằng SĐT cũ). */
  useEffect(() => {
    if (skipCrmLookupOnceRef.current) {
      skipCrmLookupOnceRef.current = false;
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const normalized = normalizeVnPhone(String(crmSearch ?? ''));
      const anchor = crmAnchorRef.current;
      if (!normalized || !anchor) {
        if (!cancelled) {
          const crmTrim = String(crmSearch ?? '').trim();
          if (crmTrim !== '' || phoneMenuSourceRef.current === 'crm') {
            closePhoneMenu();
          }
        }
        return;
      }
      if (!cancelled) setPhoneMenuLoading(true);
      if (!cancelled) setPhoneMenuAnchor(anchor);
      try {
        const list = await getOrderCustomersByPhone(normalized);
        if (cancelled) return;
        if (list.length === 0) {
          closePhoneMenu();
          return;
        }
        phoneMenuSourceRef.current = 'crm';
        setPhoneMenuNormalized(normalized);
        setPhoneMenuItems(list);
        setPhoneMenuAnchor(anchor);
      } catch {
        if (!cancelled) closePhoneMenu();
      } finally {
        if (!cancelled) setPhoneMenuLoading(false);
      }
    }, PHONE_LOOKUP_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [crmSearch, closePhoneMenu]);

  const handlePick = useCallback(
    (item: IOrderCustomerByPhoneItem) => {
      if (!phoneMenuNormalized) return;
      skipCrmLookupOnceRef.current = true;
      skipPhoneLookupOnceRef.current = true;
      pickCustomerFromPhoneLookup(item, phoneMenuNormalized);
      closePhoneMenu();
    },
    [closePhoneMenu, phoneMenuNormalized, pickCustomerFromPhoneLookup],
  );

  const popoverOpen = Boolean(phoneMenuAnchor) && (phoneMenuLoading || phoneMenuItems.length > 0);

  return (
    <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
      <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>
        <PersonOutlineOutlined fontSize="small" sx={{ color: '#6B7280' }} /> Thông tin khách hàng
      </Typography>
      <Box ref={crmAnchorRef} sx={{ mb: 2 }}>
        <Controller
          control={control}
          name="crmSearch"
          render={({ field }) => (
            <SearchInput
              label="Tìm khách theo SĐT"
              placeholder="Nhập SĐT 10 số — danh sách hiện ngay bên dưới"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const n = normalizeVnPhone(String(field.value ?? ''));
                if (!n) return;
                e.preventDefault();
                void runPhoneLookup(n, crmAnchorRef.current, 'crm');
              }}
            />
          )}
        />
      </Box>

      <Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }}>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'Vui lòng nhập họ và tên',
              // validate: (v) => isValidPersonName(v) || 'Họ và tên không hợp lệ',
            }}
            render={({ field, fieldState }) => (
              <TextInput
                requiredMark
                label="Họ và tên"
                placeholder="Nguyễn Văn An"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Box ref={phoneAnchorRef} sx={{ width: '100%' }}>
            <Controller
              control={control}
              name="receiverPhone"
              rules={{
                required: 'Vui lòng nhập số điện thoại',
                validate: (v) => isValidVnMobile10(v) || 'Số điện thoại không hợp lệ',
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  requiredMark
                  label="Số điện thoại"
                  placeholder="0901234567"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </Box>
        </Stack>
        <Controller
          control={control}
          name="contactEmail"
          rules={{
            validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ',
          }}
          render={({ field }) => (
            <TextInput
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              error={Boolean(errors.contactEmail)}
              errorMessage={errors.contactEmail?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="source"
          rules={{ required: 'Vui lòng chọn nguồn đơn hàng' }}
          render={({ field, fieldState }) => (
            <SelectInput
              requiredMark
              label="Nguồn đơn hàng"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Chọn nguồn đơn hàng"
              options={orderSourceOptions}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="purpose"
          rules={{ required: 'Vui lòng chọn loại đơn' }}
          render={({ field }) => (
            <SelectInput
              requiredMark
              label="Loại đơn"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Chọn loại đơn"
              options={manualOrderOptions}
              error={Boolean(errors.purpose)}
              helperText={errors.purpose?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <TextInput label="Ghi chú khách hàng" multiline minRows={3} placeholder="Ghi chú về khách hàng (nếu có)..." value={field.value} onChange={(e) => field.onChange(e.target.value)} />
          )}
        />
      </Stack>

      <Popover
        open={popoverOpen}
        anchorEl={phoneMenuAnchor}
        onClose={closePhoneMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 0.5,
              minWidth: phoneMenuAnchor ? Math.min(phoneMenuAnchor.offsetWidth, 400) : 280,
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
        {phoneMenuLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <List disablePadding sx={{ overflow: 'auto', maxHeight: 260 }}>
            {phoneMenuItems.map((c) => {
              const { name, sub } = displayCustomerLine(c);
              return (
                <ListItemButton key={c.id} onClick={() => handlePick(c)} sx={{ alignItems: 'flex-start', py: 1.25 }}>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{name}</Typography>}
                    secondary={
                      <Typography component="span" sx={{ fontSize: 12, color: '#6B7280', display: 'block', mt: 0.25 }}>
                        {sub}
                      </Typography>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Popover>
    </Paper>
  );
});
