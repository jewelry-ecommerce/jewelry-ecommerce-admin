import CloseRounded from '@mui/icons-material/CloseRounded';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyboardReturnOutlined from '@mui/icons-material/KeyboardReturnOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import SupervisedUserCircleOutlined from '@mui/icons-material/SupervisedUserCircleOutlined';
import { Alert, Avatar, Box, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { getOrderDetail, type IOrder, type IOrderReturnLineItem, type IOrderReturnListItem } from '../../../../apis/order';
import { getReturnLineUnitPrice } from '../../../../common/constant/order/order.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency, parseAmount } from '../../../../common/utils/number.utils';
import { CustomButton, PermissionIconButton } from '../../../../components/button';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

const DIALOG_PAPER_SX = {
  bgcolor: '#FFFFFF',
  borderRadius: '16px',
  maxWidth: 1152,
  width: '100%',
  maxHeight: 'min(90dvh, 880px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
} as const;

const DIALOG_SLOT_PROPS = {
  paper: { sx: DIALOG_PAPER_SX },
  backdrop: {
    sx: {
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
    },
  },
  transition: {
    timeout: 200,
  },
} as const;

const SECTION_OUTER_SX = {
  bgcolor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  p: 2,
  mb: 2,
  mt: 2,
} as const;

const INNER_CARD_SX = {
  bgcolor: '#FAFAFA',
  borderRadius: '10px',
  border: '1px solid #E5E7EB',
  p: 2,
  mb: 1.5,
} as const;

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#FFFFFF',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
} as const;

const PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'] as const;
const WARDS_HCM = ['Thủ Đức', 'Quận 1', 'Quận 3', 'Quận 7'] as const;
const WAREHOUSES = [{ value: 'wh-central', label: 'Kho 200 Nguyễn Văn Bá' }] as const;
const CARRIERS = ['GHN'] as const;

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
      <Box sx={{ color: '#475467', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{title}</Typography>
    </Stack>
  );
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} sx={{ py: 1 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085', flexShrink: 0 }}>{label}:</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, textAlign: 'right' }}>{value}</Typography>
    </Stack>
  );
}

function getReturnLineDisplayAmount(line: IOrderReturnLineItem): number {
  const unit = getReturnLineUnitPrice(line);
  if (unit > 0) return unit * Math.max(line.quantity, 0);
  const lt = parseAmount(line.lineTotal);
  if (lt > 0) return lt;
  return 0;
}

function getCustomerDisplayName(row: IOrderReturnListItem, order: IOrder | null): string {
  const fromRow = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
  if (fromRow) return fromRow;
  if (row.customerName?.trim()) return row.customerName.trim();
  const snap = order?.shippingAddressSnapshot;
  if (snap) {
    const n = [snap.firstName, snap.lastName].filter(Boolean).join(' ').trim();
    if (n) return n;
  }
  return '—';
}

const SELECT_MENU_PROPS = {
  disableScrollLock: true,
  slotProps: {
    paper: {
      sx: { maxHeight: 280 },
    },
  },
} as const;

const ReturnLineRow = memo(function ReturnLineRow({ line }: { line: IOrderReturnLineItem }) {
  const amount = getReturnLineDisplayAmount(line);
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        p: 1.5,
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        bgcolor: '#FFFFFF',
      }}
    >
      <Avatar variant="rounded" src={line.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="" imgProps={{ loading: 'lazy' }} sx={{ width: 56, height: 56, borderRadius: '8px', bgcolor: '#F2F4F7' }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{line.productName}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.25 }}>{line.skuCode}</Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>SL: {line.quantity}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{formatCurrency(amount)} đ</Typography>
      </Stack>
    </Stack>
  );
});

type RecallReadOnlyProps = {
  row: IOrderReturnListItem;
  order: IOrder | null;
  loading: boolean;
  returnItems: IOrderReturnLineItem[];
  orderCodeLabel: string;
};

const RecallReadOnlySections = memo(function RecallReadOnlySections({ row, order, loading, returnItems, orderCodeLabel }: RecallReadOnlyProps) {
  return (
    <>
      <Box sx={SECTION_OUTER_SX}>
        <SectionHeader icon={<InfoOutlined sx={{ ...TYPOGRAPHY_STYLES.base.semibold }} />} title="Thông tin đơn hàng" />
        <KeyValueRow label="Mã đơn" value={order ? orderCodeLabel : loading ? 'Đang tải…' : '—'} />
        <KeyValueRow label="Khách hàng" value={getCustomerDisplayName(row, order)} />
      </Box>

      <Box sx={SECTION_OUTER_SX}>
        <SectionHeader icon={<KeyboardReturnOutlined sx={{ fontSize: 20 }} />} title="Sản phẩm trả" />
        <Stack spacing={1.5}>
          {returnItems.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Không có dòng sản phẩm trả.</Typography>
          ) : (
            returnItems.map((line) => <ReturnLineRow key={line.id} line={line} />)
          )}
        </Stack>
      </Box>
    </>
  );
});

