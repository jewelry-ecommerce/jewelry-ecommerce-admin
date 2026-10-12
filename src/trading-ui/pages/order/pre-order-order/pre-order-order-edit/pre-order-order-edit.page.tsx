import { CloseRounded, DeleteOutlineOutlined, LocalShippingOutlined, SaveOutlined } from '@mui/icons-material';
import { Avatar, Box, Divider, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { MarkerPin01 } from '@untitledui/icons';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { preOrderOrderApi, type PreOrderOrderItem } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { formatCurrency, parseAmount } from '../../../../common/utils/number.utils';
import { isValidVnMobile10, normalizeVnPhone } from '../../../../common/utils/order/create-order.utils';
import { CustomButton } from '../../../../components/button';
import { SelectInput, TextInput } from '../../../../components/form';
import { DetailPageBackBar } from '../../../../components/page-header';
import { StackRowAlignCenter } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getPreOrderOrderDetailPath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { CancelOrderDialog } from '../../components/cancel-order-dialog';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from '../../create-order/parts/create-order-form.shared';
import { getOrderSourceLabel } from '../../order-detail/order-detail.helpers';
import { OrderDetailErrorState, OrderDetailLoadingState } from '../../order-detail/parts/order-detail-loading-error.part';
import { preOrderOrderButtonPermission } from '../pre-order-order-permission.constants';
import { canCancelPreOrderOrder, canEditPreOrderOrder, formatPreOrderAddress, getPreOrderCustomerDisplayName, getPreOrderCustomerEmail } from '../pre-order-order.utils';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

type PreOrderOrderEditFormValues = {
  customerPhone: string;
};

const PAGE_BG = '#F5F5F5';

const resolveItemSalePrice = (item: PreOrderOrderItem): number => {
  const fromDisplay = item.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (typeof fromDisplay === 'number') return fromDisplay / 100;
  return parseAmount(item.salePrice ?? item.unitPrice);
};

const resolveItemComparePrice = (item: PreOrderOrderItem): number | null => {
  const fromDisplay = item.customerDisplayPrice?.compareAtPriceAfterTaxMinor;
  if (typeof fromDisplay === 'number') return fromDisplay / 100;
  const unit = parseAmount(item.unitPrice);
  const sale = parseAmount(item.salePrice);
  if (unit > 0 && sale > 0 && unit !== sale) return unit;
  return null;
};

const ReadonlyField = ({ label, value, multiline = false, minRows = 1 }: { label: string; value: string; multiline?: boolean; minRows?: number }) => (
  <TextInput label={label} value={value} disabled fullWidth multiline={multiline} minRows={minRows} />
);

const PreOrderOrderEditPage = () => {
  const { preOrderId } = useParams<{ preOrderId: string }>();
  if (!preOrderId) return <Navigate to={ROUTE_PATH.PRE_ORDER_ORDER} replace />;
  return <PreOrderOrderEditPageContent preOrderId={preOrderId} />;
};

function PreOrderOrderEditPageContent({ preOrderId }: { preOrderId: string }) {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const detailSwr = useSWR(['pre-order-order-detail', preOrderId], () => preOrderOrderApi.getPreOrderOrderDetail(preOrderId), { revalidateOnFocus: false });
  const order = detailSwr.data;

  const form = useForm<PreOrderOrderEditFormValues>({
    defaultValues: { customerPhone: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!order) return;
    form.reset({
      customerPhone: order.customerPhone || order.shippingAddressSnapshot?.receiverPhone || '',
    });
  }, [form, order]);

  const watchedPhone = useWatch({ control: form.control, name: 'customerPhone' }) ?? '';

  const changeSummary = useMemo(() => {
    if (!order) return [];
    const originalPhone = order.customerPhone || order.shippingAddressSnapshot?.receiverPhone || '';
    const nextPhone = watchedPhone.trim();
    if ((originalPhone || '') === nextPhone) return [];
    return [{ label: 'Số điện thoại', from: originalPhone || '', to: nextPhone || '' }];
  }, [order, watchedPhone]);

  const handleSave = form.handleSubmit(async (values) => {
    if (!order) return;
    const phone = normalizeVnPhone(values.customerPhone);
    if (!phone) {
      form.setError('customerPhone', { type: 'validate', message: 'SĐT phải là số di động Việt Nam 10 số' });
      return;
    }
    setSaving(true);
    try {
      await preOrderOrderApi.updatePreOrderOrderReceiverPhone(order.id, { phone });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật số điện thoại' });
      navigate(getPreOrderOrderDetailPath(order.id));
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  });

  if (detailSwr.isLoading) return <OrderDetailLoadingState />;
  if (detailSwr.error || !order) {
    return <OrderDetailErrorState message={getErrorMessage(detailSwr.error) || 'Không tìm thấy đơn đặt trước'} onBackToList={() => navigate(ROUTE_PATH.PRE_ORDER_ORDER)} />;
  }

  if (!canEditPreOrderOrder(order.status)) {
    return <Navigate to={getPreOrderOrderDetailPath(order.id)} replace />;
  }

  const shipping = order.shippingAddressSnapshot;
  const warehouse = order.warehouseSnapshot;
  const warehouseName = warehouse?.warehouseName?.trim() || '';
  const warehouseDetailRaw = formatPreOrderAddress([warehouse?.addressLine, warehouse?.wardName, warehouse?.provinceName]);
  const warehouseDetail = warehouseDetailRaw === '—' ? '' : warehouseDetailRaw;
  const provinceName = shipping?.provinceName?.trim() || '';
  const wardName = shipping?.wardName?.trim() || '';
  const customerDetailAddress = shipping?.addressLine?.trim() || '';
  const customerNameRaw = getPreOrderCustomerDisplayName(order);
  const customerName = customerNameRaw === '—' ? '' : customerNameRaw;
  const sourceLabel = order.source ? getOrderSourceLabel(order.source as never) : '';
  const emailValue = getPreOrderCustomerEmail(order);
  const customerNoteValue = order.customerNote || '';
  const internalNotes = order.internalNotes ?? [];
  const hasPhoneChange = changeSummary.length > 0;
  const saveDisabled = saving || !hasPhoneChange || Boolean(form.formState.errors.customerPhone);

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        bgcolor: PAGE_BG,
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {saving ? <LinearProgress sx={{ height: 2, flexShrink: 0 }} /> : null}

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: '1px solid #E5E7EB', bgcolor: '#FFFFFF', flexShrink: 0 }}>
        <DetailPageBackBar
          label="Quay lại danh sách"
          onBack={() => navigate(ROUTE_PATH.PRE_ORDER_ORDER)}
          barSx={{ px: 0, py: 0, borderBottom: 'none' }}
          {...preOrderOrderButtonPermission('view', 'Quay lại danh sách đơn đặt trước', 'api_pre_order_order_list')}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2} sx={{ mt: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 800, color: '#111827', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Chỉnh sửa đơn hàng
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', mt: 0.25, fontSize: 14 }}>Chỉ được sửa số điện thoại. Các trường còn lại khóa theo quy tắc Pre-order.</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              '& .MuiButton-root': {
                width: 'fit-content',
                minWidth: 'fit-content !important',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              },
            }}
          >
            {canCancelPreOrderOrder(order.status) ? (
              <CustomButton
                fullWidth={false}
                variant="outline"
                startIcon={<DeleteOutlineOutlined sx={{ fontSize: 18 }} />}
                onClick={() => setCancelOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  borderWidth: 1.5,
                  borderColor: '#F87171',
                  color: '#B42318',
                }}
                {...preOrderOrderButtonPermission('cancel', 'Hủy đơn đặt trước', 'api_pre_order_order_cancel')}
              >
                Hủy đơn
              </CustomButton>
            ) : null}
            <CustomButton
              fullWidth={false}
              variant="outline"
              startIcon={<CloseRounded sx={{ fontSize: 18 }} />}
              onClick={() => navigate(getPreOrderOrderDetailPath(order.id))}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                color: '#111827',
                borderColor: '#D1D5DB',
                borderWidth: 1.5,
                '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
              }}
            >
              Hủy
            </CustomButton>
            <CustomButton
              fullWidth={false}
              variant="primary"
              startIcon={<SaveOutlined sx={{ fontSize: 18 }} />}
              disabled={saveDisabled}
              onClick={() => void handleSave()}
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
              {...preOrderOrderButtonPermission('edit', 'Lưu thay đổi đơn đặt trước', 'api_pre_order_order_update')}
            >
              Lưu thay đổi
            </CustomButton>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 2, md: 3 }, py: 2.5 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems="flex-start">
          <Stack gap={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
              <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>Thông tin khách hàng</Typography>
              <Stack gap={2}>
                <ReadonlyField label="Họ tên" value={customerName} />
                <Controller
                  name="customerPhone"
                  control={form.control}
                  rules={{
                    required: 'Vui lòng nhập số điện thoại',
                    validate: (value) => isValidVnMobile10(value) || 'SĐT phải là số di động Việt Nam 10 số',
                  }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      requiredMark
                      label="Số điện thoại"
                      placeholder="0xxxxxxxxx"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                      inputProps={{ inputMode: 'numeric', maxLength: 11 }}
                    />
                  )}
                />
                <ReadonlyField label="Email" value={emailValue} />
                <ReadonlyField label="Nguồn đơn" value={sourceLabel} />
                <ReadonlyField label="Ghi chú khách hàng" value={customerNoteValue} multiline minRows={3} />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
              <Typography sx={{ ...ORDER_FORM_SECTION_TITLE_SX, mb: 1.5 }}>
                <LocalShippingOutlined sx={{ ...TYPOGRAPHY_STYLES.base.semibold }} />
                Thông tin vận chuyển
              </Typography>
              <Stack gap={1.5}>
                <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5, bgcolor: '#FFFFFF' }}>
                  <StackRowAlignCenter gap={1} mb={2}>
                    <MarkerPin01 size={16} />
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Địa chỉ của kho giao/nhận</Typography>
                  </StackRowAlignCenter>
                  <Stack gap={2}>
                    <SelectInput requiredMark label="Chọn kho giao/nhận" value={warehouseName} options={[{ value: warehouseName, label: warehouseName }]} disabled />
                    <TextInput requiredMark label="Địa chỉ chi tiết" value={warehouseDetail} disabled />
                  </Stack>
                </Box>

                <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5, bgcolor: '#FFFFFF' }}>
                  <StackRowAlignCenter gap={1} mb={2}>
                    <MarkerPin01 size={16} />
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Địa chỉ của khách hàng</Typography>
                  </StackRowAlignCenter>
                  <Stack gap={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                      <SelectInput requiredMark label="Tỉnh/Thành phố" value={provinceName} options={[{ value: provinceName, label: provinceName }]} disabled />
                      <SelectInput requiredMark label="Phường/Xã" value={wardName} options={[{ value: wardName, label: wardName }]} disabled />
                    </Stack>
                    <TextInput requiredMark label="Địa chỉ chi tiết" value={customerDetailAddress} disabled />
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
              <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>Sản phẩm trong đơn</Typography>
              <Stack divider={<Divider flexItem />}>
                {(order.items ?? []).map((item) => {
                  const sale = resolveItemSalePrice(item);
                  const compare = resolveItemComparePrice(item);
                  const lineTotal = parseAmount(item.lineTotal) || sale * item.quantity;
                  return (
                    <Stack key={item.id} direction="row" gap={1.5} alignItems="flex-start" sx={{ py: 1.25 }}>
                      <Avatar variant="rounded" src={item.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={{ width: 56, height: 56, bgcolor: '#F3F4F6' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{item.productName}</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{item.skuCode}</Typography>
                        <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 0.5 }}>
                          {compare != null && compare > sale ? (
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF', textDecoration: 'line-through' }}>{formatCurrency(compare)} đ</Typography>
                          ) : null}
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>{formatCurrency(sale)} đ</Typography>
                        </Stack>
                      </Box>
                      <Stack alignItems="flex-end" gap={0.25}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>SL: {item.quantity}</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(lineTotal)} đ</Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
              <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>Ghi chú nội bộ</Typography>
              {internalNotes.length > 0 ? (
                <Stack gap={1} sx={{ mb: 2 }}>
                  {internalNotes.map((note) => (
                    <Box key={note.id} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{note.content}</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF', mt: 0.5 }}>{[note.createdByName, note.createdAt].filter(Boolean).join(' · ')}</Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF', mb: 2 }}>Chưa có ghi chú nội bộ</Typography>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextInput placeholder="Nhập ghi chú nội bộ..." value="" disabled />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF', mt: 0.75 }}>Chỉ xem ghi chú. Thêm ghi chú nội bộ sẽ nối khi BE sẵn sàng.</Typography>
                </Box>
                <CustomButton fullWidth={false} variant="outline" disabled sx={{ height: 40, borderRadius: '8px' }}>
                  + Thêm
                </CustomButton>
              </Stack>
            </Paper>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              width: { xs: '100%', lg: 320 },
              flexShrink: 0,
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              bgcolor: '#FAFAFA',
              position: { lg: 'sticky' },
              top: { lg: 12 },
              alignSelf: 'flex-start',
            }}
          >
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, fontWeight: 800, color: '#111827', mb: 2 }}>Tóm tắt thay đổi</Typography>
            {changeSummary.length === 0 ? (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF' }}>Chưa có thay đổi nào</Typography>
            ) : (
              <Stack gap={1.5}>
                {changeSummary.map((row) => (
                  <Box key={row.label}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#374151', mb: 0.5 }}>{row.label}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3', textDecoration: 'line-through' }}>{row.from}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#111827', fontWeight: 600 }}>{row.to}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>

      <CancelOrderDialog
        open={cancelOpen}
        orderCode={order.preOrderCode}
        title="Huỷ đơn đặt trước"
        description="Hành động này không thể hoàn tác. Vui lòng chọn lý do hủy đơn."
        confirmLabel="Xác nhận hủy"
        submitting={cancelSubmitting}
        onClose={() => setCancelOpen(false)}
        onConfirm={(payload) => {
          void (async () => {
            setCancelSubmitting(true);
            try {
              await preOrderOrderApi.cancelPreOrderOrder(order.id, payload);
              showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy đơn đặt trước' });
              setCancelOpen(false);
              navigate(ROUTE_PATH.PRE_ORDER_ORDER);
            } catch (error) {
              showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
            } finally {
              setCancelSubmitting(false);
            }
          })();
        }}
      />
    </Box>
  );
}

export default PreOrderOrderEditPage;