export interface ReturnExchangesRecallOrderDialogPartProps {
  open: boolean;
  row: IOrderReturnListItem | null;
  onClose: () => void;
  /** Sau khi gửi form thành công (stub hoặc API thật). */
  onSubmitted?: () => void;
}

export const ReturnExchangesRecallOrderDialogPart = ({ open, row, onClose, onSubmitted }: ReturnExchangesRecallOrderDialogPartProps) => {
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pickupProvince, setPickupProvince] = useState('');
  const [pickupWard, setPickupWard] = useState('');
  const [pickupAddressLine, setPickupAddressLine] = useState('');
  const [receiveWarehouse, setReceiveWarehouse] = useState('wh-central');
  const [receiveAddressLine, setReceiveAddressLine] = useState('');
  const [carrier, setCarrier] = useState('GHN');
  const [shipperNote, setShipperNote] = useState('');

  const resetLocalForm = useCallback(() => {
    setPickupProvince('');
    setPickupWard('');
    setPickupAddressLine('');
    setReceiveWarehouse('wh-central');
    setReceiveAddressLine('');
    setCarrier('GHN');
    setShipperNote('');
  }, []);

  useEffect(() => {
    if (!open || !row?.orderId) {
      setOrder(null);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setOrder(null);
    setPickupProvince('');
    setPickupWard('');
    setPickupAddressLine('');
    setReceiveWarehouse('wh-central');
    setReceiveAddressLine('');
    setCarrier('GHN');
    setShipperNote('');

    void (async () => {
      try {
        const data = await getOrderDetail(row.orderId);
        if (cancelled) return;
        setOrder(data);
        const snap = data.shippingAddressSnapshot;
        if (snap?.provinceName?.trim()) setPickupProvince(snap.provinceName.trim());
        if (snap?.wardName?.trim()) setPickupWard(snap.wardName.trim());
        if (snap?.addressLine?.trim()) setPickupAddressLine(snap.addressLine.trim());
      } catch (e) {
        if (!cancelled) {
          setLoadError((e as { message?: string })?.message || 'Không tải được chi tiết đơn hàng.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, row?.orderId]);

  const returnItems: IOrderReturnLineItem[] = useMemo(() => row?.returnItems ?? [], [row]);

  const provinceOptions = useMemo(() => {
    const base: string[] = [...PROVINCES];
    const extra = order?.shippingAddressSnapshot?.provinceName?.trim();
    if (extra && !base.includes(extra)) return [extra, ...base];
    return base;
  }, [order]);

  const wardOptions = useMemo(() => {
    const base: string[] = [...WARDS_HCM];
    const extra = order?.shippingAddressSnapshot?.wardName?.trim();
    if (extra && !base.includes(extra)) return [extra, ...base];
    return base;
  }, [order]);

  const codAmount = useMemo(() => {
    const fee = order?.shippingFee;
    const n = parseAmount(fee ?? 0);
    return n > 0 ? n : 20000;
  }, [order]);

  const orderCodeLabel = order?.orderCode ?? '—';

  const handleClose = useCallback(() => {
    if (submitting) return;
    resetLocalForm();
    onClose();
  }, [onClose, resetLocalForm, submitting]);

  const formValid = pickupProvince.trim() && pickupWard.trim() && pickupAddressLine.trim() && receiveWarehouse.trim() && receiveAddressLine.trim() && carrier.trim();

  const handleSubmit = useCallback(async () => {
    if (!formValid || !row) return;
    setSubmitting(true);
    try {
      // TODO: kết nối API tạo lệnh thu hồi có payload vận chuyển khi BE sẵn sàng.
      await new Promise((r) => setTimeout(r, 400));
      onSubmitted?.();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [formValid, handleClose, onSubmitted, row]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} slotProps={DIALOG_SLOT_PROPS}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #EAECF0',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold }}>Tạo lệnh thu hồi</Typography>
        <PermissionIconButton onClick={handleClose} disabled={submitting} size="small" sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 24 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          minHeight: 0,
          bgcolor: '#FFFFFF',
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading ? <LinearProgress sx={{ borderRadius: 1, mb: 2 }} /> : null}
        {loadError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        ) : null}

        {!loadError && row ? (
          <>
            <RecallReadOnlySections row={row} order={order} loading={loading} returnItems={returnItems} orderCodeLabel={orderCodeLabel} />

            <Box sx={SECTION_OUTER_SX}>
              <SectionHeader icon={<LocalShippingOutlined sx={{ fontSize: 20 }} />} title="Thông tin vận chuyển" />

              <Box sx={INNER_CARD_SX}>
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }}>
                  <PlaceOutlined sx={{ fontSize: 18, color: '#475467' }} />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Địa chỉ lấy hàng</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <FormControl fullWidth size="small" required sx={FIELD_SX}>
                      <InputLabel>Tỉnh/Thành phố *</InputLabel>
                      <Select label="Tỉnh/Thành phố *" value={pickupProvince || ''} onChange={(e) => setPickupProvince(String(e.target.value))} MenuProps={SELECT_MENU_PROPS}>
                        {provinceOptions.map((p) => (
                          <MenuItem key={p} value={p}>
                            {p}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" required sx={FIELD_SX}>
                      <InputLabel>Phường/Xã *</InputLabel>
                      <Select label="Phường/Xã *" value={pickupWard || ''} onChange={(e) => setPickupWard(String(e.target.value))} MenuProps={SELECT_MENU_PROPS}>
                        {wardOptions.map((w) => (
                          <MenuItem key={w} value={w}>
                            {w}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <TextField fullWidth required size="small" label="Địa chỉ chi tiết *" value={pickupAddressLine} onChange={(e) => setPickupAddressLine(e.target.value)} sx={FIELD_SX} />
                </Stack>
              </Box>

              <Box sx={{ ...INNER_CARD_SX, mb: 0 }}>
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }}>
                  <PlaceOutlined sx={{ fontSize: 18, color: '#475467' }} />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Địa chỉ nhận hàng</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <FormControl fullWidth size="small" required sx={FIELD_SX}>
                    <InputLabel>Chọn kho nhận hàng *</InputLabel>
                    <Select label="Chọn kho nhận hàng *" value={receiveWarehouse} onChange={(e) => setReceiveWarehouse(String(e.target.value))} displayEmpty MenuProps={SELECT_MENU_PROPS}>
                      <MenuItem value="">
                        <em>Chọn kho</em>
                      </MenuItem>
                      {WAREHOUSES.map((w) => (
                        <MenuItem key={w.value} value={w.value}>
                          {w.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth required size="small" label="Địa chỉ chi tiết *" value={receiveAddressLine} onChange={(e) => setReceiveAddressLine(e.target.value)} sx={FIELD_SX} />
                </Stack>
              </Box>

              <FormControl fullWidth size="small" required sx={{ ...FIELD_SX, mt: 1.5 }}>
                <InputLabel>Đơn vị vận chuyển *</InputLabel>
                <Select label="Đơn vị vận chuyển *" value={carrier} onChange={(e) => setCarrier(String(e.target.value))} MenuProps={SELECT_MENU_PROPS}>
                  {CARRIERS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField fullWidth multiline minRows={3} size="small" label="Ghi chú cho Shipper" value={shipperNote} onChange={(e) => setShipperNote(e.target.value)} sx={{ ...FIELD_SX, mt: 1.5 }} />
            </Box>

            <Box
              sx={{
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                bgcolor: '#FFFBEB',
                px: 2,
                py: 1.5,
                mb: 2,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={1}>
                  <SupervisedUserCircleOutlined sx={{ fontSize: 28, color: '#B45309' }} />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#92400E' }}>Người nhận thanh toán (COD)</Typography>
                </Stack>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.25}>
                  <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#155DFC', lineHeight: 1.2 }}>{formatCurrency(codAmount)}đ</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#EA580C' }}>Người nhận trả phí vận chuyển</Typography>
                </Stack>
              </Stack>
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          flexShrink: 0,
          px: 2.5,
          py: 2,
          borderTop: '1px solid #EAECF0',
          bgcolor: '#FFFFFF',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <CustomButton fullWidth={false} variant="outline" onClick={handleClose} disabled={submitting} sx={{ minWidth: 100 }}>
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={!formValid || loading || Boolean(loadError) || !row || submitting}
          sx={{
            minWidth: 120,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          Tạo đơn
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
